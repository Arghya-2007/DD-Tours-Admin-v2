import { useEffect, useState } from 'react';
import {
    Plus, Edit, Trash2, Eye, Search, Youtube, Facebook
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Blog {
    id: string;
    title: string;
    slug: string;
    category: string;
    isPublished: boolean;
    views: number;
    createdAt: string;
    youtubeUrl?: string;
    facebookUrl?: string;
    coverImage?: string;
}

const Blogs = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBlogs = async () => {
        try {
            const response = await axiosPrivate.get('/blogs');
            setBlogs(response.data.data.data); // Adjust based on your API response structure
        } catch (error) {
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this blog post?")) return;
        try {
            await axiosPrivate.delete(`/blogs/${id}`);
            toast.success("Blog deleted");
            setBlogs(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredBlogs = blogs.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-dd-orange animate-pulse">Loading Blogs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Blog Posts</h2>
                    <p className="text-dd-text-muted mt-1">Share travel stories and tips.</p>
                </div>
                <Link to="/blogs/create" className="bg-dd-orange text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors">
                    <Plus size={20} /> Write New Post
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dd-card border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-white focus:border-dd-orange outline-none"
                />
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map(blog => (
                    <div key={blog.id} className="bg-dd-card border border-gray-800 rounded-xl overflow-hidden group hover:border-gray-600 transition-all">

                        {/* Image */}
                        <div className="h-48 bg-gray-800 relative">
                            {blog.coverImage ? (
                                <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                {blog.youtubeUrl && <span className="bg-red-600 text-white p-1 rounded"><Youtube size={14}/></span>}
                                {blog.facebookUrl && <span className="bg-blue-600 text-white p-1 rounded"><Facebook size={14}/></span>}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded ${blog.isPublished ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                    {blog.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-dd-orange transition-colors">
                                {blog.title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Eye size={14} /> {blog.views} Views
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-2 bg-dd-sidebar">
                            <button onClick={() => navigate(`/blogs/edit/${blog.id}`)} className="p-2 hover:bg-gray-700 rounded text-blue-400">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(blog.id)} className="p-2 hover:bg-gray-700 rounded text-dd-danger">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;