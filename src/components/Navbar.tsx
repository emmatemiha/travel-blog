import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../store";
import axios from 'axios';
import HomeIcon from "@mui/icons-material/Home";
import { Button } from "@mui/material";

const Navbar = () => {
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const removeAuth = useAuthStore(state => state.removeAuth)
    const navigate = useNavigate()

    const logout = () => {
        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/users/logout', {}, {
            headers: { 'X-Authorization': authToken }
        })
            .then(() => {
                removeAuth()
                navigate('/blogs')
            }, () => {
                removeAuth()
                navigate('/blogs')
            })
    }

    return (
        <nav style={{background: '#0c2c1b', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Link to="/blogs">
                <HomeIcon style={{color: 'white', fontSize: '32px'}}/>
            </Link>
            <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                {authToken ? (
                    <>
                        <Link to={'/profile/' + userId} style={{color: 'white', textDecoration: 'none'}}>My Profile</Link>
                        <Link to="/my-blogs" style={{color: 'white', textDecoration: 'none'}}>My Blogs</Link>
                        <Link to="/blogs/create" style={{color: 'white', textDecoration: 'none'}}>Create</Link>
                        <Button variant="contained" onClick={logout} style={{color: "#0c2c1b", borderColor: 'white'}}
                            sx={{backgroundColor: "white"}}
                        >
                            Log out
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Login</Link>
                        <Link to="/register" style={{color: 'white', textDecoration: 'none'}}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;