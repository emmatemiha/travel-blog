import axios from 'axios';
import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from "@mui/material";
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

    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email)
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

        if (firstName.length > 64) { setErrorFlag(true); setErrorMessage("First name must be 64 characters or less"); return }
        if (lastName.length > 64) { setErrorFlag(true); setErrorMessage("Last name must be 64 characters or less"); return }
        if (email.length > 256) { setErrorFlag(true); setErrorMessage("Email must be 256 characters or less"); return }
        if (password.length > 64) { setErrorFlag(true); setErrorMessage("Password must be 64 characters or less"); setPassword(""); return }

        axios.post('http://localhost:4941/api/v1/users/register', { firstName, lastName, email, password })
            .then((response) => {
                axios.post('http://localhost:4941/api/v1/users/login', { email, password })
                    .then((loginResponse) => {
                        setAuth(loginResponse.data.token, loginResponse.data.userId)
                        if (profilePic) {
                            axios.put('http://localhost:4941/api/v1/users/' + loginResponse.data.userId + '/image', profilePic, {
                                headers: { 'Content-Type': profilePic.type, 'X-Authorization': loginResponse.data.token }
                            })
                        }
                        navigate('/blogs')
                    })
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response?.status === 403 ? "Email already in use" : error.toString())
                setPassword("")
            })
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1a12', padding: '40px 0' }}>
            <div style={{ width: '380px', background: '#111e13', border: '1px solid #1e3320', borderRadius: '8px', padding: '36px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", textAlign: 'center', marginBottom: '8px' }}>
                    Join the community
                </div>
                <h1 style={{ textAlign: 'center', color: '#f0e8d8', fontFamily: "'Playfair Display', serif", margin: '0 0 28px', fontSize: '28px', fontWeight: 400 }}>
                    Sign up
                </h1>
                {errorFlag && (
                    <Alert severity="error" sx={{ marginBottom: '16px', fontFamily: "'Lato', sans-serif" }}>
                        {errorMessage}
                    </Alert>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" placeholder="First name" value={firstName}
                        onChange={(e) => setFirstName(e.target.value)} className="dark-placeholder" style={inputStyle} />
                    <input type="text" placeholder="Last name" value={lastName}
                        onChange={(e) => setLastName(e.target.value)} className="dark-placeholder" style={inputStyle} />
                    <input type="email" placeholder="Email" value={email}
                        onChange={(e) => setEmail(e.target.value)} className="dark-placeholder" style={inputStyle} />
                    <div style={{ position: 'relative' }}>
                        <input type={showPassword ? "text" : "password"} placeholder="Password (min 6 characters)"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="dark-placeholder" style={inputStyle} />
                        <VisibilityIcon onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5a8a5e', fontSize: '20px' }} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '12px' }}>Profile picture (optional)</p>
                        <label style={{ cursor: 'pointer', color: '#a8c5a0', border: '1px solid #3a5c3e', borderRadius: '4px', padding: '7px 14px', fontFamily: "'Lato', sans-serif", fontSize: '12px', display: 'inline-block' }}>
                            Choose file
                            <input type="file" accept="image/jpeg, image/png, image/gif"
                                onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
                                style={{ display: 'none' }} />
                        </label>
                        <span style={{ color: '#4a6a4e', fontSize: '12px', fontFamily: "'Lato', sans-serif", marginLeft: '10px' }}>
                            {profilePic ? profilePic.name : 'No file chosen'}
                        </span>
                    </div>
                    <button
                        onClick={register}
                        style={{ marginTop: '4px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        Create account
                    </button>
                    <p style={{ textAlign: 'center', color: '#5a7a5e', fontFamily: "'Lato', sans-serif", fontSize: '13px', margin: '4px 0 0' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#a8c87a', textDecoration: 'none' }}>Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register;