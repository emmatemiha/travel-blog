import axios from 'axios';
import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button } from "@mui/material";
import { useAuthStore } from "../store";

const MyBlogs = () => {
    const [createdBlogs, setCreatedBlogs] = React.useState<Array<any>>([])
    const [interactedBlogs, setInteractedBlogs] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const navigate = useNavigate()

    const card = {
        padding: "20px",
        margin: "20px auto",
        maxWidth: "900px"
    }

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

    const getBlogCard = (blog: any, involvement: string) => {
        return (
            <div key={blog.blogId} style={{border: '1px solid #ccc', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <img
                        src={'https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + blog.blogId + '/image'}
                        alt="Blog"
                        style={{width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px', float: 'left'}}
                        onError={(e: any) => { e.target.style.display = 'none' }}
                    />
                    <p style={{margin: 0}}><b>{blog.title}</b></p>
                    <p style={{margin: 0}}>{blog.creatorFirstName} {blog.creatorLastName} · {new Date(blog.creationDate).toLocaleDateString('en-NZ')}</p>
                    <p style={{margin: 0}}>{blog.numReactions} reactions</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px'}}>
                    <span style={{background: '#e8f5e9', color: '#0c2c1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px'}}>
                        {involvement}
                    </span>
                    <Button variant="outlined" size="small" component={Link} to={'/blogs/' + blog.blogId}
                        sx={{color: "#0c2c1b", borderColor: "#0c2c1b"}}>
                        View
                    </Button>
                </div>
            </div>
        )
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

    const createdBlogIds = createdBlogs.map((b: any) => b.blogId)
    const interactedOnlyBlogs = interactedBlogs.filter((b: any) => !createdBlogIds.includes(b.blogId))

    return (
        <div>
            <Paper elevation={3} style={card}>
                <h1 style={{textAlign: 'center'}}>My Blogs</h1>
                {createdBlogs.length === 0 && interactedOnlyBlogs.length === 0 && (
                    <p style={{textAlign: 'center'}}>You haven't created or interacted with any blogs yet!</p>
                )}
                {createdBlogs.length > 0 && (
                    <div>
                        <h2>Blogs I Created</h2>
                        {createdBlogs.map((blog: any) => getBlogCard(blog, 'Created'))}
                    </div>
                )}
                {interactedOnlyBlogs.length > 0 && (
                    <div>
                        <h2>Blogs I Interacted With</h2>
                        {interactedOnlyBlogs.map((blog: any) => getBlogCard(blog, 'Reacted/Commented'))}
                    </div>
                )}
            </Paper>
        </div>
    )
}

export default MyBlogs;