import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Button } from "@mui/material";
import { useAuthStore } from "../store";
import defaultPfp from '../assets/default_pfp.png'

const MyBlogs = () => {
    const [createdBlogs, setCreatedBlogs] = React.useState<Array<any>>([])
    const [reactedBlogs, setReactedBlogs] = React.useState<Array<any>>([])
    const [commentedBlogs, setCommentedBlogs] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [cities, setCities] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!authToken) {
            navigate('/login')
            return
        }
        getCities()
        getCategories()
        getCreatedBlogs()
        getInteractedBlogs()
    }, [])

    const getCities = () => {
        axios.get('http://localhost:4941/api/v1/blogs/cities')
            .then((response) => { setCities(response.data) },
                (error) => { setErrorFlag(true); setErrorMessage(error.toString()) })
    }

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/blogs/categories')
            .then((response) => { setCategories(response.data) },
                (error) => { setErrorFlag(true); setErrorMessage(error.toString()) })
    }

    const getCityName = (cityId: number) => {
        const city = cities.find((c: any) => c.cityId === cityId)
        return city ? city.name : cityId
    }

    const getCategoryNames = (categoryIds: number[]) => {
        return categoryIds.map((id: number) => {
            const category = categories.find((c: any) => c.categoryId === id)
            return category ? category.name : id
        }).join(', ')
    }

    const getCreatedBlogs = () => {
        axios.get('http://localhost:4941/api/v1/blogs', {
            params: { creatorId: userId }
        })
            .then((response) => {
                setCreatedBlogs(response.data.blogs)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getInteractedBlogs = async () => {
        try {
            const response = await axios.get('http://localhost:4941/api/v1/blogs', {
                params: { interactedByMe: true },
                headers: { 'X-Authorization': authToken }
            })
            const blogs: any[] = response.data.blogs

            const results = await Promise.all(
                blogs.map(async (blog: any) => {
                    const [reactionsRes, commentsRes] = await Promise.all([
                        axios.get(`http://localhost:4941/api/v1/blogs/${blog.blogId}/react`),
                        axios.get(`http://localhost:4941/api/v1/blogs/${blog.blogId}/comments`)
                    ])
                    const didReact = reactionsRes.data.some((r: any) => r.userId === userId)
                    const didComment = commentsRes.data.some((c: any) => c.commenterId === userId)
                    return { blog, didReact, didComment }
                })
            )
            setReactedBlogs(results.filter(r => r.didReact).map(r => r.blog))
            setCommentedBlogs(results.filter(r => r.didComment).map(r => r.blog))
        
        } catch (error: any) {
            setErrorFlag(true)
            setErrorMessage(error.toString())
        }
    }

    const blogCard = (blog: any, involvement: string) => (
        <div
            key={blog.blogId}
            style={{ border: '1px solid #0c2c1b', borderRadius: '12px', overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <img
                src={'http://localhost:4941/api/v1/blogs/' + blog.blogId + '/image'}
                alt={blog.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                onError={(e: any) => { e.target.style.display = 'none' }}
            />
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0c2c1b', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', lineHeight: 1.1, wordBreak: 'break-word', textDecoration: 'underline' }}>
                    {blog.title}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', margin: '0 0 4px' }}>
                    <img
                        src={'http://localhost:4941/api/v1/users/' + blog.creatorId + '/image'}
                        alt="Creator"
                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                        onError={(e: any) => { e.target.src = defaultPfp }}
                    />
                    <p style={{ margin: 0, fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif", wordBreak: 'break-word' }}>
                        By {blog.creatorFirstName} {blog.creatorLastName}
                    </p>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                    {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                    📍 {getCityName(blog.cityId)}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                    {getCategoryNames(blog.categoryIds)}
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif" }}>
                    ♡ {blog.numReactions} {blog.numReactions === 1 ? 'reaction' : 'reactions'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ background: '#e8f5e9', color: '#0c2c1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                        {involvement}
                    </span>
                    <Button variant="contained" size="small" onClick={() => navigate('/blogs/' + blog.blogId)}
                        sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, fontFamily: "'DM Sans', sans-serif" }}>
                        View
                    </Button>
                </div>
            </div>
        </div>
    )

    if (errorFlag) {
        return (
            <div style={{ background: '#eef2ee', minHeight: '100vh', padding: '20px' }}>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            </div>
        )
    }

    const createdBlogIds = createdBlogs.map((b: any) => b.blogId)
    const reactedOnlyBlogs = reactedBlogs.filter((b: any) => !createdBlogIds.includes(b.blogId))
    const commentedOnlyBlogs = commentedBlogs.filter((b: any) => !createdBlogIds.includes(b.blogId))
    const hasNothing = createdBlogs.length === 0 && reactedOnlyBlogs.length === 0 && commentedOnlyBlogs.length === 0

    return (
        <div style={{ background: '#eef2ee', minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {hasNothing && (
                    <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                        <p style={{ color: '#6e6e6e', fontFamily: "'DM Sans', sans-serif", fontSize: '16px' }}>
                            You haven't created or interacted with any blogs yet!
                        </p>
                        <Button variant="contained" onClick={() => navigate('/blogs/create')}
                            sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" }, marginTop: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                            Create your first blog
                        </Button>
                    </div>
                )}

                {createdBlogs.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '22px', margin: '0 0 16px' }}>
                            Blogs I've Created
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {createdBlogs.map((blog: any) => blogCard(blog, 'Created'))}
                        </div>
                    </div>
                )}

                {reactedOnlyBlogs.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '22px', margin: '0 0 16px' }}>
                            Blogs I've Reacted To
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {reactedOnlyBlogs.map((blog: any) => blogCard(blog, 'Reacted'))}
                        </div>
                    </div>
                )}

                {commentedOnlyBlogs.length > 0 && (
                    <div style={{ background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px' }}>
                        <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '22px', margin: '0 0 16px' }}>
                            Blogs I've Commented On
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {commentedOnlyBlogs.map((blog: any) => blogCard(blog, 'Commented'))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default MyBlogs;