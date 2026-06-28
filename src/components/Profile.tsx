import axios from 'axios';
import React from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuthStore } from "../store";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import defaultPfp from '../assets/default_pfp.png'

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
    const [imageTimestamp, setImageTimestamp] = React.useState(Date.now())
    const [cities, setCities] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])

    const inputStyle = {
        height: '48px',
        padding: '0 14px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #2a4a2e',
        fontFamily: "'Lato', sans-serif",
        width: '100%',
        boxSizing: 'border-box' as any,
        color: '#c8d8c0',
        background: '#1a2e1c',
        outline: 'none'
    }

    React.useEffect(() => {
        getUser()
        getSeries()
        getBlogs()
        getCities()
        getCategories()
    }, [id])

    const getUser = () => {
        const headers: any = {}
        if (authToken) headers['X-Authorization'] = authToken
        axios.get('http://localhost:4941/api/v1/users/' + id, { headers })
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
        axios.get('http://localhost:4941/api/v1/users/' + id + '/series')
            .then((response) => {
                setSeries(response.data.sort())
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getBlogs = () => {
        axios.get('http://localhost:4941/api/v1/blogs', {params: { creatorId: id }})
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

    const handleEditDialogClose = () => {
        setOpenEditDialog(false)
        setEditError("")
        setCurrentPassword("")
        setNewPassword("")
        setProfilePic(null)
        setRemoveImage(false)
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email)
    }

    const saveProfile = () => {
        if (!validateEmail(email)) { setEditError("Please enter a valid email address"); return }
        if (newPassword !== "" && newPassword.length < 6) { setEditError("New password must be at least 6 characters"); return }
        if (newPassword !== "" && currentPassword === "") { setEditError("Please enter your current password to change it"); return }
        if (firstName.length > 64) { setEditError("First name must be 64 characters or less"); return }
        if (lastName.length > 64) { setEditError("Last name must be 64 characters or less"); return }
        if (email.length > 256) { setEditError("Email must be 256 characters or less"); return }
        if (newPassword.length > 64) { setEditError("Password must be 64 characters or less"); return }

        const updateData: any = { firstName, lastName, email }

        if (newPassword !== "") {
            updateData.password = newPassword
            updateData.currentPassword = currentPassword
        }

        axios.patch('http://localhost:4941/api/v1/users/' + id, updateData, { headers: { 'X-Authorization': authToken }})
            .then(() => {
                if (removeImage) {
                    axios.delete('http://localhost:4941/api/v1/users/' + id + '/image', { headers: { 'X-Authorization': authToken }})
                    .then(() => setImageTimestamp(Date.now()))
                }
                if (profilePic) {
                    axios.put('http://localhost:4941/api/v1/users/' + id + '/image', profilePic, { headers: { 'Content-Type': profilePic.type, 'X-Authorization': authToken } })
                    .then(() => {
                        setImageTimestamp(Date.now())
                        getUser()
                        handleEditDialogClose()
                    })
                } else {
                    getUser()
                    handleEditDialogClose()
                }
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
                <Alert severity="error"><AlertTitle>Error</AlertTitle>{errorMessage}</Alert>
            </div>
        )
    }

    if (!user) {
        return (
            <div style={{ background: '#0f1a12', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a9e7e', fontFamily: "'Lato', sans-serif" }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{ background: '#0f1a12', minHeight: '100vh' }}>
            <div style={{ background: '#0a1209', borderBottom: '1px solid #1e3320', padding: '32px 40px' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <img
                        src={'http://localhost:4941/api/v1/users/' + id + '/image?t=' + imageTimestamp}
                        alt="Profile"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2a4a2e', flexShrink: 0 }}
                        onError={(e: any) => { e.target.src = defaultPfp }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                        <h1 style={{ margin: 0, color: '#f0e8d8', fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 400, wordBreak: 'break-word', lineHeight: '1.2' }}>
                            {user.firstName} {user.lastName}
                        </h1>

                        {isOwnProfile && user.email && (
                            <p style={{ margin: '8px 0 0', color: '#5a7a5e', fontFamily: "'Lato', sans-serif", fontSize: '13px', wordBreak: 'break-word' }}>
                                {user.email}
                            </p>
                        )}

                        {isOwnProfile && (
                            <Button variant="outlined" size="small"
                                onClick={() => { setEditError(""); setOpenEditDialog(true) }}
                                sx={{ color: "#a8c5a0", borderColor: "#3a5c3e", '&:hover': { borderColor: '#5a8a5e', background: '#5a8a5e1a' }, marginTop: '14px', fontSize: '12px', textTransform: 'none', fontFamily: "'Lato', sans-serif" }}>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 40px' }}>
                {series.length > 0 && (
                    <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", marginBottom: '16px' }}>
                        Series
                    </div>
                )}

                {series.map((seriesName: string) => (
                    <Accordion
                        key={seriesName}
                        disableGutters
                        elevation={0}
                        sx={{ background: '#111e13', border: '1px solid #1e3320', borderRadius: '6px !important', marginBottom: '12px', overflow: 'hidden', '&:before': { display: 'none' } }}>

                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon sx={{ color: '#5a8a5e' }} />}
                            sx={{ background: '#0d1810', padding: '8px 18px', minHeight: '48px' }}>

                            <span style={{ fontFamily: "'Lato', sans-serif", color: '#e8e0d0', fontSize: '16px' }}>
                                {seriesName}
                            </span>
                        </AccordionSummary>

                        <AccordionDetails sx={{ padding: 0 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a2e1c' }}>
                                {getBlogsForSeries(seriesName).map((blog: any) => blogCard(blog))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {getBlogsWithNoSeries().length > 0 && (
                    <>
                        <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", margin: '24px 0 16px' }}>
                            Other stories
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a2e1c' }}>
                            {getBlogsWithNoSeries().map((blog: any) => blogCard(blog))}
                        </div>
                    </>
                )}

                {blogs.length === 0 && (
                    <p style={{ color: '#4a6a4e', fontFamily: "'Lato', sans-serif", fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                        No stories yet.
                    </p>
                )}
            </div>

            {/*edit profile*/}
            <Dialog open={openEditDialog} onClose={handleEditDialogClose} fullWidth maxWidth="sm"
                slotProps={{ paper: { sx: { background: '#111e13', border: '1px solid #1e3320' } } }}>
                <DialogTitle sx={{ color: '#e8e0d0', fontFamily: "'Lato', sans-serif", fontSize: '16px', fontWeight: 600 }}>
                    Edit Profile
                </DialogTitle>
                <DialogContent>
                    {editError !== "" && (
                        <Alert severity="error" style={{ marginBottom: '16px' }}>
                            {editError}
                        </Alert>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                        {[
                            { label: 'First name', value: firstName, setter: setFirstName, type: 'text' },
                            { label: 'Last name', value: lastName, setter: setLastName, type: 'text' },
                            { label: 'Email', value: email, setter: setEmail, type: 'email' },
                        ].map(({ label, value, setter, type }) => (
                            <div key={label}>
                                <p style={{ margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>{label}</p>
                                <input type={type} value={value} onChange={(e) => setter(e.target.value)}
                                    className="dark-placeholder" style={inputStyle} />
                            </div>
                        ))}
                        <div>
                            <p style={{ margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>Current password (needed if changing password)</p>
                            <div style={{ position: 'relative' }}>
                                <input type={showCurrentPassword ? "text" : "password"} placeholder="Current password"
                                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={inputStyle} className="dark-placeholder" />
                                <VisibilityIcon onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5a8a5e' }} />
                            </div>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>New password</p>
                            <div style={{ position: 'relative' }}>
                                <input type={showNewPassword ? "text" : "password"} placeholder="New password"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    style={inputStyle} className="dark-placeholder" />
                                <VisibilityIcon onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5a8a5e' }} />
                            </div>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>Profile picture</p>
                            <input type="file" accept="image/jpeg, image/png, image/gif"
                                onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
                                style={{ color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }} />
                            <p style={{ color: '#4a6a4e', fontSize: '11px', margin: '4px 0 0', fontFamily: "'Lato', sans-serif" }}>Accepted: JPEG, PNG, GIF</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} />
                            <p style={{ margin: 0, color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>Remove profile picture</p>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #1e3320', padding: '12px 20px' }}>
                    <Button onClick={handleEditDialogClose} sx={{ color: '#7a9e7e', fontFamily: "'Lato', sans-serif", textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={saveProfile}
                        sx={{ background: '#2d5a30', '&:hover': { background: '#3a6e3e' }, borderColor: '#4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", textTransform: 'none' }}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Profile;