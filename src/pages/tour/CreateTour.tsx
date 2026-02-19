import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    DollarSign,
    Clock,
    UploadCloud,
    X,
    CheckCircle2,
    Loader2,
    Compass
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';

const CreateTour = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. FORM STATE
    const [formData, setFormData] = useState({
        tourTitle: '',
        tourPrice: '',
        tourDuration: '',
        tourDescription: '',
        maxSeats: '',

        startLocation: '',
        tourType: 'Adventure',

        // Date Logic
        isFixedDate: false,
        expectedMonth: 'January',
        fixedDate: '',
        bookingDeadline: '',

        coveredPlaces: '',
        includedItems: '',
    });

    // 2. IMAGE STATE
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isFixedDate: !prev.isFixedDate }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + selectedFiles.length > 8) {
                toast.error("Maximum 8 images allowed");
                return;
            }

            setSelectedFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.tourDescription.length < 20) {
            toast.error("Description must be at least 20 characters long!");
            return;
        }
        if (selectedFiles.length === 0) {
            toast.error("Please select at least one image!");
            return;
        }

        setIsUploading(true);

        try {
            // STEP A: UPLOAD IMAGES
            const imageUrls: string[] = [];

            if (selectedFiles.length > 0) {
                const uploadPromises = selectedFiles.map(file => {
                    const uploadData = new FormData();
                    uploadData.append('images', file);
                    return axiosPrivate.post('/upload', uploadData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                });

                const uploadResponses = await Promise.all(uploadPromises);

                uploadResponses.forEach(res => {
                    const responseData = res.data;
                    if (responseData.data && Array.isArray(responseData.data.urls) && responseData.data.urls.length > 0) {
                        imageUrls.push(responseData.data.urls[0]);
                    }
                    else if (responseData.data && responseData.data.url) {
                        imageUrls.push(responseData.data.url);
                    }
                });
            }

            if (imageUrls.length === 0) throw new Error("Image upload failed.");

            // STEP B: PREPARE FINAL DATA
            const finalData = {
                tourTitle: formData.tourTitle,
                tourPrice: Number(formData.tourPrice),
                tourDuration: formData.tourDuration,
                tourDescription: formData.tourDescription,
                maxSeats: Number(formData.maxSeats),
                availableSeats: Number(formData.maxSeats),
                startLocation: formData.startLocation,
                tourCategory: formData.tourType,
                tourStatus: 'UPCOMING',
                coveredPlaces: formData.coveredPlaces.split(',').map(s => s.trim()),
                includedItems: formData.includedItems.split(',').map(s => s.trim()),
                images: imageUrls,

                // 🚀 Date Logic Updated: bookingDeadline is no longer dependent on isFixedDate
                isFixedDate: formData.isFixedDate,
                fixedDate: formData.isFixedDate && formData.fixedDate ? new Date(formData.fixedDate) : undefined,
                expectedMonth: !formData.isFixedDate ? formData.expectedMonth : undefined,
                bookingDeadline: formData.bookingDeadline ? new Date(formData.bookingDeadline) : undefined,
            };

            console.log("🚀 Sending Final Payload:", finalData);

            // STEP C: CREATE TOUR
            await axiosPrivate.post('/tours', finalData);

            toast.success("Tour Created Successfully! 🚀");
            navigate('/tours');

        } catch (error: any) {
            console.error("Creation Error:", error);
            const serverMessage = error.response?.data?.issues?.[0]?.message || error.response?.data?.message || "Failed to create tour";
            toast.error(serverMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Create New Tour</h2>
                    <p className="text-dd-text-muted">Design a new adventure for your customers.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* SECTION 1: BASIC INFO */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Basic Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Tour Title</label>
                            <input required name="tourTitle" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="e.g. Majestic Manali" />
                        </div>

                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Price (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required type="number" name="tourPrice" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="12000" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Duration</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="tourDuration" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="5 Days / 4 Nights" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Total Seats</label>
                            <input required type="number" name="maxSeats" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="30" />
                        </div>

                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Start Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="startLocation" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="e.g. Kolkata / Delhi" />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm text-dd-text-muted mb-1">Tour Category</label>
                            <div className="relative">
                                <Compass className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <select
                                    name="tourType"
                                    onChange={handleChange}
                                    className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none appearance-none"
                                >
                                    <option value="Adventure">Adventure</option>
                                    <option value="Relaxation">Relaxation</option>
                                    <option value="Pilgrimage">Pilgrimage</option>
                                    <option value="Honeymoon">Honeymoon</option>
                                    <option value="Road Trip">Road Trip</option>
                                    <option value="Family">Family</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-dd-text-muted mb-1">Description</label>
                        <textarea required name="tourDescription" onChange={handleChange} rows={4} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" placeholder="Describe the trip..." />
                    </div>
                </div>

                {/* 🚀 SECTION 2: DATE LOGIC UPDATED */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <h3 className="text-lg font-semibold text-white">Schedule & Timing</h3>

                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${!formData.isFixedDate ? 'text-dd-orange font-bold' : 'text-gray-500'}`}>Flexible Month</span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isFixedDate ? 'bg-dd-red' : 'bg-gray-700'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.isFixedDate ? 'translate-x-6' : ''}`}></div>
                            </button>
                            <span className={`text-sm ${formData.isFixedDate ? 'text-dd-red font-bold' : 'text-gray-500'}`}>Fixed Date</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LEFT SIDE: Fixed Date OR Expected Month */}
                        {formData.isFixedDate ? (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm text-dd-text-muted mb-1">Start Date</label>
                                <input required type="date" name="fixedDate" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-red outline-none" />
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm text-dd-text-muted mb-1">Expected Month</label>
                                <select name="expectedMonth" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none">
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* RIGHT SIDE: Booking Deadline (Always Visible) */}
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Booking Deadline</label>
                            <input required type="date" name="bookingDeadline" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 text-white focus:border-dd-orange outline-none" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ARRAYS */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Itinerary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Covered Places (Comma separated)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="coveredPlaces" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="Manali, Solang Valley, Rohtang" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-dd-text-muted mb-1">Included Items (Comma separated)</label>
                            <div className="relative">
                                <CheckCircle2 className="absolute left-3 top-3 text-gray-500" size={16}/>
                                <input required name="includedItems" onChange={handleChange} className="w-full bg-dd-sidebar border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-dd-orange outline-none" placeholder="Breakfast, Hotel, Bus, Guide" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 4: IMAGES */}
                <div className="bg-dd-card p-6 rounded-xl border border-gray-800 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <h3 className="text-lg font-semibold text-white">Gallery</h3>
                        <span className="text-xs text-dd-text-muted">{selectedFiles.length} / 8 Selected</span>
                    </div>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-dd-orange hover:text-dd-orange cursor-pointer transition-all"
                    >
                        <UploadCloud size={40} />
                        <p className="mt-2 text-sm font-medium">Click to upload Tour Images (Max 8)</p>
                        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                    </div>
                    {previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-4">
                            {previewUrls.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700">
                                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isUploading}
                        className="bg-gradient-to-r from-dd-orange to-dd-red text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-dd-orange/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? <><Loader2 className="animate-spin" /> Uploading...</> : "🚀 Launch Tour"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateTour;