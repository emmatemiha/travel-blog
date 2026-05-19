import axios from 'axios';
import React from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Button } from "@mui/material";
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

    const card = { // so the page doesn't look as cramped
        padding: "32px",
        width: "400px",
        border: '1px solid #0c2c1b',
        borderRadius: '12px'
    }

    const Login = () => {
        if (email === "" || password === "") { // one or both empty
            setErrorFlag(true)
            setErrorMessage("Please enter your email and password")
            return
        }

        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/login', {
            email: email,
            password: password
        })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("Login successful")
                setAuth(response.data.token, response.data.userId)
                navigate('/blogs')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage("Invalid email or password")
                setEmail("")
                setPassword("")
            })
    }

    return (
        <div style={{minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ee'}}>
            <Paper elevation={0} style={card}>
                <h1 style={{textAlign: 'center', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px 0'}}>Log in</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
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
                            placeholder="Password*"
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
                    <Button variant="contained" fullWidth onClick={Login}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}
                    >
                        Log in
                    </Button>
                    <p style={{textAlign: 'center', color: '#0c2c1b'}}>Don't have an account? <Link to="/register" style={{color: '#0c2c1b'}}>Sign up</Link></p>
                </div>
            </Paper>
        </div>
    )
}


export default Login;