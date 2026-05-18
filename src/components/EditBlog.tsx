import axios from 'axios';
import React from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Alert, AlertTitle, Select, MenuItem, FormControl, OutlinedInput, Checkbox, ListItemText, Button } from "@mui/material";
import { useAuthStore } from "../store";

const EditBlog = () => {
    const { id } = useParams()
    const [title, setTitle] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [cityId, setCityId] = React.useState<number | "">("")
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([])
    const [series, setSeries] = React.useState("")
    const [originalSeries, setOriginalSeries] = React.useState<string | null>(null)
    const [image, setImage] = React.useState<File | null>(null)
    const [cities, setCities] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const authToken = useAuthStore(state => state.authToken)
    const userId = useAuthStore(state => state.userId)
    const navigate = useNavigate()

    const card = {
        padding: "20px",
        margin: "20px auto",
        maxWidth: "600px"
    }

    React.useEffect(() => {
        if (!authToken) {
            navigate('/login')
        }
        getBlog()
        getCities()
        getCategories()
    }, [id])

    const getBlog = () => {
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id)
            .then((response) => {
                const blog = response.data
                if (blog.creatorId !== userId) {
                    navigate('/blogs')
                    return
                }
                setTitle(blog.title)
                setDescription(blog.description)
                setCityId(blog.cityId)
                setSelectedCategoryIds(blog.categoryIds)
                setOriginalSeries(blog.series)
                setSeries(blog.series || "")
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

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

    const editBlog = () => {
        if (title === "" || description === "" || cityId === "" || selectedCategoryIds.length === 0) {
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

        if (originalSeries === null && series !== "") {
            blogData.series = series
        }

        axios.patch('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id, blogData, {
            headers: { 'X-Authorization': authToken }
        })
            .then(() => {
                if (image) {
                    axios.put('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/' + id + '/image', image, {
                        headers: { 'Content-Type': image.type, 'X-Authorization': authToken }
                    })
                        .then(() => {
                            navigate('/blogs/' + id)
                        })
                } else {
                    navigate('/blogs/' + id)
                }
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const inputStyle = {
        height: '56px', padding: '0 14px', fontSize: '16px',
        borderRadius: '4px', border: '1px solid #ccc',
        fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' as any
    }

    return (
        <div>
            <Paper elevation={3} style={card}>
                <h1 style={{textAlign: 'center'}}>Edit Blog</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
                    <div>
                        <label>Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div>
                        <label>Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{padding: '14px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', minHeight: '150px'}}
                        />
                    </div>
                    <div>
                        <label>City *</label>
                        <select
                            value={cityId}
                            onChange={(e) => setCityId(Number(e.target.value))}
                            style={{...inputStyle, display: 'block'}}>
                            <option value="">Select a city</option>
                            {cities.map((city: any) => (
                                <option key={city.cityId} value={city.cityId}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Categories *</label>
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
                                }}>
                                {categories.map((category: any) => (
                                    <MenuItem key={category.categoryId} value={category.categoryId}>
                                        <Checkbox checked={selectedCategoryIds.includes(category.categoryId)}/>
                                        <ListItemText primary={category.name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    {originalSeries !== null ? (
                        <div>
                            <label>Series (cannot be changed once set)</label>
                            <input
                                type="text"
                                value={originalSeries}
                                disabled
                                style={{...inputStyle, background: '#f5f5f5', color: '#999'}}
                            />
                        </div>
                    ) : (
                        <div>
                            <label>Series (optional)</label>
                            <input
                                type="text"
                                placeholder="Series name"
                                value={series}
                                onChange={(e) => setSeries(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}
                    <div>
                        <label>Cover image (optional — upload to replace existing)</label>
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif"
                            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <Button variant="contained" fullWidth onClick={editBlog}>
                        Save Changes
                    </Button>
                </div>
            </Paper>
        </div>
    )
}

export default EditBlog;