import axios from 'axios';
import React from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { useAuthStore } from "../store";

const Blog = () => {
    const {id} = useParams()
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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id)
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
        axios.delete('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id, {
            headers: { 'X-Authorization': authToken }
        })
            .then((response) => {
                navigate('/blogs')
            }, (error) => {
                setOpenDeleteDialog(false)
                setErrorFlag(true)
                if (error.response && error.response.status === 403) {
                    setErrorMessage("Cannot delete a blog that has comments")
                } else {
                    setErrorMessage(error.toString())
                }
            })
    }

    const getReactions = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/react')
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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/comments')
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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/cities')
            .then((response) => {
                setCities(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/categories')
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
        return comments.filter((c: any) => c.parentId === commentId)
    }

    const getSimilarBlogs = (blogData: any) => {
        const params: any = {
            count: 10
        }
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', { params: {...params, cityIds: [blogData.cityId]} })
            .then((response) => {
                const cityBlogs = response.data.blogs

                axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', { params: {...params, categoryIds: blogData.categoryIds} })
                    .then((response) => {
                        const categoryBlogs = response.data.blogs

                        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', { params: {...params, creatorId: blogData.creatorId} })
                            .then((response) => {
                                const creatorBlogs = response.data.blogs
                                const allSimilar = [...cityBlogs, ...categoryBlogs, ...creatorBlogs]
                                const unique = allSimilar.filter((b: any, index: number, self: any[]) =>
                                    b.blogId !== Number(id) &&
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
            axios.delete('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/react', {
                headers: { 'X-Authorization': authToken }
            })
                .then(() => {
                    getReactions()
                })
        } else {
            axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/react',
                { reaction: reactionType },
                { headers: { 'X-Authorization': authToken }}
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
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/comments',
            { comment: newComment },
            { headers: { 'X-Authorization': authToken }}
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
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/comments',
            { comment: replyText, parentId: parentId },
            { headers: { 'X-Authorization': authToken }}
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
        <div style={{padding: '20px'}}>
            <Button variant="contained" component={Link} to="/blogs"
                sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}>
                Back to Blogs
            </Button>
            <Paper elevation={3} style={{padding: '20px', marginTop: '16px'}}>
                <h1>{blog.title}</h1>

                <img 
                    key={blog.blogId}
                    src={'https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/image'}
                    alt="Blog Image"
                    style={{width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px'}}
                    onError={(e: any) => { e.target.style.display = 'none' }}
                />

                <p><b>Date:</b> {new Date(blog.creationDate).toLocaleDateString('en-NZ')}</p>
                <p><b>Creator:</b> {blog.creatorFirstName} {blog.creatorLastName}</p>
                <p><b>City:</b> {getCityName(blog.cityId)}</p>
                <p><b>Categories:</b> {blog.categoryIds ? getCategoryNames(blog.categoryIds) : ''}</p>
                {blog.series && <p><b>Series:</b> {blog.series}</p>}
                <p><b>Description:</b> {blog.description}</p>
                <p><b>Unique commenters:</b> {blog.numberOfUniqueCommenters}</p>

                {userId === blog.creatorId && (
                    <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                        <Button variant="outlined" onClick={() => navigate('/blogs/' + id + '/edit')}>
                            Edit Blog
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleDeleteDialogOpen}>
                            Delete Blog
                        </Button>
                    </div>
                )}

                <Dialog
                    open={openDeleteDialog}
                    onClose={handleDeleteDialogClose}>
                    <DialogTitle>
                        Delete Blog?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this blog?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        <Button variant="outlined" color="error" onClick={deleteBlog}>Delete</Button>
                    </DialogActions>
                </Dialog>

                <div>
                    <h3>Reactions</h3>
                    {blog.creatorId === userId && (
                        <p style={{color: '#666', fontSize: '14px'}}>You can't react to your own blog</p>
                    )}
                    <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
                        {['REACTION_1', 'REACTION_2', 'REACTION_3', 'REACTION_4', 'REACTION_5'].map((r) => (
                            <Button
                                key={r}
                                variant={userReaction === r ? 'contained' : 'outlined'}
                                onClick={() => reactToBlog(r)}
                                disabled={blog.creatorId === userId}
                                sx={userReaction === r ?
                                    {backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}} :
                                    {color: "#0c2c1b", borderColor: "#0c2c1b"}}>
                                {reactionEmojis[r]} {getReactionCount(r)}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3>Comments</h3>
                    {authToken ? (
                        <div style={{marginBottom: '16px'}}>
                            <textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                style={{width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', boxSizing: 'border-box' as any, minHeight: '80px'}}
                            />
                            <Button variant="contained" onClick={postComment}
                                sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}, marginTop: '8px'}}>
                                Post Comment
                            </Button>
                        </div>
                    ) : (
                        <p><Link to="/login">Log in</Link> to leave a comment</p>
                    )}
                    {getTopLevelComments().map((comment: any) => (
                        <div key={comment.commentId} style={{border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '8px'}}>
                            <p><b>{comment.commenterFirstName} {comment.commenterLastName}</b> · {new Date(comment.timestamp).toLocaleDateString('en-NZ')}</p>
                            <p>{comment.comment}</p>
                            {authToken && (
                                <Button size="small" onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                                    sx={{color: "#0c2c1b"}}>
                                    {replyingTo === comment.commentId ? 'Cancel' : 'Reply'}
                                </Button>
                            )}
                            {replyingTo === comment.commentId && (
                                <div style={{marginTop: '8px'}}>
                                    <textarea
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        style={{width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', boxSizing: 'border-box' as any, minHeight: '60px'}}
                                    />
                                    <Button variant="contained" size="small" onClick={() => postReply(comment.commentId)}
                                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}, marginTop: '4px'}}>
                                        Post Reply
                                    </Button>
                                </div>
                            )}
                            <div style={{marginLeft: '24px', marginTop: '8px'}}>
                                {getReplies(comment.commentId).map((reply: any) => (
                                    <div key={reply.commentId} style={{border: '1px solid #eee', borderRadius: '8px', padding: '8px', marginBottom: '4px'}}>
                                        <p><b>{reply.commenterFirstName} {reply.commenterLastName}</b> · {new Date(reply.timestamp).toLocaleDateString('en-NZ')}</p>
                                        <p>{reply.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {similarBlogs.length > 0 && (
                    <div style={{marginTop: '24px'}}>
                        <h3>Want to Read More? Here's Some Similar Blogs We Think You'll Love!</h3>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px'}}>
                            {similarBlogs.map((b: any) => (
                                <div key={b.blogId} style={{border: '1px solid #ccc', borderRadius: '8px', padding: '12px', width: '200px'}}>
                                    <img
                                        src={'https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + b.blogId + '/image'}
                                        alt="Blog"
                                        style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px'}}
                                        onError={(e: any) => { e.target.style.display = 'none' }}
                                    />
                                    <p><b>{b.title}</b></p>
                                    <p>{b.creatorFirstName} {b.creatorLastName}</p>
                                    <p>{new Date(b.creationDate).toLocaleDateString('en-NZ')}</p>
                                    <p>{b.numReactions} reactions</p>
                                    <Button variant="contained" size="small" component={Link} to={"/blogs/" + b.blogId}
                                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}>
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </Paper>
        </div>
    )
}

export default Blog;