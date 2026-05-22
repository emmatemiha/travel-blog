import axios from 'axios';
import React from "react";
import { Link } from 'react-router-dom';
import { Alert, AlertTitle, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Button, Pagination } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';

const Blogs = () => {
    const [blogs, setBlogs] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const [cities, setCities] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [sortBy, setSortBy] = React.useState("CREATED_DESC")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedCityIds, setSelectedCityIds] = React.useState<number[]>([])
    const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<number[]>([])
    const [currentPage, setCurrentPage] = React.useState(1)
    const pageSize = 9
    const [count, setCount] = React.useState(0) // to keep track of pagination
    const [numReactions, setNumReactions] = React.useState("")

    const handleNumReactionsChange = (e: any) => {
        setNumReactions(e.target.value)
        setCurrentPage(1)
    }

    React.useEffect(() => {
        getCities()
        getCategories()
    }, [])

    React.useEffect(() => {
        getBlogs()
    }, [sortBy, searchQuery, selectedCityIds, selectedCategoryIds, currentPage, numReactions])

    const getBlogs = () => {
        const params: any = {
            sortBy: sortBy,
            count: pageSize,
            startIndex: (currentPage - 1) * pageSize
        }

        if (searchQuery !== "") {
            params.q = searchQuery
        }

        if (selectedCityIds.length > 0) {
            params.cityIds = selectedCityIds
        }

        if (selectedCategoryIds.length > 0) {
            params.categoryIds = selectedCategoryIds
        }

        if (numReactions !== "") {
            params.numReactions = Number(numReactions)
        }

        axios.get('http://localhost:4941/api/v1/blogs', { params })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setBlogs(response.data.blogs)
                setCount(response.data.count)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCities = () => {
        axios.get('http://localhost:4941/api/v1/blogs/cities')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setCities(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/blogs/categories')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCityName = (cityId: number) => {
        const city = cities.find((c: any) => c.cityId === cityId)
        if (city) {
            return city.name
        } else {
            return cityId
        }
    }

    const getCategoryNames = (categoryIds: number[]) => {
        const names = categoryIds.map((id: number) => {
            const category = categories.find((c: any) => c.categoryId === id)
            if (category) {
                return category.name
            } else {
                return id
            }
        })
        return names.join(', ')
    }

    const blog_rows = () => {
        return blogs.map((row: any) =>
            <div key={row.blogId} style={{ background: 'white', borderRadius: '12px', border: '1px solid #0c2c1b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#0c2c1b', fontWeight: 700, textDecoration: 'underline', marginBottom: '12px', wordBreak: 'break-word', lineHeight: '1.1' }}>
                        {row.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0c2c1b', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', wordBreak: 'break-word' }}>
                        <img
                            src={'http://localhost:4941/api/v1/users/' + row.creatorId + '/image'}
                            alt="Creator"
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #0c2c1b' }}
                            onError={(e: any) => { e.target.src = '/src/assets/default_pfp.png' }}
                        />
                        By {row.creatorFirstName} {row.creatorLastName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0c2c1b' }}>
                        {new Date(row.creationDate).toLocaleDateString('en-NZ')}
                    </div>
                </div>

                <img
                    src={'http://localhost:4941/api/v1/blogs/' + row.blogId + '/image'}
                    alt={row.title}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                />

                <div style={{ padding: '12px 16px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#0c2c1b' }}>
                        📍 {getCityName(row.cityId)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0c2c1b' }}>
                        {getCategoryNames(row.categoryIds)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0c2c1b' }}>
                        ♡ {row.numReactions} {row.numReactions === 1 ? 'reaction' : 'reactions'}
                    </div>
                    <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        to={"/blogs/" + row.blogId}
                        sx={{ backgroundColor: "#0c2c1b", "&:hover": { backgroundColor: "#071a10" } }}
                    >
                        View
                    </Button>
                </div>
            </div>
        )
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Blogs</h1>
                {errorFlag &&
                    <Alert severity="error">
                        <AlertTitle>Error</AlertTitle>
                        {errorMessage}
                    </Alert>}
            </div>
        )
    } else {
        return (
            <div style={{ background: '#eef2ee', minHeight: '100vh', padding: '20px' }}>
                <div style={{ background: 'white', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', border: '1px solid #0c2c1b' }}>
                    <span style={{ fontSize: '14px', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif" }}>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ height: '38px', padding: '0 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #0c2c1b', fontFamily: "'DM Sans', sans-serif", background: 'white', color: '#0c2c1b', cursor: 'pointer' }}>
                        <option value="ALPHABETICAL_ASC">Title A-Z</option>
                        <option value="ALPHABETICAL_DESC">Title Z-A</option>
                        <option value="REACTIONS_ASC">Reactions ascending</option>
                        <option value="REACTIONS_DESC">Reactions descending</option>
                        <option value="CREATED_DESC">Newest first</option>
                        <option value="CREATED_ASC">Oldest first</option>
                    </select>

                    <span style={{ fontSize: '14px', color: '#0c2c1b', fontFamily: "'DM Sans', sans-serif" }}>Filter by:</span>

                    <FormControl size="small" style={{ minWidth: 140 }}>
                        <InputLabel style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '14px' }}>City</InputLabel>
                        <Select
                            multiple
                            value={selectedCityIds}
                            onChange={(e) => { setSelectedCityIds(e.target.value as number[]); setCurrentPage(1) }}
                            input={<OutlinedInput label="City" />}
                            renderValue={(selected) => `${selected.length} selected`}
                            sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', height: '38px', color: '#0c2c1b',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '& .MuiSvgIcon-root': { color: '#0c2c1b' } }}>
                            {cities.map((city: any) => (
                                <MenuItem key={city.cityId} value={city.cityId}>
                                    <Checkbox
                                        checked={selectedCityIds.includes(city.cityId)}
                                        size="small"
                                        sx={{ color: '#0c2c1b', '&.Mui-checked': { color: '#0c2c1b' } }}
                                    />
                                    <ListItemText primary={city.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" style={{ minWidth: 160 }}>
                        <InputLabel style={{ fontFamily: "'DM Sans', sans-serif", color: '#0c2c1b', fontSize: '14px' }}>Category</InputLabel>
                        <Select
                            multiple
                            value={selectedCategoryIds}
                            onChange={(e) => { setSelectedCategoryIds(e.target.value as number[]); setCurrentPage(1) }}
                            input={<OutlinedInput label="Category" />}
                            renderValue={(selected) => `${selected.length} selected`}
                            sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', height: '38px', color: '#0c2c1b',
                               '& .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0c2c1b' }, '& .MuiSvgIcon-root': { color: '#0c2c1b' } }}>
                            {categories.map((category: any) => (
                                <MenuItem key={category.categoryId} value={category.categoryId}>
                                    <Checkbox
                                        checked={selectedCategoryIds.includes(category.categoryId)}
                                        size="small"
                                        sx={{ color: '#0c2c1b', '&.Mui-checked': { color: '#0c2c1b' } }}
                                    />
                                    <ListItemText primary={category.name} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <input
                        type="number"
                        placeholder="Min reactions"
                        value={numReactions}
                        min={0}
                        onChange={handleNumReactionsChange}
                        className="green-placeholder"
                        style={{ height: '38px', padding: '0 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #0c2c1b', fontFamily: "'DM Sans', sans-serif", width: '130px', color: '#0c2c1b', cursor: 'pointer' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #0c2c1b', borderRadius: '6px', height: '38px', paddingLeft: '10px', background: 'white', flex: 1, minWidth: '160px' }}>
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                            className="green-placeholder"
                            style={{ border: 'none', outline: 'none', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", flex: 1, background: 'transparent', color: '#0c2c1b' }}
                        />
                        <SearchIcon style={{ color: '#0c2c1b', fontSize: '20px', marginRight: '8px' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {blog_rows()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination
                        count={Math.ceil(count / pageSize)}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        sx={{ '& .MuiPaginationItem-root': { color: '#0c2c1b' }, '& .Mui-selected': { backgroundColor: '#0c2c1b !important', color: 'white' }, '& .Mui-selected:hover': { backgroundColor: '#071a10 !important' } }}
                    />
                </div>
            </div>
        )
    }
}

export default Blogs;