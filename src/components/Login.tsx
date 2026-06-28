import axios from 'axios';
import React from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from "@mui/material";
import { useAuthStore } from "../store";
import VisibilityIcon from '@mui/icons-material/Visibility';

const Login = () => {
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [showPassword, setShowPassword] = React.useState(false)
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

    const Login = () => {
        if (email === "" || password === "") {
            setErrorFlag(true)
            setErrorMessage("Please enter your email and password")
            return
        }

        axios.post('http://localhost:4941/api/v1/users/login', { email, password })
            .then((response) => {
                setAuth(response.data.token, response.data.userId)
                navigate('/blogs')
            }, () => {
                setEmail("")
                setPassword("")
            })
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1a12' }}>
            <div style={{ width: '380px', background: '#111e13', border: '1px solid #1e3320', borderRadius: '8px', padding: '36px' }}>
                <h1 style={{ textAlign: 'center', color: '#f0e8d8', fontFamily: "'Playfair Display', serif", margin: '0 0 28px', fontSize: '28px', fontWeight: 400 }}>
                    Log in
                </h1>
                {errorFlag && (
                    <Alert severity="error" sx={{ marginBottom: '16px', fontFamily: "'Lato', sans-serif" }}>
                        {errorMessage}
                    </Alert>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="dark-placeholder"
                        style={inputStyle}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="dark-placeholder"
                            style={inputStyle}
                        />
                        <VisibilityIcon
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#5a8a5e', fontSize: '20px' }}
                        />
                    </div>
                    <button
                        onClick={Login}
                        style={{ marginTop: '4px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        Log in
                    </button>
                    <p style={{ textAlign: 'center', color: '#5a7a5e', fontFamily: "'Lato', sans-serif", fontSize: '13px', margin: '4px 0 0' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#a8c87a', textDecoration: 'none' }}>Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}


export default Login;