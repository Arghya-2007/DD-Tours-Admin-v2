import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import {
    DollarSign,
    Users,
    CalendarCheck,
    Map,
    ArrowUpRight,
    Clock,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Define Types based on your JSON Response
interface BookingUser {
    userName: string;
    userEmail: string;
}

interface BookingTour {
    tourTitle: string;
}

interface RecentBooking {
    bookingId: string;
    totalGuests: number;
    totalPrice: number;
    bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    paymentStatus: string;
    bookingDate: string;
    user: BookingUser;
    tour: BookingTour;
}

interface DashboardStats {
    totalRevenue: number;
    totalBookings: number;
    totalUsers: number;
    activeTours: number;
    recentBookings: RecentBooking[];
}

const Dashboard = () => {
    const axiosPrivate = useAxiosPrivate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // 2. Fetch Data from Live Backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosPrivate.get('/admin/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Dashboard Error:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96 text-dd-orange animate-pulse">
                Loading Command Center...
            </div>
        );
    }

    if (!stats) return null;

    // 3. Stats Configuration
    const statCards = [
        {
            title: 'Total Revenue',
            value: `₹ ${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            title: 'Total Bookings',
            value: stats.totalBookings,
            icon: CalendarCheck,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Active Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            title: 'Active Tours',
            value: stats.activeTours,
            icon: Map,
            color: 'text-dd-orange',
            bg: 'bg-dd-orange/10'
        },
    ];

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div>
                <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                <p className="text-dd-text-muted mt-1">Here is what's happening with DD Tours today.</p>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-dd-card p-6 rounded-xl border border-gray-800 shadow-lg hover:border-gray-700 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-dd-text-muted text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* RECENT BOOKINGS TABLE */}
            <div className="bg-dd-card rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Recent Bookings</h3>
                    <button className="text-sm text-dd-orange hover:text-dd-red transition-colors flex items-center gap-1">
                        View All <ArrowUpRight size={16} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-dd-sidebar text-dd-text-muted text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-medium">Customer</th>
                            <th className="px-6 py-4 font-medium">Tour Package</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                        {stats.recentBookings.map((booking) => (
                            <tr key={booking.bookingId} className="hover:bg-gray-800/50 transition-colors">

                                {/* Customer */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                            {booking.user.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{booking.user.userName}</p>
                                            <p className="text-xs text-dd-text-muted">{booking.user.userEmail}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Tour */}
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {booking.tour.tourTitle}
                                </td>

                                {/* Amount */}
                                <td className="px-6 py-4 text-sm font-medium text-white">
                                    ₹ {booking.totalPrice.toLocaleString()}
                                </td>

                                {/* Status Badge */}
                                <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${booking.bookingStatus === 'CONFIRMED'
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : booking.bookingStatus === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'}
                    `}>
                      {booking.bookingStatus === 'CONFIRMED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {booking.bookingStatus}
                    </span>
                                </td>

                                {/* Date */}
                                <td className="px-6 py-4 text-sm text-dd-text-muted">
                                    {new Date(booking.bookingDate).toLocaleDateString()}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;