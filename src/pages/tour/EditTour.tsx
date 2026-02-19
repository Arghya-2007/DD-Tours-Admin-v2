import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    MapPin, DollarSign, Clock, UploadCloud, X,
    Loader2, Compass, ArrowLeft, Save, Activity
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';

const EditTour = () => {
    const { id } = useParams(); // Get Tour ID from URL
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // 1. FORM STATE
    const [formData, setFormData] = useState({
        tourTitle: '',
        tourPrice: '',
        tourDuration: '',
        tourDescription: '',
        maxSeats: '',
        startLocation: '',
        tourType: 'Adventure',
        tourStatus: 'UPCOMING', // 🆕 ADDED TOUR STATUS

        isFixedDate: false,
        expectedMonth: 'January',
        fixedDate: '',
        bookingDeadline: '',

        coveredPlaces: '',
        includedItems: '',
    });

    // 2. IMAGE STATE
    const [existingImages, setExistingImages] = useState<string[]>([]); // URLs from DB
    const [newFiles, setNewFiles] = useState<File[]>([]); // New files to upload
    const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Previews for new files

    // FETCH EXISTING DATA
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axiosPrivate.get(`/tours/id/${id}`);
                const data = response.data.data;

                // Populate Form
                setFormData({
                    tourTitle: data.tourTitle,
                    tourPrice: data.tourPrice,
                    tourDuration: data.tourDuration,
                    tourDescription: data.tourDescription,
                    maxSeats: data.maxSeats,
                    startLocation: data.startLocation || '',
                    tourType: data.tourCategory || 'Adventure',
                    tourStatus: data.tourStatus || 'UPCOMING', // 🆕 POPULATE STATUS
                    isFixedDate: data.isFixedDate,
                    expectedMonth: data.expectedMonth || 'January',
                    // Format Dates for Input (YYYY-MM-DD)
                    fixedDate: data.fixedDate ? new Date(data.fixedDate).toISOString().split('T')[0] : '',
                    bookingDeadline: data.bookingDeadline ? new Date(data.bookingDeadline).toISOString().split('T')[0] : '',
                    coveredPlaces: data.coveredPlaces.join(', '),
                    includedItems: data.includedItems.join(', '),
                });

                setExistingImages(data.images);
                setIsLoading(false);
            } catch (error) {
                toast.error("Failed to load tour details");
                navigate('/tours');
            }
        };

        if (id) fetchTour();
    }, [id, axiosPrivate, navigate]);

    // HANDLERS
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isFixedDate: !prev.isFixedDate }));
    };

    // IMAGE HANDLERS
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + newFiles.length + existingImages.length > 8) {
                toast.error("Maximum 8 images allowed");
                return;
            }
            setNewFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeExistingImage = (urlToRemove: string) => {
        setExistingImages(prev => prev.filter(url => url !== urlToRemove));
    };

    const removeNewImage = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // SUBMIT LOGIC
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Step A: Upload New Images (if any)
            let uploadedUrls: string[] = [];
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(file => {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    return axiosPrivate.post('/upload', uploadData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                });

                const responses = await Promise.all(uploadPromises);
                responses.forEach(res => {
                    const data = res.data;
                    if (data.data?.urls?.[0]) uploadedUrls.push(data.data.urls[0]);
                    else if (data.data?.url) uploadedUrls.push(data.data.url);
                });
            }

            // Step B: Combine Old + New Images
            const finalImages = [...existingImages, ...uploadedUrls];

            if (finalImages.length === 0) {
                toast.error("Tour must have at least one image");
                setIsSaving(false);
                return;
            }

            // Step C: Prepare Payload
            const payload = {
                tourTitle: formData.tourTitle,
                tourPrice: Number(formData.tourPrice),
                tourDuration: formData.tourDuration,
                tourDescription: formData.tourDescription,
                maxSeats: Number(formData.maxSeats),
                startLocation: formData.startLocation,
                tourCategory: formData.tourType,
                tourStatus: formData.tourStatus, // 🆕 INCLUDED IN PAYLOAD

                // Arrays
                coveredPlaces: formData.coveredPlaces.split(',').map(s => s.trim()),
                includedItems: formData.includedItems.split(',').map(s => s.trim()),
                images: finalImages,

                // 🚀 Date Logic Updated
                isFixedDate: formData.isFixedDate,
                fixedDate: formData.isFixedDate && formData.fixedDate ? new Date(formData.fixedDate) : null,
                expectedMonth: !formData.isFixedDate ? formData.expectedMonth : null,
                bookingDeadline: formData.bookingDeadline ? new Date(formData.bookingDeadline) : null, // Always included
            };

            // Step D: Send Patch Request
            await axiosPrivate.patch(`/tours/${id}`, payload);

            toast.success("Tour Updated Successfully! 🎉");
            navigate('/tours');

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update tour");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center p-10 text-dd-orange animate-pulse">Loading Tour Data...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/tours')}
                    className="p-2 bg-dd-card rounded-lg border border-gray-700 hover:border-dd-orange text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-white">Edit Tour</h2>
                    <p className="text-dd-text-muted">Update details for {formData.tourTitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. BASIC DETAILS */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Basic Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Tour Title</label>
                            <input required name="tourTitle" value={formData.tourTitle} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Price (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required type="number" name="tourPrice" value={formData.tourPrice} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Duration</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="tourDuration" value={formData.tourDuration} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Total Seats</label>
                            <input required type="number" name="maxSeats" value={formData.maxSeats} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Start Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="startLocation" value={formData.startLocation} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Category</label>
                            <div className="relative">
                                <Compass className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <select name="tourType" value={formData.tourType} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none appearance-none">
                                    <option value="Adventure">Adventure</option>
                                    <option value="Relaxation">Relaxation</option>
                                    <option value="Pilgrimage">Pilgrimage</option>
                                    <option value="Honeymoon">Honeymoon</option>
                                    <option value="Road Trip">Road Trip</option>
                                    <option value="Family">Family</option>
                                </select>
                            </div>
                        </div>
                        {/* 🆕 ADDED TOUR STATUS */}
                        <div className="md:col-span-2">
                            <label className="block text-sm text-dd-text-muted mb-1">Tour Status</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <select name="tourStatus" value={formData.tourStatus} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none appearance-none">
                                    <option value="UPCOMING">UPCOMING</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-dd-text-muted mb-1">Description</label>
                        <textarea required name="tourDescription" value={formData.tourDescription} onChange={handleChange} rows={4} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                    </div>
                </div>

                {/* 2. DATES UPDATED */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <h3 className="text-lg font-semibold text-white">Schedule</h3>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${!formData.isFixedDate ? 'text-dd-orange font-bold' : 'text-gray-500'}`}>Flexible</span>
                            <button type="button" onClick={handleToggle} className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isFixedDate ? 'bg-dd-red' : 'bg-gray-700'}`}>
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.isFixedDate ? 'translate-x-6' : ''}`}></div>
                            </button>
                            <span className={`text-sm ${formData.isFixedDate ? 'text-dd-red font-bold' : 'text-gray-500'}`}>Fixed Date</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT SIDE: Fixed Date OR Expected Month */}
                        {formData.isFixedDate ? (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm text-dd-text-muted mb-1">Start Date</label>
                                <input required type="date" name="fixedDate" value={formData.fixedDate} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-red outline-none" />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm text-dd-text-muted mb-1">Expected Month</label>
                                <select name="expectedMonth" value={formData.expectedMonth} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* RIGHT SIDE: Booking Deadline (Always Visible) */}
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Booking Deadline</label>
                            <input required type="date" name="bookingDeadline" value={formData.bookingDeadline} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                    </div>
                </div>

                {/* 3. ITINERARY */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Itinerary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Covered Places (Comma separated)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="coveredPlaces" value={formData.coveredPlaces} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Included Items (Comma separated)</label>
                            <input required name="includedItems" value={formData.includedItems} onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                    </div>
                </div>

                {/* 4. IMAGES */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Gallery</h3>

                    {/* Upload Box */}
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-dd-orange hover:text-dd-orange cursor-pointer transition-all">
                        <UploadCloud size={32} />
                        <p className="mt-2 text-sm">Add more images</p>
                        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                    </div>

                    {/* Image Grid (Mixed Existing & New) */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                        {/* A. Existing Images from DB */}
                        {existingImages.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700">
                                <img src={url} alt="existing" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                <span className="absolute bottom-1 right-1 bg-black/60 text-[10px] text-white px-1 rounded">Saved</span>
                            </div>
                        ))}
                        {/* B. New Upload Previews */}
                        {previewUrls.map((url, idx) => (
                            <div key={`new-${idx}`} className="relative group aspect-square rounded-lg overflow-hidden border border-dd-orange">
                                <img src={url} alt="new" className="w-full h-full object-cover opacity-80" />
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                <span className="absolute bottom-1 right-1 bg-dd-orange text-[10px] text-white px-1 rounded">New</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all disabled:opacity-50">
                        {isSaving ? <><Loader2 className="animate-spin" /> Saving...</> : <><Save size={20}/> Update Tour</>}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default EditTour;