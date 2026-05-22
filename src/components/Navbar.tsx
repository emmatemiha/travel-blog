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
        <nav style={{ background: '#0c2c1b', padding: '0px 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <div style={{ width: '160px', display: 'flex', alignItems: 'center' }}>
                <Link to="/blogs">
                    <HomeIcon style={{ color: 'white', fontSize: '32px' }} />
                </Link>
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", color: 'white', fontSize: '22px', fontWeight: 700, lineHeight: 1.1, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>Adventures in Aotearoa</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.55)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '1px' }}>travel blog</div>
            </div>

            <div style={{ width: '160px', display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'flex-end' }}>
                {authToken ? (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/blogs/create')}
                            sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' }, fontFamily: "'DM Sans', sans-serif", textTransform: 'none', whiteSpace: 'nowrap' }}>
                            Create
                        </Button>
                        <AccountCircleIcon
                            onClick={handleMenuOpen}
                            style={{ color: 'white', fontSize: '36px', cursor: 'pointer' }}
                        />

                        <Menu
                            anchorEl={menuButton}
                            open={Boolean(menuButton)}
                            onClose={handleMenuClose}>
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile/' + userId) }}
                                sx={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b' }}>
                                My Profile
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/my-blogs') }}
                                sx={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b' }}>
                                My Blogs
                            </MenuItem>
                            <MenuItem onClick={logout} style={{ color: 'red' }}
                                sx={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b' }}>
                                Log Out
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Log in</Link>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar;