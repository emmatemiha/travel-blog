import axios from 'axios';
import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button } from "@mui/material";
import { useAuthStore } from "../store";
import VisibilityIcon from '@mui/icons-material/Visibility';

const Register = () => {
    const [firstName, setFirstName] = React.useState("")
    const [lastName, setLastName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
    const [profilePic, setProfilePic] = React.useState<File | null>(null)
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const setAuth = useAuthStore(state => state.setAuth)
    const navigate = useNavigate()

    const inputStyle = {
        height: '56px',
        padding: '0 14px',
        fontSize: '16px',
        borderRadius: '6px',
        border: '1px solid #0c2c1b',
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
        boxSizing: 'border-box' as any,
        color: '#0c2c1b',
        outline: 'none'
    }

    const card = {
        padding: "32px",
        width: "400px",
        border: '1px solid #0c2c1b',
        borderRadius: '12px'
    }

    const validateEmail = (email: string) => {
        return email.includes('@') && email.includes('.')
    }

    const register = () => {
        if (firstName === "" || lastName === "" || email === "" || password === "") {
            setErrorFlag(true)
            setErrorMessage("Please fill in all required fields")
            setPassword("")
            return
        }
        if (!validateEmail(email)) {
            setErrorFlag(true)
            setErrorMessage("Please enter a valid email address")
            setPassword("")
            return
        }
        if (password.length < 6) {
            setErrorFlag(true)
            setErrorMessage("Password must be at least 6 characters")
            setPassword("")
            return
        }
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/register', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
            .then((response) => {
                //const userId = response.data.userId
                axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/login', {
                    email: email,
                    password: password
                })
                    .then((loginResponse) => {
                        setAuth(loginResponse.data.token, loginResponse.data.userId)
                        if (profilePic) {
                            axios.put('https://seng365.csse.canterbury.ac.nz/api/v1/users/' + loginResponse.data.userId + '/image', profilePic, {
                                headers: { 'Content-Type': profilePic.type, 'X-Authorization': loginResponse.data.token }
                            })
                        }
                        navigate('/blogs')
                    })
            }, (error) => {
                setErrorFlag(true)
                if (error.response && error.response.status === 403) {
                    setErrorMessage("Email already in use")
                } else {
                    setErrorMessage(error.toString())
                }
                setPassword("")
            })
    }

    return (
        <div style={{minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ee'}}>
            <Paper elevation={0} style={card}>
                <h1 style={{textAlign: 'center', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px 0'}}>Sign up</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
                    <input
                        type="text"
                        placeholder="First Name*"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="green-placeholder"
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="Last Name*"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="green-placeholder"
                        style={inputStyle}
                    />
                    <input
                        type="email"
                        placeholder="Email*"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="green-placeholder"
                        style={inputStyle}
                    />
                    <div style={{position: 'relative'}}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min 6 characters)*"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="green-placeholder"
                            style={inputStyle}
                        />
                        <VisibilityIcon
                            onClick={() => setShowPassword(!showPassword)}
                            style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#0c2c1b'}}
                        />
                    </div>

                    <div style={{textAlign: 'center'}}>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Profile picture (optional)</p>
                        <label style={{cursor: 'pointer', color: '#0c2c1b', border: '1px solid #0c2c1b', borderRadius: '6px', padding: '8px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px'}}>
                            Choose file
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/gif"
                                onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
                                style={{display: 'none'}}
                            />
                        </label>
                        {profilePic && <p style={{color: '#0c2c1b', fontSize: '13px', marginTop: '4px'}}>{profilePic.name}</p>}
                        {!profilePic && <p style={{color: '#999', fontSize: '13px', marginTop: '4px'}}>No file chosen</p>}
                    </div>

                    <Button variant="contained" fullWidth onClick={register}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}
                    >
                        Register
                    </Button>
                    <p style={{textAlign: 'center', color: '#0c2c1b'}}>Already have an account? <Link to="/login" style={{color: '#0c2c1b'}}>Log in</Link></p>
                </div>
            </Paper>
        </div>
    )
}

export default Register;