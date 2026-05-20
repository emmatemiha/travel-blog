import axios from 'axios';
import React from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuthStore } from "../store";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Profile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const authToken = useAuthStore(state => state.authToken)
    const loggedInUserId = useAuthStore(state => state.userId)
    const isOwnProfile = Number(id) === loggedInUserId

    const [user, setUser] = React.useState<any>(null)
    const [series, setSeries] = React.useState<Array<string>>([])
    const [blogs, setBlogs] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [currentPassword, setCurrentPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [profilePic, setProfilePic] = React.useState<File | null>(null)
    const [editError, setEditError] = React.useState("")
    const [removeImage, setRemoveImage] = React.useState(false)

    const card = {
        padding: "20px",
        margin: "20px auto",
        maxWidth: "950px",
        background: 'white',
        border: '1px solid #0c2c1b',
        borderRadius: '12px',
        boxShadow: 'none',
        color: '#0c2c1b'
    }

    const inputStyle = {
        height: '56px', padding: '0 14px', fontSize: '16px',
        borderRadius: '4px', border: '1px solid #0c2c1b',
        fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as any, color: '#0c2c1b', outline: 'none'
    }

    React.useEffect(() => {
        getUser()
        getSeries()
        getBlogs()
    }, [id])

    const getUser = () => {
        const headers: any = {}
        if (authToken) headers['X-Authorization'] = authToken
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id, { headers })
            .then((response) => {
                setUser(response.data)
                setFirstName(response.data.firstName)
                setLastName(response.data.lastName)
                setEmail(response.data.email || "")
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getSeries = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id + '/series')
            .then((response) => {
                setSeries(response.data.sort())
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getBlogs = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', {
            params: { creatorId: id }
        })
            .then((response) => {
                setBlogs(response.data.blogs)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getBlogsForSeries = (seriesName: string) => {
        return blogs
            .filter((b: any) => b.series === seriesName)
            .sort((a: any, b: any) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
    }

    const getBlogsWithNoSeries = () => {
        return blogs
            .filter((b: any) => b.series === null)
            .sort((a: any, b: any) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())
    }

    const handleEditDialogOpen = () => {
        setEditError("")
        setOpenEditDialog(true)
    }

    const handleEditDialogClose = () => {
        setOpenEditDialog(false)
        setEditError("")
        setCurrentPassword("")
        setNewPassword("")
        setProfilePic(null)
        setRemoveImage(false)
    }

    const validateEmail = (email: string) => {
        return email.includes('@') && email.includes('.')
    }

    const saveProfile = () => {
        if (!validateEmail(email)) {
            setEditError("Please enter a valid email address")
            return
        }
        if (newPassword !== "" && newPassword.length < 6) {
            setEditError("New password must be at least 6 characters")
            return
        }
        if (newPassword !== "" && currentPassword === "") {
            setEditError("Please enter your current password to change it")
            return
        }

        const updateData: any = {
            firstName: firstName,
            lastName: lastName,
            email: email
        }

        if (newPassword !== "") {
            updateData.password = newPassword
            updateData.currentPassword = currentPassword
        }

        axios.patch('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id, updateData, {
            headers: { 'X-Authorization': authToken }
        })
            .then(() => {
                if (removeImage) {
                    axios.delete('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id + '/image', {
                        headers: { 'X-Authorization': authToken }
                    })
                }
                if (profilePic) {
                    axios.put('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id + '/image', profilePic, {
                        headers: { 'Content-Type': profilePic.type, 'X-Authorization': authToken }
                    })
                }
                handleEditDialogClose()
                getUser()
            }, (error) => {
                if (error.response && error.response.status === 403) {
                    setEditError("Email already in use or incorrect current password")
                } else {
                    setEditError(error.toString())
                }
            })
    }

    const blogCard = (blog: any) => (
        <div
            key={blog.blogId}
            style={{
                border: '1px solid #0c2c1b',
                borderRadius: '10px',
                overflow: 'hidden',
                width: '197px',
                background: 'white',
                cursor: 'pointer',
                transition: '0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
            onClick={() => navigate('/blogs/' + blog.blogId)}
        >

            <img
                src={'https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + blog.blogId + '/image'}
                alt={blog.title}
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    display: 'block'
                }}
                onError={(e: any) => {
                    e.target.style.display = 'none'
                }}
            />

            <div style={{padding: '14px'}}>

                <p style={{
                    margin: '0 0 10px',
                    fontWeight: 700,
                    color: '#0c2c1b',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '22px',
                    lineHeight: 1.2
                }}>
                    {blog.title}
                </p>

                <p style={{
                    margin: '0 0 6px',
                    fontSize: '13px',
                    color: '#666',
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    {new Date(blog.creationDate).toLocaleDateString('en-NZ')}
                </p>

                <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#666',
                    fontFamily: "'DM Sans', sans-serif"
                }}>
                    ♡ {blog.numReactions} reactions
                </p>
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/blogs/' + blog.blogId)}
                    sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" } }}
                >
                    View
                </Button>

            </div>
        </div>
    )

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

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div style={{background: '#eef2ee', minHeight: '100vh', padding: '20px'}}>
            <Paper elevation={3} style={card}>
                <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', paddingBottom: '28px', borderBottom: '1px solid #d8e0d8'}}>
                    <img
                        src={'https://seng365.csse.canterbury.ac.nz/api/v1/users/' + id + '/image'}
                        alt="Profile"
                        style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0c2c1b'}}
                        onError={(e: any) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image' }}
                    />
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        textAlign: 'left'
                    }}>
                        <h1 style={{
                            margin: 0,
                            color: '#0c2c1b',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '42px',
                            fontWeight: 700,
                        }}>
                            {user.firstName} {user.lastName}
                        </h1>

                        {isOwnProfile && user.email && (
                            <p style={{margin: '18px 0 0', color: '#777', fontFamily: "'DM Sans', sans-serif", fontSize: '14px'}}>{user.email}</p>
                        )}

                        {isOwnProfile && (
                            <Button variant="outlined" onClick={handleEditDialogOpen}
                                sx={{color: "#0c2c1b", borderColor: "#0c2c1b", marginTop: '14px', textTransform: 'none', fontFamily: "'DM Sans', sans-serif"}}>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {series.map((seriesName: string) => (
                    <Accordion
                        key={seriesName}
                        disableGutters
                        elevation={0}
                        sx={{
                            border: '1px solid #0c2c1b',
                            borderRadius: '10px',
                            marginBottom: '16px',
                            overflow: 'hidden',
                            '&:before': {
                                display: 'none'
                            }
                        }}>

                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{color: '#0c2c1b'}} />}
                            sx={{
                                background: '#eef2ee',
                                padding: '10px 18px'
                            }}>

                            <span style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: '#0c2c1b',
                                fontSize: '24px',
                                fontWeight: 700
                            }}>
                                {seriesName}
                            </span>

                        </AccordionSummary>

                        <AccordionDetails style={{
                            padding: '20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '18px'
                        }}>
                            {getBlogsForSeries(seriesName).map((blog: any) => blogCard(blog))}
                        </AccordionDetails>
                    </Accordion>
                ))}


                
                {getBlogsWithNoSeries().length > 0 && (
                    <h2 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: '#0c2c1b',
                        fontSize: '27px',
                        margin: '34px 0 18px'
                    }}>
                        Other Blogs
                    </h2>
                )}
                {getBlogsWithNoSeries().length > 0 && (
                    <Accordion
                        disableGutters
                        elevation={0}
                        sx={{
                            border: '1px solid #0c2c1b',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            '&:before': {
                                display: 'none'
                            }
                        }}>

                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{color: '#0c2c1b'}} />}
                            sx={{
                                background: '#eef2ee',
                                padding: '10px 18px'
                            }}>

                            <span style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: '#0c2c1b',
                                fontSize: '24px',
                                fontWeight: 700
                            }}>
                                No Series
                            </span>

                        </AccordionSummary>

                        <AccordionDetails style={{
                            padding: '20px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '18px'
                        }}>
                            {getBlogsWithNoSeries().map((blog: any) => blogCard(blog))}
                        </AccordionDetails>
                    </Accordion>
                )}
            </Paper>

            <Dialog open={openEditDialog} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{
                    color: '#0c2c1b',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700
                }}>
                    Edit Profile
                </DialogTitle>
                <DialogContent>
                    {editError !== "" && (
                        <Alert severity="error" style={{marginBottom: '16px'}}>
                            {editError}
                        </Alert>
                    )}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px'}}>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                First name
                            </p>
                            <input type="text" value={firstName}
                                onChange={(e) => setFirstName(e.target.value)} style={inputStyle}
                                className="green-placeholder"
                                />
                        </div>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Last name
                            </p>
                            <input type="text" value={lastName}
                                className="green-placeholder"
                                onChange={(e) => setLastName(e.target.value)} style={inputStyle}/>
                        </div>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Email
                            </p>
                            <input type="email" value={email}
                                className="green-placeholder"
                                onChange={(e) => setEmail(e.target.value)} style={inputStyle}/>
                        </div>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Current password (needed if changing password)
                            </p>
                            <div style={{position: 'relative'}}>
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={inputStyle}
                                    className="green-placeholder"
                                />
                                {showCurrentPassword ?
                                    <VisibilityOffIcon onClick={() => setShowCurrentPassword(false)}
                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0c2c1b'}}/> :
                                    <VisibilityIcon onClick={() => setShowCurrentPassword(true)}
                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0c2c1b'}}/>
                                }
                            </div>
                        </div>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                New password
                            </p>
                            <div style={{position: 'relative'}}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={inputStyle}
                                    className="green-placeholder"
                                />
                                {showNewPassword ?
                                    <VisibilityOffIcon onClick={() => setShowNewPassword(false)}
                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0c2c1b'}}/> :
                                    <VisibilityIcon onClick={() => setShowNewPassword(true)}
                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0c2c1b'}}/>
                                }
                            </div>
                        </div>
                        <div>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Profile picture 
                            </p>
                            <input type="file" accept="image/jpeg, image/png, image/gif"
                                className="green-placeholder"
                                onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}/>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <input type="checkbox" checked={removeImage}
                                onChange={(e) => setRemoveImage(e.target.checked)}/>
                            <p style={{
                                margin: '0 0 8px 0',
                                color: '#0c2c1b',
                                fontFamily: "'DM Sans', sans-serif"
                            }}>
                                Remove profile picture 
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose} sx={{color: "#0c2c1b"}}>Cancel</Button>
                    <Button variant="contained" onClick={saveProfile}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Profile;