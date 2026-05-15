import axios from 'axios';
import React from "react";
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, AlertTitle } from "@mui/material";

const Blogs = () => {
    const [blogs, setBlogs] = React.useState<Array<any>>([])
    const [categories, setCategories] = React.useState<Array<any>>([])
    const [cities, setCities] = React.useState<Array<any>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [sortBy, setSortBy] = React.useState("CREATED_DESC")

    const card = { // so the page doesn't look as cramped
        padding: "10px",
        margin: "20px",
    }

    React.useEffect(() => {
        getBlogs()
        getCities()
        getCategories()
    }, [sortBy])

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
        axios.get('https://seng365.csse.canterbury.ac.nz/api/v1/blogs?sortBy=' + sortBy)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setBlogs(response.data.blogs)
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
            <TableRow hover
                tabIndex={-1}
                key={row.blogId}>
                <TableCell>
                    {row.blogId}
                </TableCell>
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
                    <Link to={"/blogs/" + row.blogId}>View Blog</Link>
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
                    <h1>Blogs</h1>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="CREATED_DESC">Newest first</option>
                        <option value="CREATED_ASC">Oldest first</option>
                        <option value="TITLE_ASC">Title A-Z</option>
                        <option value="TITLE_DESC">Title Z-A</option>
                        <option value="REACTIONS_ASC">Least reactions</option>
                        <option value="REACTIONS_DESC">Most reactions</option>
                    </select>

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
                </Paper>
            </div>
        )
    }
}

export default Blogs;