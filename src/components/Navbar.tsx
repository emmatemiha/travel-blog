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
        <nav style={{background: '#0c2c1b', padding: '0px 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {/* Home Button */}
            <div style={{ width: '160px', display: 'flex', alignItems: 'center' }}>
                <Link to="/blogs">
                    <HomeIcon style={{color: 'white', fontSize: '32px'}}/>
                </Link>
            </div>

            {/* Centred Logo */}
            <div style={{ textAlign: 'center', flex: 1 }}>
                {/* Swap the <span> below for an <img> once you have your PNG logo */}
                {/* <img src="/logo.png" alt="Adventures in Aotearoa" style={{ height: '36px' }} /> */}
                <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: 'white',
                    fontSize: '22px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '0.3px',
                }}>
                    Adventures in Aotearoa
                </div>
                <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: 'rgba(255,255,255,0.55)',
                    fontSize: '10px',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginTop: '1px',
                }}>
                    travel blog
                </div>
            </div>



            <div style={{width: '160px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'flex-end' }}>
                {authToken ? (
                    <>
                        <Link to={'/profile/' + userId} style={{color: 'white', textDecoration: 'none'}}>Profile</Link>
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
                        <Link to="/login" style={{color: 'white', textDecoration: 'none'}}>Log in</Link>
                        <Link to="/register" style={{color: 'white', textDecoration: 'none'}}>Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;