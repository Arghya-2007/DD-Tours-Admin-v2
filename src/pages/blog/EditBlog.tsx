import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save, Youtube, Facebook, ArrowLeft, Loader2, UploadCloud, Eye
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';

const EditBlog = () => {
    const { id } = useParams(); // Get Blog ID from URL
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Image State
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(''); // For showing existing or new image

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Travel Tips',
        tags: '',
        youtubeUrl: '',
        facebookUrl: '',
        isPublished: false
    });

    // 1. FETCH EXISTING DATA
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                // Hitting the ID-specific route we made earlier
                const response = await axiosPrivate.get(`/blogs/id/${id}`);
                const data = response.data.data;

                setFormData({
                    title: data.title,
                    content: data.content,
                    category: data.category,
                    tags: data.tags.join(', '), // Convert array back to string
                    youtubeUrl: data.youtubeUrl || '',
                    facebookUrl: data.facebookUrl || '',
                    isPublished: data.isPublished
                });

                if (data.coverImage) {
                    setPreviewUrl(data.coverImage);
                }
            } catch (error) {
                toast.error("Failed to load blog details");
                navigate('/blogs');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchBlog();
    }, [id, axiosPrivate, navigate]);

    // 2. HANDLERS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Show local preview immediately
        }
    };

    // 3. SUBMIT UPDATE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Step A: Upload New Image (ONLY if user selected one)
            let uploadedCoverUrl = previewUrl; // Default to existing URL

            if (coverImageFile) {
                const uploadData = new FormData();
                uploadData.append('file', coverImageFile);
                const uploadRes = await axiosPrivate.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                // Handle response structure (some setups return url directly, some in array)
                uploadedCoverUrl = uploadRes.data.data.url || uploadRes.data.data.urls[0];
            }

            // Step B: Prepare Payload
            const payload = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()), // String to Array
                youtubeUrl: formData.youtubeUrl,
                facebookUrl: formData.facebookUrl,
                isPublished: formData.isPublished,
                coverImage: uploadedCoverUrl
            };

            // Step C: Update Blog
            await axiosPrivate.patch(`/blogs/${id}`, payload);

            toast.success("Blog updated successfully! ✨");
            navigate('/blogs');

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update blog");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center p-10 text-dd-orange animate-pulse">Loading Blog Data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/blogs')} className="p-2 bg-dd-card border border-gray-700 rounded-lg text-white hover:border-dd-orange transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Edit Post</h2>
                        <p className="text-dd-text-muted text-sm">Update content for "{formData.title}"</p>
                    </div>
                </div>

                {/* View Link (Optional: If you have a public frontend) */}
                <a href="#" className="text-blue-400 hover:underline flex items-center gap-2 text-sm">
                    <Eye size={16}/> Preview
                </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Basic Info */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-dd-text-muted mb-1">Blog Title</label>
                        <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none">
                                <option>Travel Tips</option>
                                <option>Destinations</option>
                                <option>Food & Culture</option>
                                <option>News & Updates</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Tags (Comma separated)</label>
                            <input name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                    </div>
                </div>

                {/* 2. Content */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                    <label className="block text-sm text-dd-text-muted mb-1">Content</label>
                    <textarea required name="content" rows={15} value={formData.content} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none leading-relaxed" />
                </div>

                {/* 3. Media & Videos */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Media & Videos</h3>

                    {/* Cover Image */}
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-dd-orange hover:text-dd-orange cursor-pointer transition-all relative group">
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Cover" className="h-48 w-full object-cover rounded-lg opacity-80 group-hover:opacity-50 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-black/70 text-white px-3 py-1 rounded-md text-sm">Click to Change</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <UploadCloud size={32} />
                                <p className="mt-2 text-sm">Upload Cover Image</p>
                            </>
                        )}
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                    </div>

                    {/* Video URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">YouTube Video URL</label>
                            <div className="relative">
                                <Youtube className="absolute left-3 top-3 text-red-500" size={18} />
                                <input name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="https://youtu.be/..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Facebook Video URL</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-3 text-blue-500" size={18} />
                                <input name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="https://facebook.com/watch/..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 border-t border-gray-800 pt-6">
                    {/* Publish Toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none bg-dd-card px-4 py-2 rounded-lg border border-gray-700">
                        <span className="text-sm text-gray-300">Status:</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={formData.isPublished} onChange={(e) => setFormData(prev => ({...prev, isPublished: e.target.checked}))} />
                            <div className={`block w-10 h-6 rounded-full ${formData.isPublished ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${formData.isPublished ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                        <span className={`text-sm font-bold ${formData.isPublished ? 'text-green-400' : 'text-gray-400'}`}>
                            {formData.isPublished ? 'Published' : 'Draft'}
                        </span>
                    </label>

                    {/* Save Button */}
                    <button type="submit" disabled={saving} className="bg-gradient-to-r from-dd-orange to-dd-red text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all">
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Update Post
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditBlog;