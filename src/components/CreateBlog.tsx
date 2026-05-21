import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Select, MenuItem, FormControl, OutlinedInput, Checkbox, ListItemText, Button } from "@mui/material";
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
        width: "600px",
        border: '1px solid #0c2c1b',
        borderRadius: '12px'
    }

    React.useEffect(() => {
        if (!authToken) {
            navigate('/login')
        }
        getCities()
        getCategories()
    }, [])

    const getCities = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/cities')
            .then((response) => {
                setCities(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCategories = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/categories')
            .then((response) => {
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const createBlog = () => {
        if (title === "" || description === "" || cityId === "" || selectedCategoryIds.length === 0 || !image) {
            setErrorFlag(true)
            setErrorMessage("Please fill in all required fields")
            return
        }

        const blogData: any = {
            title: title,
            description: description,
            cityId: cityId,
            categoryIds: selectedCategoryIds
        }

        if (series !== "") {
            blogData.series = series
        }

        axios.post('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', blogData, {
            headers: { 'X-Authorization': authToken }
        })
            .then((response) => {
                const newBlogId = response.data.blogId
                if (image) {
                    axios.put('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + newBlogId + '/image', image, {
                        headers: { 'Content-Type': image.type, 'X-Authorization': authToken }
                    })
                        .then(() => {
                            navigate('/blogs/' + newBlogId)
                        })
                } else {
                    navigate('/blogs/' + newBlogId)
                }
            }, (error) => {
                setErrorFlag(true)
                if (error.response && error.response.status === 403) {
                    setErrorMessage("A blog with this series name already exists by another user")
                } else {
                    setErrorMessage(error.toString())
                }
            })
    }

    return (
        <div style={{minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ee', padding: '40px 0'}}>
            <Paper elevation={0} style={card}>
                <h1 style={{textAlign: 'center', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif", margin: '0 0 24px 0', fontSize: '28px'}}>Create Blog</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
                    <div>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Title*</p>
                        <input
                            type="text"
                            placeholder="Blog title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                            className="green-placeholder"
                        />
                    </div>
                    <div>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Description*</p>
                        <textarea
                            placeholder="Write your blog content here..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                padding: '14px',
                                fontSize: '16px',
                                borderRadius: '6px',
                                border: '1px solid #0c2c1b',
                                fontFamily: "'DM Sans', sans-serif",
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '150px',
                                color: '#0c2c1b',
                                outline: 'none',
                                resize: 'none',
                            }}
                            className="green-placeholder"
                        />
                    </div>
                    <div>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>City*</p>
                        <select
                            value={cityId}
                            onChange={(e) => setCityId(Number(e.target.value))}
                            style={{...inputStyle, display: 'block', color: '#0c2c1b', background: 'white',}}>
                            <option value="">Select a city</option>
                            {cities.map((city: any) => (
                                <option key={city.cityId} value={city.cityId}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Categories*</p>
                        <FormControl style={{width: '100%'}}>
                            <Select
                                multiple
                                displayEmpty
                                value={selectedCategoryIds}
                                onChange={(e) => setSelectedCategoryIds(e.target.value as number[])}
                                input={<OutlinedInput/>}
                                renderValue={(selected: any) => {
                                    if (selected.length === 0) return "Select categories"
                                    return `${selected.length} selected`
                                }}
                                sx={{
                                    color: '#0c2c1b',

                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#0c2c1b',
                                    },

                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#0c2c1b',
                                    },

                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#0c2c1b',
                                    },

                                    '& .MuiSvgIcon-root': {
                                        color: '#0c2c1b',
                                    },

                                    '& .MuiSelect-select': {
                                        textAlign: 'left',
                                        display: 'block',
                                        color: '#0c2c1b',
                                    }
                                }}
                            >
                                {categories.map((category: any) => (
                                    <MenuItem
                                        key={category.categoryId}
                                        value={category.categoryId}
                                    >
                                        <Checkbox
                                            checked={selectedCategoryIds.includes(category.categoryId)}
                                            sx={{
                                                color: '#0c2c1b',
                                                '&.Mui-checked': {
                                                    color: '#0c2c1b',
                                                }
                                            }}
                                        />
                                        <ListItemText primary={category.name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Series (optional)</p>
                        <input
                            type="text"
                            placeholder="Series name"
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                            style={inputStyle}
                            className="green-placeholder"
                        />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{margin: '0 0 8px 0', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif"}}>Image*</p>
                        <label style={{cursor: 'pointer', color: '#0c2c1b', border: '1px solid #0c2c1b', borderRadius: '6px', padding: '8px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px'}}>
                            Choose file
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/gif"
                                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                                style={{display: 'none'}}
                            />
                        </label>
                        {image && <p style={{color: '#0c2c1b', fontSize: '13px', marginTop: '4px'}}>{image.name}</p>}
                        {!image && <p style={{color: '#6e6e6e', fontSize: '13px', marginTop: '4px'}}>No file chosen</p>}
                    </div>
                    <Button variant="contained" fullWidth onClick={createBlog}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}
                    >
                        Create Blog
                    </Button>
                </div>
            </Paper>
        </div>
    )
}

export default CreateBlog;