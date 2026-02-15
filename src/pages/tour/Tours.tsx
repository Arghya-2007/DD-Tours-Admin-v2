import { useEffect, useState } from 'react';
import {
    Plus, Trash2, Edit, MapPin, Calendar, DollarSign, Search,
    Users, Compass, Image as ImageIcon
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

// 1. Updated Interface to match Backend
interface Tour {
    tourId: string;
    tourTitle: string;
    tourPrice: number;
    tourDuration: string;
    tourStatus: string;
    tourCategory?: string; // 👈 New Field
    startLocation?: string; // 👈 New Field
    maxSeats: number;
    availableSeats: number;
    images: string[];      // 👈 For Thumbnail
    isFixedDate: boolean;
    fixedDate?: string;
    expectedMonth?: string;
}

const Tours = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate(); // For navigation
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // 2. Fetch Tours
    const fetchTours = async () => {
        try {
            setLoading(true);
            const response = await axiosPrivate.get('/tours');
            // Check if data is nested (e.g., response.data.data) or direct
            const tourData = response.data.data || [];
            setTours(tourData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tours');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTours();
    }, []);

    // 3. Delete Tour Handler
    const handleDelete = async (id: string) => {
        if (!window.confirm('⚠️ Are you sure? This will delete the tour permanently!')) return;

        try {
            await axiosPrivate.delete(`/tours/${id}`);
            toast.success('Tour deleted successfully 🗑️');
            setTours(prev => prev.filter(tour => tour.tourId !== id)); // Optimistic UI update
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to delete tour';
            toast.error(msg);
        }
    };

    // 4. Enhanced Filter Logic (Title + Location)
    const filteredTours = tours.filter(tour => {
        const searchLower = searchTerm.toLowerCase();
        return (
            tour.tourTitle.toLowerCase().includes(searchLower) ||
            (tour.startLocation && tour.startLocation.toLowerCase().includes(searchLower)) ||
            (tour.tourCategory && tour.tourCategory.toLowerCase().includes(searchLower))
        );
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-dd-orange animate-pulse">
            <Compass className="animate-spin mr-2" /> Loading Tours...
        </div>
    );

    return (
        <div className="space-y-6 pb-10">

            {/* HEADER & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Tour Packages</h2>
                    <p className="text-dd-text-muted mt-1">Manage your travel products and itineraries.</p>
                </div>

                <Link
                    to="/tours/create"
                    className="flex items-center gap-2 bg-gradient-to-r from-dd-orange to-dd-red text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-dd-orange/20 transition-all font-medium"
                >
                    <Plus size={20} /> Create New Tour
                </Link>
            </div>

            {/* SEARCH BAR */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by Title, Location, or Category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dd-card border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-dd-orange transition-all placeholder-gray-600"
                />
            </div>

            {/* EMPTY STATE */}
            {!loading && filteredTours.length === 0 && (
                <div className="text-center py-12 bg-dd-card border border-gray-800 rounded-xl">
                    <p className="text-gray-500">No tours found matching your search.</p>
                </div>
            )}

            {/* TOURS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTours.map((tour) => (
                    <div key={tour.tourId} className="bg-dd-card border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all group flex flex-col h-full">

                        {/* IMAGE THUMBNAIL */}
                        <div className="h-48 w-full bg-gray-800 relative">
                            {tour.images && tour.images.length > 0 ? (
                                <img
                                    src={tour.images[0]}
                                    alt={tour.tourTitle}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    <ImageIcon size={40} />
                                </div>
                            )}

                            {/* Category Badge */}
                            {tour.tourCategory && (
                                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/10">
                                    {tour.tourCategory}
                                </span>
                            )}
                        </div>

                        {/* CARD CONTENT */}
                        <div className="p-5 flex-1 space-y-4">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-dd-orange transition-colors line-clamp-2">
                                    {tour.tourTitle}
                                </h3>
                            </div>

                            <div className="space-y-2 text-sm text-dd-text-muted">
                                {/* Duration & Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-dd-orange" />
                                    <span>
                                        {tour.tourDuration} • {tour.isFixedDate && tour.fixedDate
                                        ? new Date(tour.fixedDate).toLocaleDateString()
                                        : tour.expectedMonth || 'Flexible'}
                                    </span>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-400" />
                                    <span className="truncate">
                                        {tour.startLocation || 'Location TBD'}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-green-400" />
                                    <span className="text-white font-bold text-lg">
                                        ₹{tour.tourPrice.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="bg-dd-sidebar px-5 py-3 border-t border-gray-800 flex justify-between items-center mt-auto">
                            <div className="text-xs flex items-center gap-1.5 text-gray-400">
                                <Users size={14} />
                                <span className={tour.availableSeats < 5 ? "text-red-400 font-bold" : "text-white"}>
                                    {tour.availableSeats}
                                </span>
                                <span className="text-gray-600">/ {tour.maxSeats} left</span>
                            </div>

                            <div className="flex gap-2">
                                {/* Edit Button */}
                                <button
                                    onClick={() => navigate(`/tours/edit/${tour.tourId}`)} // Assuming you will build Edit page next
                                    className="p-2 hover:bg-gray-700 rounded-md text-blue-400 transition-colors"
                                    title="Edit Tour"
                                >
                                    <Edit size={18} />
                                </button>

                                {/* Delete Button */}
                                <button
                                    onClick={() => handleDelete(tour.tourId)}
                                    className="p-2 hover:bg-gray-700 rounded-md text-dd-danger transition-colors"
                                    title="Delete Tour"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Tours;