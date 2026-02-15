import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, Youtube, Facebook, ArrowLeft, Loader2, UploadCloud,
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';

const CreateBlog = () => {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [formData, setFormData] = useState({
        title: '',
        content: '', // In a real app, use a Rich Text Editor like React Quill here
        category: 'Travel Tips',
        tags: '', // Comma separated
        youtubeUrl: '',
        facebookUrl: '',
        isPublished: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Cover Image (if selected)
            let uploadedCoverUrl = '';
            if (coverImage) {
                const uploadData = new FormData();
                uploadData.append('images', coverImage);
                const uploadRes = await axiosPrivate.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedCoverUrl = uploadRes.data.data.url || uploadRes.data.data.urls[0];
            }

            // 2. Prepare Payload
            const payload = {
                title: formData.title,
                content: formData.content,
                category: formData.category,
                tags: formData.tags.split(',').map(t => t.trim()),
                youtubeUrl: formData.youtubeUrl,
                facebookUrl: formData.facebookUrl,
                isPublished: formData.isPublished, // Ensure boolean
                coverImage: uploadedCoverUrl
            };

            // 3. Create Blog
            await axiosPrivate.post('/blogs', payload);
            toast.success("Blog post created successfully! 📝");
            navigate('/blogs');

        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create blog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/blogs')} className="p-2 bg-dd-card border border-gray-700 rounded-lg text-white hover:border-dd-orange">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-3xl font-bold text-white">Write New Post</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Basic Info */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-dd-text-muted mb-1">Blog Title</label>
                        <input required name="title" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="e.g. 10 Hidden Gems in Manali" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Category</label>
                            <select name="category" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none">
                                <option>Travel Tips</option>
                                <option>Destinations</option>
                                <option>Food & Culture</option>
                                <option>News & Updates</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Tags (Comma separated)</label>
                            <input name="tags" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="Solo, Budget, Winter" />
                        </div>
                    </div>
                </div>

                {/* 2. Content */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                    <label className="block text-sm text-dd-text-muted mb-1">Content</label>
                    <textarea required name="content" rows={12} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="Start writing your story..." />
                </div>

                {/* 3. Media & Videos (🆕 NEW SECTION) */}
                <div className="bg-dd-card border border-gray-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Media & Videos</h3>

                    {/* Cover Image Upload */}
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-dd-orange hover:text-dd-orange cursor-pointer transition-all">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Cover" className="h-40 object-cover rounded-lg" />
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
                                <input name="youtubeUrl" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="https://youtu.be/..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Facebook Video URL</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-3 text-blue-500" size={18} />
                                <input name="facebookUrl" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="https://facebook.com/watch/..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <label className="flex items-center gap-2 text-white cursor-pointer select-none">
                        <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData(prev => ({...prev, isPublished: e.target.checked}))} className="w-5 h-5 rounded border-gray-700 bg-dd-sidebar text-dd-orange focus:ring-0" />
                        Publish Immediately
                    </label>
                    <button type="submit" disabled={loading} className="bg-gradient-to-r from-dd-orange to-dd-red text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Post
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateBlog;