import axios from 'axios';
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Button, Pagination } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import defaultPfp from '../assets/default_pfp.png'

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
    const navigate = useNavigate()

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

        if (searchQuery !== "") params.q = searchQuery
        if (selectedCityIds.length > 0) params.cityIds = selectedCityIds
        if (selectedCategoryIds.length > 0) params.categoryIds = selectedCategoryIds
        if (numReactions !== "") params.numReactions = Number(numReactions)

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
                setCities(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/blogs/categories')
            .then((response) => {
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const getCityName = (cityId: number) => {
        const city = cities.find((c: any) => c.cityId === cityId)
        return city ? city.name : cityId
    }

    const getCategoryNames = (categoryIds: number[]) => {
        const names = categoryIds.map((id: number) => {
            const category = categories.find((c: any) => c.categoryId === id)
            return category ? category.name : id
        })
        return names.join(', ')
    }

    {/*reusable sx's :)*/}
    const selectSx = {
        fontFamily: "'Lato', sans-serif",
        fontSize: '13px',
        height: '34px',
        color: '#9aba9a',
        background: '#1a2e1c',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2a4a2e' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4a7a4e' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5a8a5e' },
        '& .MuiSvgIcon-root': { color: '#6a9a6e' }
    }

    const menuItemSx = {
        fontFamily: "'Lato', sans-serif",
        fontSize: '13px',
        color: '#e8e0d0',
        background: '#111e13',
        '&:hover': { background: '#1a2e1c' },
        '&.Mui-selected': { background: '#1a2e1c' },
        '&.Mui-selected:hover': { background: '#1e3320' },
        padding: '6px 12px'
    }

    const menuProps = {
        slotProps: {
            paper: {
                sx: {
                    background: '#111e13',
                    border: '1px solid #1e3320',
                    borderRadius: '4px',
                    boxShadow: '0 8px 24px #00000080',
                    '& .MuiList-root': { padding: 0 }
                }
            }
        }
    }

    const blog_rows = () => {
        return blogs.map((row: any) =>
            <div
                key={row.blogId}
                onClick={() => navigate('/blogs/' + row.blogId)}
                style={{ background: '#111e13', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#162318')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#111e13')}
            >
                {/*cover image*/}
                <div style={{ position: 'relative', height: '160px', background: '#1a3320', overflow: 'hidden' }}>
                    <img
                        src={'http://localhost:4941/api/v1/blogs/' + row.blogId + '/image'}
                        alt={row.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/*city label over image*/}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 16px 8px', background: 'linear-gradient(to top, #0a1209cc 0%, transparent 100%)' }}>
                        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#a8c8a0', fontFamily: "'Lato', sans-serif" }}>
                            {getCityName(row.cityId)}
                        </span>
                    </div>
                </div>

                {/*blog card text section*/}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: '#e0d8c8', lineHeight: 1.35, fontWeight: 400 }}>
                        {row.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img
                            src={'http://localhost:4941/api/v1/users/' + row.creatorId + '/image'}
                            alt="Creator"
                            style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2a4a2e', flexShrink: 0 }}
                            onError={(e: any) => { e.target.src = defaultPfp }}
                        />
                        <span style={{ fontSize: '12px', color: '#7a9e7e', fontFamily: "'Lato', sans-serif", marginBottom: '2px' }}>
                            {row.creatorFirstName} {row.creatorLastName}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {getCategoryNames(row.categoryIds).split(', ').map((category: string) => (
                            <span key={category} style={{ fontSize: '10px', color: '#6a8e6e', border: '1px solid #2a4a2e', padding: '2px 7px', borderRadius: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
                                {category}
                            </span>
                        ))}
                    </div>
                </div>

                {/*bottom of card with date and reactions*/}
                <div style={{ padding: '8px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a2e1c' }}>
                    <span style={{ fontSize: '11px', color: '#5a7a5e', fontFamily: "'Lato', sans-serif" }}>
                        {new Date(row.creationDate).toLocaleDateString('en-NZ')}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6a8e6e', fontFamily: "'Lato', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>♡</span>
                        <span>{row.numReactions} {row.numReactions === 1 ? 'reaction' : 'reactions'}</span>
                    </span>
                </div>
            </div>
        )
    }

    if (errorFlag) {
        return (
            <div style={{ background: '#0f1a12', minHeight: '100vh', padding: '40px', color: '#e8e0d0', fontFamily: "'Lato', sans-serif" }}>
                <p>Error: {errorMessage}</p>
            </div>
        )
    } else {
        return (
            <div style={{ background: '#0f1a12', minHeight: '100vh' }}>
                
                {/*hero*/}
                <div
                    style={{ position: 'relative', height: '240px', background: 'linear-gradient(to bottom, #0f2015 0%, #0a1209 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid #1e3320' }}>
                        
                    <div style={{ position: 'relative', zIndex: 1, padding: '0 40px', textAlign: 'center' }}>
                        <div style={{ fontSize: '9px', letterSpacing: '4px', color: '#7aba7a', textTransform: 'uppercase', marginBottom: '10px', fontFamily: "'Lato', sans-serif" }}>
                            Exploring New Zealand
                        </div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '38px', color: '#f0e8d8', fontWeight: 400, margin: '0 0 4px', lineHeight: 1.2 }}>
                            Stories from
                        </h1>

                        <h1 style={{ color: '#a8c87a', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", fontSize: '38px', fontWeight: 400, margin: '0 0 14px 0', lineHeight: 1.2 }}>
                            the land of the long white cloud
                        </h1>
                        
                        <div style={{ display: 'flex', gap: '28px', justifyContent: 'center' }}>
                            <div>
                                <div style={{ fontFamily: "'Lato', sans-serif", fontSize: '18px', color: '#c8e0b0' }}>{count}</div>
                                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5a8a5e', fontFamily: "'Lato', sans-serif" }}>Stories</div>
                            </div>
                            <div>
                                <div style={{ fontFamily: "'Lato', sans-serif", fontSize: '18px', color: '#c8e0b0' }}>{cities.length}</div>
                                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: '#5a8a5e', fontFamily: "'Lato', sans-serif" }}>Destinations</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/*search filters*/}
                <div style={{ background: '#0d1810', borderBottom: '1px solid #1e3320', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}>Sort</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ height: '34px', padding: '0 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #2a4a2e', fontFamily: "'Lato', sans-serif", background: '#1a2e1c', color: '#9aba9a', cursor: 'pointer', outline: 'none',  accentColor: '#2d5a30' }}>
                        <option value="ALPHABETICAL_ASC">Title A-Z</option>
                        <option value="ALPHABETICAL_DESC">Title Z-A</option>
                        <option value="REACTIONS_ASC">Reactions ascending</option>
                        <option value="REACTIONS_DESC">Reactions descending</option>
                        <option value="CREATED_DESC">Newest first</option>
                        <option value="CREATED_ASC">Oldest first</option>
                    </select>
                    
                    <div style={{ width: '1px', height: '20px', background: '#1e3320', margin: '0 4px' }} />
                    <span style={{ fontSize: '10px', color: '#4a6a4e', fontFamily: "'Lato', sans-serif", letterSpacing: '2px', textTransform: 'uppercase' }}>Filter</span>

                    <FormControl size="small" style={{ minWidth: 120 }}>
                        <InputLabel sx={{ fontFamily: "'Lato', sans-serif", color: '#6a9a6e', fontSize: '13px', '&.Mui-focused': { color: '#8aba8e' } }}>City</InputLabel>
                        <Select
                            multiple
                            value={selectedCityIds}
                            onChange={(e) => { setSelectedCityIds(e.target.value as number[]); setCurrentPage(1) }}
                            input={<OutlinedInput label="City" />}
                            renderValue={(selected) => `${selected.length} selected`}
                            MenuProps={menuProps}
                            sx={selectSx}>
                            {cities.map((city: any) => (
                                <MenuItem key={city.cityId} value={city.cityId} sx={menuItemSx}>
                                    <Checkbox
                                        checked={selectedCityIds.includes(city.cityId)}
                                        size="small"
                                        sx={{ color: '#4a7a4e', '&.Mui-checked': { color: '#7aba7a' } }}
                                    />
                                    <ListItemText primary={city.name}
                                        slotProps={{ primary: { style: { fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#e8e0d0' } } }}
                                    />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" style={{ minWidth: 140 }}>
                        <InputLabel sx={{ fontFamily: "'Lato', sans-serif", color: '#6a9a6e', fontSize: '13px', '&.Mui-focused': { color: '#8aba8e' } }}>Category</InputLabel>
                        <Select
                            multiple
                            value={selectedCategoryIds}
                            onChange={(e) => { setSelectedCategoryIds(e.target.value as number[]); setCurrentPage(1) }}
                            input={<OutlinedInput label="Category" />}
                            renderValue={(selected) => `${selected.length} selected`}
                            MenuProps={menuProps}
                            sx={selectSx}>
                            {categories.map((category: any) => (
                                <MenuItem key={category.categoryId} value={category.categoryId} sx={menuItemSx}>
                                    <Checkbox
                                        checked={selectedCategoryIds.includes(category.categoryId)}
                                        size="small"
                                        sx={{ color: '#4a7a4e', '&.Mui-checked': { color: '#7aba7a' } }}
                                    />
                                    <ListItemText primary={category.name}
                                        slotProps={{ primary: { style: { fontFamily: "'Lato', sans-serif", fontSize: '13px', color: '#e8e0d0' } } }}
                                    />
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
                        className="dark-placeholder"
                        style={{ height: '34px', padding: '0 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #2a4a2e', fontFamily: "'Lato', sans-serif", width: '120px', color: '#9aba9a', background: '#1a2e1c', outline: 'none' }}
                    />

                    <div style={{ width: '1px', height: '20px', background: '#1e3320', margin: '0 4px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #2a4a2e', borderRadius: '4px', height: '34px', paddingLeft: '10px', background: '#1a2e1c', flex: 1, minWidth: '160px' }}>
                        <input
                            type="text"
                            placeholder="Search stories..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                            className="dark-placeholder"
                            style={{ border: 'none', outline: 'none', fontSize: '13px', fontFamily: "'Lato', sans-serif", flex: 1, background: 'transparent', color: '#9aba9a' }}
                        />
                        <SearchIcon style={{ color: '#4a6a4e', fontSize: '18px', marginRight: '8px' }} />
                    </div>
                </div>

                {/*section label*/}
                <div style={{ padding: '14px 20px 6px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4a6a4e', fontFamily: "'Lato', sans-serif" }}>
                    Latest stories
                </div>

                {/*blog grid!*/}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#1a2e1c' }}>
                    {blog_rows()}
                </div>

                {/*pagination*/}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                    <Pagination
                        count={Math.ceil(count / pageSize)}
                        page={currentPage}
                        onChange={(event, value) => setCurrentPage(value)}
                        shape="rounded"
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': { color: '#e0d8c8', fontFamily: "'Lato', sans-serif" },
                            '& .Mui-selected': { backgroundColor: '#2d5a30  !important', color: 'c8e8c0' },
                            '& .Mui-selected:hover': { backgroundColor: '#3a6e3e  !important' }
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default Blogs;