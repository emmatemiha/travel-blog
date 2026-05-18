import axios from 'axios';
import React from "react";
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, AlertTitle, Select, MenuItem, InputLabel, FormControl, OutlinedInput, Checkbox, ListItemText, Button, Pagination } from "@mui/material";

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
    const pageSize = 10
    const [count, setCount] = React.useState(0) // to keep track of pagination
    const [numReactions, setNumReactions] = React.useState("")

    const card = { // so the page doesn't look as cramped
        padding: "10px",
        margin: "20px",
    }

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
    }, [sortBy, searchQuery, selectedCityIds, selectedCategoryIds, currentPage, numReactions]) // reruns when these change

    interface HeadCell { // tells table what datatype it displays
        id: string;
        label: string;
        numeric: boolean;
    }
    const headCells: readonly HeadCell[] = [
        { id: 'title', label: 'Title', numeric: false },
        { id: 'date', label: 'Date', numeric: false },
        { id: 'creator', label: 'Creator', numeric: false },
        { id: 'city', label: 'City', numeric: false },
        { id: 'categories', label: 'Category', numeric: false },
        { id: 'reactions', label: 'Reactions', numeric: true },
        { id: 'link', label: '', numeric: false },
    ];

    const getBlogs = () => {
        // building the url with the parameters that can change
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
        
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs', { params })
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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/cities')
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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs/categories')
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
            <TableRow hover tabIndex={-1} key={row.blogId}>
                <TableCell>
                    {row.title}
                </TableCell>
                <TableCell>
                    {new Date(row.creationDate).toLocaleDateString('en-NZ')}
                </TableCell>
                <TableCell>
                    {row.creatorFirstName} {row.creatorLastName}
                </TableCell>
                <TableCell>
                    {getCityName(row.cityId)}
                </TableCell>
                <TableCell>
                    {getCategoryNames(row.categoryIds)}
                </TableCell>
                <TableCell align="right">
                    {row.numReactions}
                </TableCell>
                <TableCell>
                    <Button variant="contained" size="small" component={Link} to={"/blogs/" + row.blogId}
                        sx={{backgroundColor: "#0c2c1b", "&:hover": {backgroundColor: "#071a10"}}}>
                        View
                    </Button>
                </TableCell>
            </TableRow>
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
            <div>
                <Paper elevation={3} style={card}>
                    <h1>Travel Blogs</h1>

                    <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px'}}>
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={searchQuery}
                            onChange={(e) => {setSearchQuery(e.target.value)
                                setCurrentPage(1)}}
                            style={{height: '56px', padding: '0 14px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc'}}
                        />

                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            style={{height: '56px', padding: '0 14px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc'}}>
                            <option value="ALPHABETICAL_ASC">Title A-Z</option>
                            <option value="ALPHABETICAL_DESC">Title Z-A</option>
                            <option value="REACTIONS_ASC">Least reactions</option>
                            <option value="REACTIONS_DESC">Most reactions</option>
                            <option value="CREATED_DESC">Newest first</option>
                            <option value="CREATED_ASC">Oldest first</option>
                        </select>

                        <FormControl style={{minWidth: 200}}>
                            <InputLabel>Filter by City</InputLabel>
                            <Select
                                multiple
                                value={selectedCityIds}
                                onChange={(e) => {
                                    setSelectedCityIds(e.target.value as number[])
                                    setCurrentPage(1)
                                }}
                                input={<OutlinedInput label="Filter by City"/>}
                                renderValue={(selected) => `${selected.length} selected`}>
                                {cities.map((city: any) => (
                                    <MenuItem key={city.cityId} value={city.cityId}>
                                        <Checkbox checked={selectedCityIds.includes(city.cityId)}/>
                                        <ListItemText primary={city.name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl style={{minWidth: 200}}>
                            <InputLabel>Filter by Category</InputLabel>
                            <Select
                                multiple
                                value={selectedCategoryIds}
                                onChange={(e) => {
                                    setSelectedCategoryIds(e.target.value as number[])
                                    setCurrentPage(1)
                                }}
                                input={<OutlinedInput label="Filter by Category"/>}
                                renderValue={(selected) => `${selected.length} selected`}>
                                {categories.map((category: any) => (
                                    <MenuItem key={category.categoryId} value={category.categoryId}>
                                        <Checkbox checked={selectedCategoryIds.includes(category.categoryId)}/>
                                        <ListItemText primary={category.name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <input
                            type="number"
                            placeholder="Minimum Reactions"
                            value={numReactions}
                            min={0}
                            onChange={handleNumReactionsChange}
                            style={{height: '56px', padding: '0 14px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', width: '160px', fontFamily: 'inherit'}}
                        />
                    </div>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' : 'left'}
                                            padding={'normal'}>
                                            {headCell.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {blog_rows()}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                        <Pagination
                            count={Math.ceil(count / pageSize)}
                            page={currentPage}
                            onChange={(event, value) => setCurrentPage(value)}
                            shape="rounded"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {color: '#0c2c1b',},
                                '& .Mui-selected': {backgroundColor: '#0c2c1b !important', color: 'white',},
                                '& .Mui-selected:hover': {backgroundColor: '#071a10 !important',},
                            }}
                        />
                    </div>

                </Paper>
            </div>
        )
    }
}

export default Blogs;