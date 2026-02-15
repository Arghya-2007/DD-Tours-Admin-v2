import { useEffect, useState } from 'react';
import {
    Search, CheckCircle2, XCircle, Clock, CalendarDays, User,
    DollarSign, Trash2, Eye
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Define Types
interface Booking {
    bookingId: string;
    user: { userName: string; userEmail: string };
    tour: { tourTitle: string };
    bookingDate: string;
    totalGuests: number;
    totalPrice: number;
    bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
}

const Bookings = () => {
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axiosPrivate.get('/bookings');
            setBookings(response.data.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const updateBookingStatus = async (id: string, newStatus: string) => {
        if(!window.confirm(`Mark booking as ${newStatus}?`)) return;
        try {
            await axiosPrivate.patch(`/bookings/${id}`, { bookingStatus: newStatus });
            toast.success(`Updated to ${newStatus}`);
            fetchBookings();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const updatePaymentStatus = async (id: string) => {
        if(!window.confirm("Confirm payment receipt?")) return;
        try {
            await axiosPrivate.patch(`/bookings/${id}/payment-status`, { paymentStatus: 'COMPLETED' });
            toast.success("Payment confirmed 💰");
            fetchBookings();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const deleteBooking = async (id: string) => {
        if(!window.confirm("⚠️ Delete permanently?")) return;
        try {
            await axiosPrivate.delete(`/bookings/${id}`);
            toast.success("Deleted 🗑️");
            setBookings(prev => prev.filter(b => b.bookingId !== id));
        } catch (error: any) {
            toast.error('Delete failed');
        }
    };

    // 🔍 ENHANCED FILTERING: Includes Booking ID Search
    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = filterStatus === 'ALL' || booking.bookingStatus === filterStatus;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            booking.user.userName.toLowerCase().includes(searchLower) ||
            booking.tour.tourTitle.toLowerCase().includes(searchLower) ||
            booking.bookingId.toLowerCase().includes(searchLower); // 👈 Added ID Search

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Booking Management</h2>
                    <p className="text-dd-text-muted mt-1">Track reservations & payments.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-dd-card p-4 rounded-xl border border-gray-800">
                {/* Status Tabs */}
                <div className="flex gap-2 p-1 bg-dd-sidebar rounded-lg overflow-x-auto w-full md:w-auto">
                    {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                filterStatus === status
                                    ? 'bg-gradient-to-r from-dd-orange to-dd-red text-white shadow-lg'
                                    : 'text-dd-text-muted hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search ID, Name, Tour..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dd-sidebar border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:border-dd-orange outline-none"
                    />
                </div>
            </div>

            <div className="bg-dd-card border border-gray-800 rounded-xl overflow-hidden shadow-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-dd-sidebar text-dd-text-muted text-xs uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Tour Details</th>
                        <th className="px-6 py-4 font-medium">Amount</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-dd-orange animate-pulse">Loading Bookings...</td></tr>
                    ) : filteredBookings.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
                    ) : (
                        filteredBookings.map((booking) => (
                            <tr key={booking.bookingId} className="hover:bg-gray-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{booking.user.userName}</p>
                                            <p className="text-xs text-dd-text-muted">{booking.user.userEmail}</p>
                                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {booking.bookingId.slice(0,8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-white font-medium">{booking.tour.tourTitle}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-dd-text-muted">
                                        <CalendarDays size={12} />
                                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300 border border-gray-700">
                                            {booking.totalGuests} Guests
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-white">₹ {booking.totalPrice.toLocaleString()}</p>
                                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                                        booking.paymentStatus === 'COMPLETED' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'
                                    }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                      ${booking.bookingStatus === 'CONFIRMED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        booking.bookingStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                      {booking.bookingStatus === 'CONFIRMED' ? <CheckCircle2 size={12} /> :
                                          booking.bookingStatus === 'CANCELLED' ? <XCircle size={12} /> : <Clock size={12} />}
                                        {booking.bookingStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* VIEW DETAILS BUTTON */}
                                        <button
                                            onClick={() => navigate(`/bookings/${booking.bookingId}`)}
                                            className="p-2 bg-gray-700 text-blue-400 rounded hover:bg-gray-600 hover:text-white transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {booking.bookingStatus === 'PENDING' && (
                                            <>
                                                <button onClick={() => updateBookingStatus(booking.bookingId, 'CONFIRMED')} className="p-2 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20"><CheckCircle2 size={16} /></button>
                                                <button onClick={() => updateBookingStatus(booking.bookingId, 'CANCELLED')} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><XCircle size={16} /></button>
                                            </>
                                        )}
                                        {booking.paymentStatus === 'PENDING' && (
                                            <button onClick={() => updatePaymentStatus(booking.bookingId)} className="p-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"><DollarSign size={16} /></button>
                                        )}
                                        <button onClick={() => deleteBooking(booking.bookingId)} className="p-2 bg-gray-700 text-gray-400 rounded hover:bg-dd-danger hover:text-white transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Bookings;