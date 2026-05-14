import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Blog from "./components/Blog";
import Blogs from "./components/Blogs";
import CreateBlog from "./components/CreateBlog";
import EditBlog from "./components/EditBlog";
import Login from "./components/Login";
import MyBlogs from "./components/MyBlogs";
import NotFound from "./components/NotFound";
import Profile from "./components/Profile";
import Register from "./components/Register";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Blogs/>}/>
          <Route path="/blogs" element={<Blogs/>}/>
          <Route path="/blogs/:id" element={<Blog/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/profile/:id" element={<Profile/>}/>
          <Route path="/my-blogs" element={<MyBlogs/>}/>
          <Route path="/blogs/create" element={<CreateBlog/>}/>
          <Route path="/blogs/:id/edit" element={<EditBlog/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;