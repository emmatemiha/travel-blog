import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Button } from "@mui/material";
import { useAuthStore } from "../store";

const MyBlogs = () => {
    const [createdBlogs, setCreatedBlogs] = React.useState<Array<any>>([])
    const [interactedBlogs, setInteractedBlogs] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!authToken) {
            navigate('/login')
            return
        }
        getCreatedBlogs()
        getInteractedBlogs()
    }, [])

    const getCreatedBlogs = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', {
            params: { creatorId: userId }
        })
            .then((response) => {
                setCreatedBlogs(response.data.blogs)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getInteractedBlogs = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', {
            params: { interactedByMe: true },
            headers: { 'X-Authorization': authToken }
        })
            .then((response) => {
                setInteractedBlogs(response.data.blogs)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const blogCard = (blog: any, involvement: string) => (
        <div
            key={blog.blogId}
            style={{
                border: '1px solid #0c2c1b',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
            }}>
            <img
                src={'https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + blog.blogId + '/image'}
                alt={blog.title}
                style={{width: '100%', height: '150px', objectFit: 'cover', display: 'block'}}
                onError={(e: any) => { e.target.style.display = 'none' }}
            />
            <div style={{padding: '14px', display: 'flex', flexDirection: 'column', flex: 1}}>
                <p style={{margin: '0 0 6px', fontWeight: 700, color: '#0c2c1b', fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', lineHeight: 1.2}}>
                    {blog.title}
                </p>
                <p style={{margin: '0 0 4px', fontSize: '13px', color: '#666', fontFamily: "'DM Sans', sans-serif"}}>
                    By {blog.creatorFirstName} {blog.creatorLastName}
                </p>
                <p style={{margin: '0 0 4px', fontSize: '13px', color: '#666', fontFamily: "'DM Sans', sans-serif"}}>
                    {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                </p>
                <p style={{margin: '0 0 10px', fontSize: '13px', color: '#666', fontFamily: "'DM Sans', sans-serif"}}>
                    ♡ {blog.numReactions} {blog.numReactions === 1 ? 'reaction' : 'reactions'}
                </p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
                    <span style={{background: '#e8f5e9', color: '#0c2c1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif"}}>
                        {involvement}
                    </span>
                    <Button variant="contained" size="small" onClick={() => navigate('/blogs/' + blog.blogId)}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}, fontFamily: "'DM Sans', sans-serif"}}>
                        View
                    </Button>
                </div>
            </div>
        </div>
    )

    if (errorFlag) {
        return (
            <div style={{background: '#eef2ee', minHeight: '100vh', padding: '20px'}}>
                <Alert severity="error">
                    <AlertTitle>Error</AlertTitle>
                    {errorMessage}
                </Alert>
            </div>
        )
    }

    const createdBlogIds = createdBlogs.map((b: any) => b.blogId)
    const interactedOnlyBlogs = interactedBlogs.filter((b: any) => !createdBlogIds.includes(b.blogId))

    return (
        <div style={{background: '#eef2ee', minHeight: '100vh', padding: '20px'}}>
            <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                {createdBlogs.length === 0 && interactedOnlyBlogs.length === 0 && (
                    <div style={{background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '40px', textAlign: 'center'}}>
                        <p style={{color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: '16px'}}>
                            You haven't created or interacted with any blogs yet!
                        </p>
                        <Button variant="contained" onClick={() => navigate('/blogs/create')}
                            sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}, marginTop: '12px', fontFamily: "'DM Sans', sans-serif"}}>
                            Create your first blog
                        </Button>
                    </div>
                )}

                {createdBlogs.length > 0 && (
                    <div style={{background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px', marginBottom: '20px'}}>
                        <h2 style={{fontFamily: "'Cormorant Garamond', serif", color: '#0c2c1b', fontSize: '28px', margin: '0 0 16px'}}>
                            Blogs I Created
                        </h2>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
                            {createdBlogs.map((blog: any) => blogCard(blog, 'Created'))}
                        </div>
                    </div>
                )}

                {interactedOnlyBlogs.length > 0 && (
                    <div style={{background: 'white', border: '1px solid #0c2c1b', borderRadius: '12px', padding: '24px'}}>
                        <h2 style={{fontFamily: "'Cormorant Garamond', serif", color: '#0c2c1b', fontSize: '28px', margin: '0 0 16px'}}>
                            Blogs I Interacted With
                        </h2>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
                            {interactedOnlyBlogs.map((blog: any) => blogCard(blog, 'Reacted / Commented'))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyBlogs;