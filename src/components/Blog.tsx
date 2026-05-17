import axios from 'axios';
import React from "react";
import { useParams, Link } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button, badgeClasses } from "@mui/material";

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

    const getReactions = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/react')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setReactions(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
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

    const reactionEmojis: any = {
        REACTION_1: '❤️',
        REACTION_2: '😂',
        REACTION_3: '😮',
        REACTION_4: '😢',
        REACTION_5: '👍'
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
                sx={{backgroundColor: "#ff96bf", "&:hover": {backgroundColor: "#fa84b2"}}}>
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

                <div>
                    <h3>Reactions</h3>
                    <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
                        {['REACTION_1', 'REACTION_2', 'REACTION_3', 'REACTION_4', 'REACTION_5'].map((r) => (
                            <span key={r}>
                                {reactionEmojis[r]} {getReactionCount(r)}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h3>Comments</h3>
                    {getTopLevelComments().map((comment: any) => (
                        <div key={comment.commentId} style={{border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '8px'}}>
                            <p><b>{comment.commenterFirstName} {comment.commenterLastName}</b> · {new Date(comment.timestamp).toLocaleDateString('en-NZ')}</p>
                            <p>{comment.comment}</p>
                            <div style={{marginLeft: '24px'}}>
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
                                        sx={{backgroundColor: "#ff96bf", "&:hover": {backgroundColor: "#fa84b2"}}}>
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