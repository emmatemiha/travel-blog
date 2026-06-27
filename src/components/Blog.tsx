import axios from 'axios';
import React from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Dialog, DialogContent, DialogContentText, DialogActions, Snackbar } from "@mui/material";
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

    React.useEffect(() => {
        window.scrollTo(0, 0)
    }, [id])

    const getBlog = () => {
        axios.get('http://localhost:4941/api/v1/blogs/' + id)
            .then((response) => {
                setErrorFlag(false)
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
        setUserReaction(found ? found.reaction : null)
    }

    const getComments = () => {
        axios.get('http://localhost:4941/api/v1/blogs/' + id + '/comments')
            .then((response) => {
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
        return city ? city.name : cityId
    }

    const getCategoryNames = (categoryIds: number[]) => {
        const names = categoryIds.map((id: number) => {
            const category = categories.find((c: any) => c.categoryId === id)
            return category ? category.name : id
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
        const params = { count: 10 }
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
                                setSimilarBlogs(unique.slice(0, 3))
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
            axios.delete('http://localhost:4941/api/v1/blogs/' + id + '/react', { headers: { 'X-Authorization': authToken } })
                .then(() => getReactions())
        } else {
            axios.post('http://localhost:4941/api/v1/blogs/' + id + '/react', { reaction: reactionType }, { headers: { 'X-Authorization': authToken } })
                .then(() => getReactions())      
        }
    }

    const postComment = () => {
        if (!authToken) {
            navigate('/login')
            return
        }
        if (newComment.length > 512) { setErrorFlag(true); setErrorMessage("Comment must be 512 characters or less"); return }
        if (newComment === "") return

        axios.post('http://localhost:4941/api/v1/blogs/' + id + '/comments', { comment: newComment }, { headers: { 'X-Authorization': authToken } })
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

        if (replyText.length > 512) { setErrorFlag(true); setErrorMessage("Reply must be 512 characters or less"); return }
        if (replyText === "") return

        axios.post('http://localhost:4941/api/v1/blogs/' + id + '/comments', { comment: replyText, parentId: parentId }, { headers: { 'X-Authorization': authToken } })
            .then(() => {
                setReplyText("")
                setReplyingTo(null)
                getComments()
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    if (errorFlag) {
        return (
            <div style={{ background: '#0f1a12', minHeight: '100vh', padding: '40px', color: '#e8e0d0', fontFamily: "'Lato', sans-serif" }}>
                <p>Error: {errorMessage}</p>
            </div>
        )
    }

    if (!blog) {
        return <div>Loading...</div>
    }

    return (
        <div style={{ background: '#0f1a12', minHeight: '100vh' }}>

            {/*hero*/}
            <div style={{ position: 'relative', height: '420px', background: '#0a1a0d', overflow: 'hidden' }}>
                <img
                    key={blog.blogId}
                    src={'http://localhost:4941/api/v1/blogs/' + id + '/image'}
                    alt="Blog cover image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e: any) => { e.target.style.display = 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a1209f2 0%, #0a120966) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 40px' }}>
                    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#a8c8a0', fontFamily: "'Lato', sans-serif" }}>
                                {getCityName(blog.cityId)}
                            </span>
                            <span style={{ color: '#4a6a4e', fontSize: '10px' }}>·</span>
                            <span style={{ fontSize: '10px', letterSpacing: '1px', color: '#5a7a5e', fontFamily: "'Lato', sans-serif" }}>
                                {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                            </span>
                            {blog.series && <>
                                <span style={{ color: '#4a6a4e', fontSize: '10px' }}>·</span>
                                <span style={{ fontSize: '10px', letterSpacing: '1px', color: '#7aba7a', fontFamily: "'Lato', sans-serif", textTransform: 'uppercase' }}>
                                    {blog.series}
                                </span>
                            </>}
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '40px', color: '#f0e8d8', fontWeight: 400, margin: 0, lineHeight: 1.2, wordBreak: 'break-word' }}>
                            {blog.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/*blog content*/}
            <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
                        <div
                            onClick={() => navigate('/profile/' + blog.creatorId)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', cursor: 'pointer' }}>
                            <img
                                src={'http://localhost:4941/api/v1/users/' + blog.creatorId + '/image'}
                                alt="Creator"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e' }}
                                onError={(e: any) => { e.target.src = defaultPfp }}
                            />
                            <span style={{ fontFamily: "'Lato', sans-serif", color: '#c8d8c0', fontSize: '13px', wordBreak: 'break-word' }}>
                                {blog.creatorFirstName} {blog.creatorLastName}
                            </span>
                        </div>

                        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '16px', lineHeight: '1.9', color: '#c8d0c0', marginBottom: '28px', wordBreak: 'break-word' }}>
                            {blog.description}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
                            {blog.categoryIds && getCategoryNames(blog.categoryIds).split(', ').map((category: string) => (
                                <span key={category} style={{ fontSize: '10px', color: '#6a8e6e', border: '1px solid #2a4a2e', padding: '2px 7px', borderRadius: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
                                    {category}
                                </span>
                            ))}
                            <span style={{ fontSize: '11px', color: '#5a7a5e', fontFamily: "'Lato', sans-serif" }}>
                                {blog.numberOfUniqueCommenters} unique {blog.numberOfUniqueCommenters === 1 ? 'commenter' : 'commenters'}
                            </span>
                        </div>


                        {userId === blog.creatorId && (
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                <Button variant="outlined" size="small"
                                    onClick={() => navigate('/blogs/' + id + '/edit')}
                                    sx={{ color: '#a8c5a0', borderColor: '#3a5c3e', "&:hover": { borderColor: '#5a8a5e', background: '#5a8a5e1a' }, fontFamily: "'Lato', sans-serif", textTransform: 'none', fontSize: '12px' }}>
                                    EDIT
                                </Button>
                                <Button variant="outlined" size="small"
                                    onClick={() => setOpenDeleteDialog(true)}
                                    sx={{ color: '#c87a7a', borderColor: '#5a2e2e', '&:hover': { borderColor: '#8a4a4a', background: '#c87a7a1a' }, fontFamily: "'Lato', sans-serif", textTransform: 'none', fontSize: '12px' }}>
                                    DELETE
                                </Button>
                            </div>
                        )}

                        <div style={{ borderTop: '1px solid #1e3320', marginBottom: '32px' }} />

                {/*reactions*/}
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", marginBottom: '16px' }}>
                        Reactions
                    </div>
                    {blog.creatorId === userId && (
                        <p style={{ color: '#5a7a5e', fontSize: '12px', fontFamily: "'Lato', sans-serif", marginBottom: '12px' }}>You can't react to your own blog</p>
                    )}
                    {!authToken && (
                        <p style={{ fontSize: '12px', fontFamily: "'Lato', sans-serif", color: '#7a9e7e', marginBottom: '12px' }}>
                            <Link to="/login" style={{ color: '#a8c87a' }}>Log in</Link> to react
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['REACTION_1', 'REACTION_2', 'REACTION_3', 'REACTION_4', 'REACTION_5'].map((r) => (
                            <button
                                key={r}
                                onClick={() => reactToBlog(r)}
                                disabled={blog.creatorId === userId}
                                style={{
                                    background: userReaction === r ? '#2d5a30' : '#1a2e1c',
                                    border: userReaction === r ? '1px solid #4a8a4e' : '1px solid #2a4a2e',
                                    borderRadius: '8px',
                                    padding: '8px 14px',
                                    cursor: blog.creatorId === userId ? 'default' : 'pointer',
                                    color: '#e8e0d0',
                                    fontFamily: "'Lato', sans-serif",
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    opacity: blog.creatorId === userId ? 0.5 : 1,
                                    transition: 'all 0.15s'
                                }}>
                                {reactionEmojis[r]}
                                <span style={{ fontSize: '12px', color: '#9aba9a' }}>{getReactionCount(r)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #1e3320', marginBottom: '32px' }} />

                {/*comments*/}
                <div>
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", marginBottom: '20px' }}>
                        Comments
                    </div>

                    {authToken ? (
                        <div style={{ marginBottom: '32px' }}>
                            <textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="dark-placeholder"
                                style={{ width: '100%', padding: '12px', fontSize: '13px', borderRadius: '6px', border: '1px solid #2a4a2e', fontFamily: "'Lato', sans-serif", boxSizing: 'border-box', minHeight: '80px', resize: 'none', background: '#1a2e1c', color: '#c8d8c0', outline: 'none' }}
                            />
                            <button
                                onClick={postComment}
                                style={{ marginTop: '8px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>
                                Post Comment
                            </button>
                        </div>
                    ) : (
                        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#7a9e7e', marginBottom: '24px' }}>
                            <Link to="/login" style={{ color: '#a8c87a' }}>Log in</Link> to leave a comment
                        </p>
                    )}

                    {getTopLevelComments().map((comment: any) => (
                        <div key={comment.commentId} style={{ borderTop: '1px solid #1a2e1c', paddingTop: '20px', marginBottom: '20px' }}>
                            <div
                                onClick={() => navigate('/profile/' + comment.commenterId)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                                <img
                                    src={'http://localhost:4941/api/v1/users/' + comment.commenterId + '/image'}
                                    alt="Commenter pfp"
                                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e', flexShrink: 0 }}
                                    onError={(e: any) => { e.target.src = defaultPfp }}
                                />
                                <div>
                                    <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#c8d8c0', fontWeight: 600 }}>
                                        {comment.commenterFirstName} {comment.commenterLastName}
                                    </span>
                                    <span style={{ color: '#4a6a4e', fontSize: '11px', marginLeft: '8px', fontFamily: "'Lato', sans-serif" }}>
                                        {new Date(comment.timestamp).toLocaleString('en-NZ')}
                                    </span>
                                </div>
                            </div>
                            <p style={{ color: '#9aba9a', margin: '0 0 8px', fontFamily: "'Lato', sans-serif", fontSize: '13px', paddingLeft: '40px', wordBreak: 'break-word', lineHeight: 1.6 }}>
                                {comment.comment}
                            </p>
                            <div style={{ paddingLeft: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#4a6a4e', fontSize: '11px', fontFamily: "'Lato', sans-serif" }}>
                                    {getReplies(comment.commentId).length} {getReplies(comment.commentId).length === 1 ? 'reply' : 'replies'}
                                </span>
                                {authToken && (
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment.commentId ? null : comment.commentId)}
                                        style={{ background: 'none', border: 'none', color: '#6a9a6e', fontFamily: "'Lato', sans-serif", fontSize: '11px', cursor: 'pointer', padding: 0, letterSpacing: '0.5px' }}>
                                        {replyingTo === comment.commentId ? 'Cancel' : 'Reply'}
                                    </button>
                                )}
                            </div>

                            {replyingTo === comment.commentId && (
                                <div style={{ marginTop: '12px', paddingLeft: '40px' }}>
                                    <textarea
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="dark-placeholder"
                                        style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '6px', border: '1px solid #2a4a2e', fontFamily: "'Lato', sans-serif", boxSizing: 'border-box', minHeight: '60px', resize: 'none', background: '#1a2e1c', color: '#c8d8c0', outline: 'none' }}
                                    />
                                    <button
                                        onClick={() => postReply(comment.commentId)}
                                        style={{ marginTop: '6px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                                        Post Reply
                                    </button>
                                </div>
                            )}

                            {getReplies(comment.commentId).length > 0 && (
                                <div style={{ marginLeft: '40px', marginTop: '12px', borderLeft: '2px solid #1a2e1c', paddingLeft: '16px' }}>
                                    {getReplies(comment.commentId).map((reply: any) => (
                                        <div key={reply.commentId} style={{ marginBottom: '12px' }}>
                                            <div
                                                onClick={() => navigate('/profile/' + reply.commenterId)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', cursor: 'pointer' }}>
                                                <img
                                                    src={'http://localhost:4941/api/v1/users/' + reply.commenterId + '/image'}
                                                    alt="Replier pfp"
                                                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e' }}
                                                    onError={(e: any) => { e.target.src = defaultPfp }}
                                                />
                                                <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '12px', color: '#c8d8c0', fontWeight: 600 }}>
                                                    {reply.commenterFirstName} {reply.commenterLastName}
                                                </span>
                                                <span style={{ color: '#4a6a4e', fontSize: '11px', fontFamily: "'Lato', sans-serif" }}>
                                                    {new Date(reply.timestamp).toLocaleString('en-NZ')}
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontFamily: "'Lato', sans-serif", fontSize: '13px', paddingLeft: '30px', color: '#9aba9a', wordBreak: 'break-word', lineHeight: 1.6 }}>
                                                {reply.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/*similar blogs*/}
            {similarBlogs.length > 0 && (
                <div style={{ borderTop: '1px solid #1e3320', marginTop: '20px' }}>
                    <div style={{ padding: '14px 20px 6px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif" }}>
                        You might also like
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a2e1c' }}>
                        {similarBlogs.map((b: any) => (
                            <div
                                key={b.blogId}
                                onClick={() => navigate('/blogs/' + b.blogId)}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#162318')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#111e13')}
                                style={{ background: '#111e13', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.2s' }}>
                                <div style={{ position: 'relative', height: '160px', background: '#1a3320', overflow: 'hidden' }}>
                                    <img
                                        src={'http://localhost:4941/api/v1/blogs/' + b.blogId + '/image'}
                                        alt={b.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        onError={(e: any) => { e.target.style.display = 'none' }}
                                    />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 8px', background: 'linear-gradient(to top, #0a1209cc 0%, transparent 100%)' }}>
                                        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#a8c8a0', fontFamily: "'Lato', sans-serif" }}>
                                            {getCityName(b.cityId)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#e0d8c8', lineHeight: 1.35, fontWeight: 400 }}>
                                        {b.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <img
                                            src={'http://localhost:4941/api/v1/users/' + b.creatorId + '/image'}
                                            alt="Creator pfp"
                                            style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e', flexShrink: 0 }}
                                            onError={(e: any) => { e.target.src = defaultPfp }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif" }}>
                                            {b.creatorFirstName} {b.creatorLastName}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {getCategoryNames(b.categoryIds).split(', ').map((category: string) => (
                                            <span key={category} style={{ fontSize: '10px', color: '#6a8e6e', border: '1px solid #2a4a2e', padding: '2px 7px', borderRadius: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a2e1c' }}>
                                    <span style={{ fontSize: '11px', color: '#5a7a5e', fontFamily: "'Lato', sans-serif" }}>
                                        {new Date(b.creationDate).toLocaleDateString('en-NZ')}
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#6a8e6e', fontFamily: "'Lato', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>♡</span>
                                        <span>{b.numReactions} {b.numReactions === 1 ? 'reaction' : 'reactions'}</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/*delete dialog*/}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}
                slotProps={{ paper: { sx: { background: '#111e13', border: '1px solid #1e3320' } } }}>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: "'Lato', sans-serif", color: '#c8d8c0' }}>
                        {blog.numberOfUniqueCommenters > 0
                            ? "This blog can't be deleted because it has comments."
                            : "Are you sure you want to delete this blog?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: '#7a9e7e', fontFamily: "'Lato', sans-serif" }}>
                        {blog.numberOfUniqueCommenters > 0 ? "Close" : "Cancel"}
                    </Button>
                    {blog.numberOfUniqueCommenters === 0 && (
                        <Button variant="outlined" onClick={deleteBlog}
                            sx={{ color: '#c87a7a', borderColor: '#5a2e2e', fontFamily: "'Lato', sans-serif" }}>
                            Delete
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar autoHideDuration={3000} open={snackOpen} onClose={() => setSnackOpen(false)} key={snackMessage}>
                <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Blog;