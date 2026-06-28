import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle } from "@mui/material";
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
        axios.get('http://localhost:4941/api/v1/blogs', { params: { creatorId: userId } })
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
            onClick={() => navigate('/blogs/' + blog.blogId)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#162318')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#111e13')}
            style={{ background: '#111e13', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ position: 'relative', height: '160px', background: '#1a3320', overflow: 'hidden' }}>
                <img
                    src={'http://localhost:4941/api/v1/blogs/' + blog.blogId + '/image'}
                    alt={blog.title}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 8px', background: 'linear-gradient(to top, #0a1209cc 0%, transparent 100%)' }}>
                    <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#a8c8a0', fontFamily: "'Lato', sans-serif" }}>
                        {getCityName(blog.cityId)}
                    </span>
                </div>
                {/* involvement badge */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(10,18,9,0.8)', border: '1px solid #2a4a2e', borderRadius: '10px', padding: '2px 8px' }}>
                    <span style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: '#7aba7a', fontFamily: "'Lato', sans-serif" }}>
                        {involvement}
                    </span>
                </div>
            </div>
            <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#e0d8c8', lineHeight: 1.35, fontWeight: 400 }}>
                    {blog.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img
                        src={'http://localhost:4941/api/v1/users/' + blog.creatorId + '/image'}
                        alt="Creator"
                        style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e', flexShrink: 0 }}
                        onError={(e: any) => { e.target.src = defaultPfp }}
                    />
                    <span style={{ fontSize: '12px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif" }}>
                        {blog.creatorFirstName} {blog.creatorLastName}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {getCategoryNames(blog.categoryIds).split(', ').map((cat: string) => (
                        <span key={cat} style={{ fontSize: '10px', color: '#6a8e6e', border: '1px solid #2a4a2e', padding: '2px 7px', borderRadius: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
                            {cat}
                        </span>
                    ))}
                </div>
            </div>
            <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a2e1c' }}>
                <span style={{ fontSize: '11px', color: '#5a7a5e', fontFamily: "'Lato', sans-serif" }}>
                    {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                </span>
                <span style={{ fontSize: '11px', color: '#6a8e6e', fontFamily: "'Lato', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>♡</span>
                    <span>{blog.numReactions} {blog.numReactions === 1 ? 'reaction' : 'reactions'}</span>
                </span>
            </div>
        </div>
    )

    if (errorFlag) {
        return (
            <div style={{ background: '#0f1a12', minHeight: '100vh', padding: '40px', color: '#e8e0d0', fontFamily: "'Lato', sans-serif" }}>
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

    const section = (title: string, blogs: any[], involvement: string) => (
        <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", marginBottom: '8px' }}>
                {title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a2e1c' }}>
                {blogs.map((blog: any) => blogCard(blog, involvement))}
            </div>
        </div>
    )

    return (
        <div style={{ background: '#0f1a12', minHeight: '100vh' }}>
            <div style={{ background: '#0a1209', borderBottom: '1px solid #1e3320', padding: '24px 40px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <h1 style={{ margin: 0, color: '#f0e8d8', fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 400 }}>
                        My Blogs
                    </h1>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 40px' }}>
                {hasNothing && (
                    <div style={{ background: '#111e13', border: '1px solid #1e3320', borderRadius: '8px', padding: '48px', textAlign: 'center' }}>
                        <p style={{ color: '#4a6a4e', fontFamily: "'Lato', sans-serif", fontSize: '14px', marginBottom: '20px' }}>
                            You haven't created or interacted with any blogs yet.
                        </p>
                        <button onClick={() => navigate('/blogs/create')}
                            style={{ background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer' }}>
                            Create your first blog
                        </button>
                    </div>
                )}
                {createdBlogs.length > 0 && section("Blogs I've created", createdBlogs, 'Created')}
                {reactedOnlyBlogs.length > 0 && section("Blogs I've reacted to", reactedOnlyBlogs, 'Reacted')}
                {commentedOnlyBlogs.length > 0 && section("Blogs I've commented on", commentedOnlyBlogs, 'Commented')}
            </div>
        </div>
    )
}

export default MyBlogs;