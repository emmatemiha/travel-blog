import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Alert, Select, MenuItem, FormControl, OutlinedInput, Checkbox, ListItemText } from "@mui/material";
import { useAuthStore } from "../store";

const CreateBlog = () => {
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [cityId, setCityId] = React.useState<number | "">("")
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([])
    const [series, setSeries] = React.useState("")
    const [image, setImage] = React.useState<File | null>(null)
    const [cities, setCities] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const authToken = useAuthStore(state => state.authToken)
    const navigate = useNavigate()

    const inputStyle = {
        height: '48px', padding: '0 14px', fontSize: '14px',
        borderRadius: '4px', border: '1px solid #2a4a2e',
        fontFamily: "'Lato', sans-serif", width: '100%',
        boxSizing: 'border-box' as any, color: '#c8d8c0',
        background: '#1a2e1c', outline: 'none'
    }

    const selectSx = {
        fontFamily: "'Lato', sans-serif", fontSize: '14px',
        color: '#9aba9a', background: '#1a2e1c',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a4a2e' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a7a4e' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5a8a5e' },
        '& .MuiSvgIcon-root': { color: '#6a9a6e' }
    }

    const menuProps = {
        slotProps: {
            paper: {
                sx: {
                    background: '#111e13', border: '1px solid #1e3320',
                    borderRadius: '4px', boxShadow: '0 8px 24px #00000080',
                    '& .MuiList-root': { padding: 0 }
                }
            }
        }
    }

    const menuItemSx = {
        fontFamily: "'Lato', sans-serif", fontSize: '13px',
        color: '#e8e0d0', background: '#111e13',
        '&:hover': { background: '#1a2e1c' },
        '&.Mui-selected': { background: '#1a2e1c' },
        padding: '6px 12px'
    }

    const labelStyle = { margin: '0 0 6px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", fontSize: '13px' }

    React.useEffect(() => {
        if (!authToken) navigate('/login')
        getCities()
        getCategories()
    }, [])

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

    const createBlog = () => {
        if (title === "" || description === "" || cityId === "" || selectedCategoryIds.length === 0 || !image) {
            setErrorFlag(true); setErrorMessage("Please fill in all required fields"); return
        }
        if (title.length > 128) { setErrorFlag(true); setErrorMessage("Title must be 128 characters or less"); return }
        if (description.length > 1024) { setErrorFlag(true); setErrorMessage("Description must be 1024 characters or less"); return }
        if (series.length > 64) { setErrorFlag(true); setErrorMessage("Series must be 64 characters or less"); return }

        const blogData: any = { title, description, cityId, categoryIds: selectedCategoryIds }
        if (series !== "") blogData.series = series

        axios.post('http://localhost:4941/api/v1/blogs', blogData, { headers: { 'X-Authorization': authToken } })
            .then((response) => {
                const newBlogId = response.data.blogId
                if (image) {
                    axios.put('http://localhost:4941/api/v1/blogs/' + newBlogId + '/image', image, {
                        headers: { 'Content-Type': image.type, 'X-Authorization': authToken }
                    }).then(() => navigate('/blogs/' + newBlogId))
                } else {
                    navigate('/blogs/' + newBlogId)
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response?.status === 403 ? "A blog with this series name already exists by another user" : error.toString())
            })
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1a12', padding: '40px 0' }}>
            <div style={{ width: '560px', background: '#111e13', border: '1px solid #1e3320', borderRadius: '8px', padding: '36px' }}>
                <h1 style={{ textAlign: 'center', color: '#f0e8d8', fontFamily: "'Playfair Display', serif", margin: '0 0 28px', fontSize: '28px', fontWeight: 400 }}>
                    Create Blog
                </h1>
                {errorFlag && (
                    <Alert severity="error" sx={{ marginBottom: '16px', fontFamily: "'Lato', sans-serif" }}>
                        {errorMessage}
                    </Alert>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <p style={labelStyle}>Title*</p>
                        <input type="text" placeholder="Blog title" value={title}
                            onChange={(e) => setTitle(e.target.value)} style={inputStyle} className="dark-placeholder" />
                    </div>
                    <div>
                        <p style={labelStyle}>Description*</p>
                        <textarea placeholder="Write your blog content here..." value={description}
                            onChange={(e) => setDescription(e.target.value)} className="dark-placeholder"
                            style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '4px', border: '1px solid #2a4a2e', fontFamily: "'Lato', sans-serif", width: '100%', boxSizing: 'border-box', minHeight: '140px', color: '#c8d8c0', background: '#1a2e1c', outline: 'none', resize: 'none' }} />
                    </div>
                    <div>
                        <p style={labelStyle}>City*</p>
                        <select value={cityId} onChange={(e) => setCityId(Number(e.target.value))}
                            style={{ ...inputStyle, cursor: 'pointer' }}>
                            <option value="" style={{ background: '#1a2e1c' }}>Select a city</option>
                            {cities.map((city: any) => (
                                <option key={city.cityId} value={city.cityId} style={{ background: '#1a2e1c' }}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p style={labelStyle}>Categories*</p>
                        <FormControl style={{ width: '100%' }}>
                            <Select multiple displayEmpty value={selectedCategoryIds}
                                onChange={(e) => setSelectedCategoryIds(e.target.value as number[])}
                                input={<OutlinedInput />}
                                renderValue={(selected: any) => selected.length === 0 ? <span style={{ color: '#7a9e7e' }}>Select categories</span> : `${selected.length} selected`}
                                MenuProps={menuProps} sx={selectSx}>
                                {categories.map((category: any) => (
                                    <MenuItem key={category.categoryId} value={category.categoryId} sx={menuItemSx}>
                                        <Checkbox checked={selectedCategoryIds.includes(category.categoryId)} size="small"
                                            sx={{ color: '#4a7a4e', '&.Mui-checked': { color: '#7aba7a' } }} />
                                        <ListItemText primary={category.name}
                                            slotProps={{ primary: { style: { fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#e8e0d0' } } }} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <p style={labelStyle}>Series (optional)</p>
                        <input type="text" placeholder="Series name" value={series}
                            onChange={(e) => setSeries(e.target.value)} style={inputStyle} className="dark-placeholder" />
                    </div>
                    <div>
                        <p style={labelStyle}>Image*</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <label style={{ cursor: 'pointer', color: '#a8c5a0', border: '1px solid #3a5c3e', borderRadius: '4px', padding: '7px 14px', fontFamily: "'Lato', sans-serif", fontSize: '12px', flexShrink: 0 }}>
                                Choose file
                                <input type="file" accept="image/jpeg, image/png, image/gif"
                                    onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                                    style={{ display: 'none' }} />
                            </label>
                            <span style={{ color: '#4a6a4e', fontSize: '12px', fontFamily: "'Lato', sans-serif" }}>
                                {image ? image.name : 'No file chosen · JPEG, PNG, GIF'}
                            </span>
                        </div>
                    </div>
                    <button onClick={createBlog}
                        style={{ marginTop: '4px', background: '#2d5a30', border: '1px solid #4a8a4e', color: '#c8e8c0', fontFamily: "'Lato', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                        Publish Blog
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateBlog;