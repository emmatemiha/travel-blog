import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from "../store";
import axios from 'axios';
import HomeIcon from "@mui/icons-material/Home";
import { Button, Menu, MenuItem } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddIcon from '@mui/icons-material/Add';

const Navbar = () => {
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const removeAuth = useAuthStore(state => state.removeAuth)
    const navigate = useNavigate()
    const [menuButton, setMenuButton] = React.useState<null | HTMLElement>(null)

    const handleMenuOpen = (event: React.MouseEvent<any>) => {
        setMenuButton(event.currentTarget)
    }

    const handleMenuClose = () => {
        setMenuButton(null)
    }

    const logout = () => {
        handleMenuClose()
        axios.post('http://localhost:4941/api/v1/users/logout', {}, {
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
        <nav style={{ background: '#0a1209', padding: '0px 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e3320' }}>

            <div style={{ width: '160px', display: 'flex', alignItems: 'center' }}>
                <Link to="/blogs">
                    <HomeIcon style={{ color: '#5a8a5e', fontSize: '30px' }} />
                </Link>
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: "'Playfair Display', serif", color: '#e8e0d0', fontSize: '17px', fontWeight: 400, lineHeight: 1.1, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                    Adventures in Aotearoa
                </div>
                <div style={{ fontFamily: "'Lato', sans-serif", color: '#7a9e7e', fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '3px' }}>
                    travel blog
                </div>
            </div>

            <div style={{ width: '160px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                {authToken ? (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/blogs/create')}
                            sx={{
                                color: '#a8c5a0',
                                borderColor: '#3a5c3e',
                                '&:hover': { borderColor: '#5a8a5e', background: '#5a8a5e1a' },
                                fontFamily: "'Lato', sans-serif",
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                fontSize: '12px'
                            }}>
                            Create
                        </Button>

                        <AccountCircleIcon
                            onClick={handleMenuOpen}
                            style={{ color: '#5a8a5e', fontSize: '32px', cursor: 'pointer' }}
                        />

                        <Menu
                            anchorEl={menuButton}
                            open={Boolean(menuButton)}
                            onClose={handleMenuClose}
                            slotProps={{
                                paper: {
                                    sx: {
                                        background: '#111e13',
                                        border: '1px solid #1e3320',
                                        boxShadow: '0 8px 24px #00000066'
                                    }
                                }
                            }}>
                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate('/profile/' + userId) }}
                                sx={{ fontFamily: "'Lato', sans-serif", color: '#e8e0d0', fontSize: '14px', '&:hover': { background: '#1a2e1c' } }}>
                                My Profile
                            </MenuItem>
                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate('/my-blogs') }}
                                sx={{ fontFamily: "'Lato', sans-serif", color: '#e8e0d0', fontSize: '14px', '&:hover': { background: '#1a2e1c' }  }}>
                                My Blogs
                            </MenuItem>
                            <MenuItem
                                onClick={logout}
                                sx={{ fontFamily: "'DM Sans', sans-serif", color: '#e8e0d0', fontSize: '14px', '&:hover': { background: '#1a2e1c' }  }}>
                                Log Out
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#a8c5a0', textDecoration: 'none', fontFamily: "'Lato', sans-serif", fontSize: '14px', letterSpacing: '0.5px' }}>
                            Log in
                        </Link>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate('/register')}
                            sx={{
                                color: '#c8e8c0',
                                borderColor: '#4a8a4e',
                                background: '#2d5a30',
                                '&:hover': { background: '#3a6e3e', borderColor: '#5a9a5e' },
                                fontFamily: "'Lato', sans-serif",
                                textTransform: 'none',
                                fontSize: '13px'
                            }}>
                            Sign up
                        </Button>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;