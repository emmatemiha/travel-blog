import axios from 'axios';
import React from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Button, Dialog, DialogContent, DialogContentText, DialogActions, Snackbar } from "@mui/material";
import { useAuthStore } from "../store";
import defaultPfp from '../assets/default_pfp.png'

const Blog = () => {
    const { id } = useParams()
    const [blog, setBlog] = React.useState<any>(null)
    const [reactions, setReactions] = React.useState<Array<any>>([])
    const [comments, setComments] = React.useState<Array<any>>([])
    const [cities, setCities] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [similarBlogs, setSimilarBlogs] = React.useState<Array<any>>([])
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [userReaction, setUserReaction] = React.useState<string | null>(null)
    const [newComment, setNewComment] = React.useState("")
    const [replyingTo, setReplyingTo] = React.useState<number | null>(null)
    const [replyText, setReplyText] = React.useState("")
    const [snackOpen, setSnackOpen] = React.useState(false)
    const [snackMessage, setSnackMessage] = React.useState("")
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const navigate = useNavigate()

    React.useEffect(() => {
        getBlog()
        getReactions()
        getComments()
        getCities()
        getCategories()
    }, [id])

    const getBlog = () => {
        axios.get('http://localhost:4941/api/v1/blogs/' + id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setBlog(response.data)
                getSimilarBlogs(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const deleteBlog = () => {
        axios.delete('http://localhost:4941/api/v1/blogs/' + id, {
            headers: { 'X-Authorization': authToken }
        })
            .then((response) => {
                setSnackMessage("Blog deleted successfully")
                setSnackOpen(true)
                setTimeout(() => navigate('/blogs'), 500)
            }, (error) => {
                setOpenDeleteDialog(false)
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getReactions = () => {
        axios.get('http://localhost:4941/api/v1/blogs/' + id + '/react')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setReactions(response.data)
                getUserReaction(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getUserReaction = (reactionsData: Array<any>) => {
        if (!userId) return
        const found = reactionsData.find((r: any) => r.userId === userId)
        if (found) {
            setUserReaction(found.reaction)
        } else {
            setUserReaction(null)
        }
    }

    const getComments = () => {
        axios.get('http://localhost:4941/api/v1/blogs/' + id + '/comments')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setComments(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCities = () => {
        axios.get('http://localhost:4941/api/v1/blogs/cities')
            .then((response) => {
                setCities(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/blogs/categories')
            .then((response) => {
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCityName = (cityId: number) => {
        const city = cities.find((c: any) => c.cityId === cityId)
        if (city) {
            return city.name
        } else {
            return cityId
        }
    }

    const getCategoryNames = (categoryIds: number[]) => {
        const names = categoryIds.map((id: number) => {
            const category = categories.find((c: any) => c.categoryId === id)
            if (category) {
                return category.name
            } else {
                return id
            }
        })
        return names.join(', ')
    }

    const getReactionCount = (reactionType: string) => {
        return reactions.filter((r: any) => r.reaction === reactionType).length
    }

    const getTopLevelComments = () => {
        return comments.filter((c: any) => c.parentId === null)
    }

    const getReplies = (commentId: number) => {
        return comments
            .filter((c: any) => c.parentId === commentId)
            .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    const getSimilarBlogs = (blogData: any) => {
        const params: any = {
            count: 10
        }
        axios.get('http://localhost:4941/api/v1/blogs', { params: { ...params, cityIds: [blogData.cityId] } })
            .then((response) => {
                const cityBlogs = response.data.blogs

                axios.get('http://localhost:4941/api/v1/blogs', { params: { ...params, categoryIds: blogData.categoryIds } })
                    .then((response) => {
                        const categoryBlogs = response.data.blogs

                        axios.get('http://localhost:4941/api/v1/blogs', { params: { ...params, creatorId: blogData.creatorId } })
                            .then((response) => {
                                const creatorBlogs = response.data.blogs
                                const currentBlogId = Number(id)
                                const allSimilar = [...cityBlogs, ...categoryBlogs, ...creatorBlogs]
                                const unique = allSimilar.filter((b: any, index: number, self: any[]) =>
                                    b.blogId !== currentBlogId &&
                                    self.findIndex((x: any) => x.blogId === b.blogId) === index
                                )
                                setSimilarBlogs(unique.slice(0, 6))
                            })
                    })
            })
    }

    const reactionEmojis: any = {
        REACTION_1: '❤️',
        REACTION_2: '😂',
        REACTION_3: '🤯',
        REACTION_4: '😭',
        REACTION_5: '👌'
    }

    const reactToBlog = (reactionType: string) => {
        if (!authToken) {
            navigate('/login')
            return
        }
        if (userReaction === reactionType) {
            axios.delete('http://localhost:4941/api/v1/blogs/' + id + '/react', {
                headers: { 'X-Authorization': authToken }
            })
                .then(() => {
                    getReactions()
                })
        } else {
            axios.post('http://localhost:4941/api/v1/blogs/' + id + '/react',
                { reaction: reactionType },
                { headers: { 'X-Authorization': authToken } }
            )
                .then(() => {
                    getReactions()
                })
        }
    }

    const postComment = () => {
        if (!authToken) {
            navigate('/login')
            return
        }
        if (newComment === "") return
        axios.post('http://localhost:4941/api/v1/blogs/' + id + '/comments',
            { comment: newComment },
            { headers: { 'X-Authorization': authToken } }
        )
            .then(() => {
                setNewComment("")
                getComments()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const postReply = (parentId: number) => {
        if (!authToken) {
            navigate('/login')
            return
        }
        if (replyText === "") return
        axios.post('http://localhost:4941/api/v1/blogs/' + id + '/comments',
            { comment: replyText, parentId: parentId },
            { headers: { 'X-Authorization': authToken } }
        )
            .then(() => {
                setReplyText("")
                setReplyingTo(null)
                getComments()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const handleDeleteDialogOpen = () => {
        setOpenDeleteDialog(true)
    }

    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false)
    }

    const handleSnackClose = () => {
        setSnackOpen(false)
    }

    if (errorFlag) {
        return (
            <div>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            </div>
        )
    }

    if (!blog) {
        return <div>Loading...</div>
    }

    return (
        <div style={{ background: '#eef2ee', minHeight: '100vh', padding: '20px' }}>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Main blog card */}
                <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>

                    <div style={{ padding: '24px' }}>
                        <div style={{ fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>
                            📍 {getCityName(blog.cityId)} &nbsp;·&nbsp; {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                        </div>

                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#0c2c1b', fontSize: '36px', margin: '0 0 12px', fontWeight: 700, textDecoration: 'underline', marginBottom: '20px', wordBreak: 'break-word', lineHeight: '1.1' }}>
                            {blog.title}
                        </h1>

                        <div
                            onClick={() => navigate('/profile/' + blog.creatorId)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}>
                            <img
                                src={'http://localhost:4941/api/v1/users/' + blog.creatorId + '/image'}
                                alt="Creator"
                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                                onError={(e: any) => { e.target.src = defaultPfp }}
                            />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '15px', wordBreak: 'break-word' }}>
                                By {blog.creatorFirstName} {blog.creatorLastName}
                            </span>
                        </div>

                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', lineHeight: '1.8', color: '#0c2c1b', marginBottom: '20px', wordBreak: 'break-word' }}>
                            {blog.description}
                        </p>

                        <img
                            key={blog.blogId}
                            src={'http://localhost:4941/api/v1/blogs/' + id + '/image'}
                            alt="Blog cover"
                            style={{ width: '100%', maxHeight: '900px', objectFit: 'cover', display: 'block', marginBottom: '28px' }}
                            onError={(e: any) => { e.target.style.display = 'none' }}
                        />

                        <div style={{ fontSize: '15px', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {blog.series && <span><b>Series:</b> {blog.series}</span>}
                            <span><b>Categories:</b> {blog.categoryIds ? getCategoryNames(blog.categoryIds) : ''}</span>
                            <span><b>Unique commenters:</b> {blog.numberOfUniqueCommenters}</span>
                        </div>

                        {userId === blog.creatorId && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center', alignItems: 'center' }}>
                                <Button variant="contained" onClick={() => navigate('/blogs/' + id + '/edit')}
                                    sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, fontFamily: "'DM Sans', sans-serif" }}>
                                    Edit Blog
                                </Button>
                                <Button variant="outlined" color="error" onClick={handleDeleteDialogOpen}
                                    sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    Delete Blog
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reactions + Comments card */}
                <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>

                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', margin: '0 0 12px' }}>Reactions</h2>
                    {blog.creatorId === userId && (
                        <p style={{ color: '#6e6e6e', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>You can't react to your own blog</p>
                    )}
                    {!authToken && (
                        <p style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>
                            <Link to="/login" style={{ color: '#0c2c1b' }}>Log in</Link> to react
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
                        {['REACTION_1', 'REACTION_2', 'REACTION_3', 'REACTION_4', 'REACTION_5'].map((r) => (
                            <Button
                                key={r}
                                variant={userReaction === r ? 'contained' : 'outlined'}
                                onClick={() => reactToBlog(r)}
                                disabled={blog.creatorId === userId}
                                sx={userReaction === r ?
                                    { backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, fontFamily: "'DM Sans', sans-serif" } :
                                    { color: "#0c2c1b", borderColor: "#0c2c1b", fontFamily: "'DM Sans', sans-serif" }}>
                                {reactionEmojis[r]} {getReactionCount(r)}
                            </Button>
                        ))}
                    </div>

                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', margin: '0 0 16px' }}>Comments</h2>

                    {authToken ? (
                        <div style={{ marginBottom: '4px' }}>
                            <textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '8px', border: '1px solid #0c2c1b', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as any, minHeight: '80px', resize: 'none' }}
                            />
                            <Button variant="contained" onClick={postComment}
                                sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, marginTop: '12px', fontFamily: "'DM Sans', sans-serif", marginBottom: '16px' }}>
                                Post Comment
                            </Button>
                        </div>
                    ) : (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', marginBottom: '16px' }}>
                            <Link to="/login" style={{ color: '#0c2c1b' }}>Log in</Link> to leave a comment
                        </p>
                    )}

                    {getTopLevelComments().map((comment: any) => (
                        <div key={comment.commentId} style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '16px', textAlign: 'left' }}>
                            <div
                                onClick={() => navigate('/profile/' + comment.commenterId)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', cursor: 'pointer' }}>
                                <img
                                    src={'http://localhost:4941/api/v1/users/' + comment.commenterId + '/image'}
                                    alt="Commenter"
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                                    onError={(e: any) => { e.target.src = defaultPfp }}
                                />
                                <div>
                                    <span style={{ fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#0c2c1b', wordBreak: 'break-word' }}>
                                        {comment.commenterFirstName} {comment.commenterLastName}
                                    </span>
                                    <span style={{ color: '#6e6e6e', fontSize: '12px', marginLeft: '8px', fontFamily: "'DM Sans', sans-serif", wordBreak: 'break-word' }}>
                                        {new Date(comment.timestamp).toLocaleString('en-NZ')}
                                    </span>
                                </div>
                            </div>
                            <p style={{ color: '#0c2c1b', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', paddingLeft: '42px', wordBreak: 'break-word' }}>
                                {comment.comment}
                            </p>
                            <p style={{ color: '#6e6e6e', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", paddingLeft: '42px', margin: '0 0 4px' }}>
                                {getReplies(comment.commentId).length} {getReplies(comment.commentId).length === 1 ? 'reply' : 'replies'}
                            </p>
                            {authToken && (
                                <Button size="small" onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                                    sx={{ color: "#0c2c1b", fontFamily: "'DM Sans', sans-serif", fontSize: '12px', paddingLeft: '42px' }}>
                                    {replyingTo === comment.commentId ? 'Cancel' : 'Reply'}
                                </Button>
                            )}
                            {replyingTo === comment.commentId && (
                                <div style={{ marginTop: '8px', paddingLeft: '42px' }}>
                                    <textarea
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '8px', border: '1px solid #0c2c1b', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' as any, minHeight: '60px', resize: 'none' }}
                                    />
                                    <Button variant="contained" size="small" onClick={() => postReply(comment.commentId)}
                                        sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>
                                        Post Reply
                                    </Button>
                                </div>
                            )}
                            {getReplies(comment.commentId).length > 0 && (
                                <div style={{ marginLeft: '42px', marginTop: '12px', borderLeft: '2px solid #eee', paddingLeft: '16px' }}>
                                    {getReplies(comment.commentId).map((reply: any) => (
                                        <div key={reply.commentId} style={{ marginBottom: '12px' }}>
                                            <div
                                                onClick={() => navigate('/profile/' + reply.commenterId)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' }}>
                                                <img
                                                    src={'http://localhost:4941/api/v1/users/' + reply.commenterId + '/image'}
                                                    alt="Replier"
                                                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                                                    onError={(e: any) => { e.target.src = defaultPfp }}
                                                />
                                                <span style={{ fontWeight: 600, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#0c2c1b', wordBreak: 'break-word' }}>
                                                    {reply.commenterFirstName} {reply.commenterLastName}
                                                </span>
                                                <span style={{ color: '#6e6e6e', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                                                    {new Date(reply.timestamp).toLocaleString('en-NZ')}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', paddingLeft: '32px', color: '#0c2c1b', wordBreak: 'break-word' }}>
                                                {reply.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Similar blogs card */}
                {similarBlogs.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', margin: '0 0 16px' }}>
                            Want to Read More? You Might Also Like...
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {similarBlogs.map((b: any) => (
                                <div key={b.blogId} style={{ border: '1px solid #0c2c1b', borderRadius: '10px', overflow: 'hidden' }}>
                                    <img
                                        src={'http://localhost:4941/api/v1/blogs/' + b.blogId + '/image'}
                                        alt={b.title}
                                        style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                                        onError={(e: any) => { e.target.style.display = 'none' }}
                                    />

                                    <div style={{ padding: '12px' }}>
                                        <p style={{ margin: '0 0 8px', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: '#0c2c1b', wordBreak: 'break-word', textDecoration: 'underline', lineHeight: '1.1' }}>{b.title}</p>

                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', margin: '0 0 4px' }}>
                                            <img
                                                src={'http://localhost:4941/api/v1/users/' + b.creatorId + '/image'}
                                                alt="Creator"
                                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                                                onError={(e: any) => { e.target.src = defaultPfp }}
                                            />
                                            <p style={{ margin: 0, fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif", wordBreak: 'break-word' }}>
                                                By {b.creatorFirstName} {b.creatorLastName}
                                            </p>
                                        </div>

                                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                                            {new Date(b.creationDate).toLocaleDateString('en-NZ')}
                                        </p>
                                        <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                                            📍 {getCityName(b.cityId)}
                                        </p>
                                        <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                                            {getCategoryNames(b.categoryIds)}
                                        </p>
                                        <p style={{ margin: '0 0 8px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: '#6e6e6e' }}>♡ {b.numReactions} {b.numReactions === 1 ? 'reaction' : 'reactions'}</p>
                                        <Button variant="contained" size="small" component={Link} to={"/blogs/" + b.blogId}
                                            sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, fontFamily: "'DM Sans', sans-serif" }}>
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b' }}>
                        {blog.numberOfUniqueCommenters > 0
                            ? "This blog can't be deleted because it has comments."
                            : "Are you sure you want to delete this blog?"
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteDialogClose}
                        sx={{ color: "#0c2c1b", fontFamily: "'DM Sans', sans-serif" }}>
                        {blog.numberOfUniqueCommenters > 0 ? "Close" : "Cancel"}
                    </Button>
                    {blog.numberOfUniqueCommenters === 0 && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={deleteBlog}
                            sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                            Delete
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                autoHideDuration={3000}
                open={snackOpen}
                onClose={handleSnackClose}
                key={snackMessage}>
                <Alert onClose={handleSnackClose} severity="success" sx={{ width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )

}

export default Blog;