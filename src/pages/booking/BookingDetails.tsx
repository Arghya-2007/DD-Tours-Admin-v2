import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, User, Mail, Phone, CreditCard, Users, Download, Loader2
} from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate.ts';
import toast from 'react-hot-toast';

interface Guest {
    name: string;
    age: number;
    gender: string;
}

interface BookingDetail {
    bookingId: string;
    bookingStatus: string;
    paymentStatus: string;
    totalPrice: number;
    totalGuests: number;
    bookingDate: string;
    paymentMethod: string;
    guestDetails: Guest[];
    user: {
        userName: string;
        userEmail: string;
        phoneNumber: string;
        userAddress?: string;
    };
    tour: {
        tourTitle: string;
        tourDuration: string;
        startLocation?: string; // 👈 Ensure this matches backend
        tourPrice: number;
    };
}

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axiosPrivate.get(`/bookings/${id}`);
                setBooking(response.data.data);
                if (booking?.tour.startLocation){
                    console.log(booking.tour.startLocation);
                }else {
                    console.log("no data")
                }
            } catch (error) {
                toast.error("Failed to load booking details");
                navigate('/bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, axiosPrivate, navigate]);

    // 🖨️ INVOICE GENERATOR FUNCTION
    const handleDownloadInvoice = async () => {
        if (!booking) return;
        setDownloading(true);

        try {
            // 1. Fetch Invoice Data from Backend
            const response = await axiosPrivate.get(`/bookings/${booking.bookingId}/invoice`);
            const inv = response.data.data;

            // 2. Generate HTML for the Invoice
            const invoiceHTML = `
                <html>
                <head>
                    <title>Invoice - ${inv.invoiceId}</title>
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: bold; color: #f97316; }
                        .invoice-details { text-align: right; }
                        .section-title { font-size: 14px; text-transform: uppercase; color: #888; margin-bottom: 10px; margin-top: 30px; letter-spacing: 1px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #eee; }
                        .total-section { margin-top: 30px; text-align: right; }
                        .total-row { font-size: 18px; font-weight: bold; color: #000; }
                        .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #def7ec; color: #03543f; }
                        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">DD Tours & Travels</div>
                        <div class="invoice-details">
                            <h1>INVOICE</h1>
                            <p>#${inv.invoiceId}</p>
                            <p>Date: ${new Date(inv.date).toLocaleDateString()}</p>
                            <span class="status">${inv.status}</span>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="section-title">Billed To</div>
                            <p><strong>${inv.customerName}</strong></p>
                            <p>${inv.customerEmail || ''}</p>
                            <p>${booking.user.userAddress || ''}</p>
                        </div>
                        <div style="text-align: right;">
                            <div class="section-title">Trip Details</div>
                            <p><strong>${inv.tourTitle}</strong></p>
                            <p>Guests: ${inv.guests}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Rate</th>
                                <th>Qty</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Tour Package: ${inv.tourTitle}</td>
                                <td>₹${booking.tour.tourPrice.toLocaleString()}</td>
                                <td>${inv.guests}</td>
                                <td style="text-align: right;">₹${inv.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total-section">
                        <p class="total-row">Total: ₹${inv.amount.toLocaleString()}</p>
                    </div>

                    <div class="footer">
                        <p>Thank you for traveling with DD Tours & Travels.</p>
                        <p>Contact: support@ddtours.com | +91-9876543210</p>
                    </div>

                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `;

            // 3. Open Print Window
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(invoiceHTML);
                printWindow.document.close();
            } else {
                toast.error("Pop-up blocked. Please allow pop-ups to print invoice.");
            }

        } catch (error) {
            console.error("Invoice Error:", error);
            toast.error("Failed to generate invoice");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-dd-orange animate-pulse">Loading Details...</div>;
    if (!booking) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/bookings')}
                    className="p-2 bg-dd-card rounded-lg border border-gray-700 hover:border-dd-orange transition-colors text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Booking #{booking.bookingId.slice(0,8).toUpperCase()}</h1>
                    <p className="text-dd-text-muted text-sm">Created on {new Date(booking.bookingDate).toLocaleString()}</p>
                </div>
                <div className="ml-auto flex gap-3">
                     <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                         booking.bookingStatus === 'CONFIRMED' ? 'bg-green-900/30 text-green-400 border-green-800' :
                             booking.bookingStatus === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800' :
                                 'bg-red-900/30 text-red-400 border-red-800'
                     }`}>
                        {booking.bookingStatus}
                     </span>

                    {/* 👇 UPDATED INVOICE BUTTON */}
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={downloading}
                        className="flex items-center gap-2 bg-dd-orange text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
                        {downloading ? "Generating..." : "Invoice"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Tour & Payment Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tour Snapshot */}
                    <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <MapPin className="text-dd-orange" size={20} /> Tour Details
                        </h3>
                        <div className="bg-dd-sidebar rounded-lg p-4 border border-gray-700">
                            <h4 className="text-xl font-bold text-white">{booking.tour.tourTitle}</h4>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-400">
                                <p>Duration: <span className="text-white">{booking.tour.tourDuration}</span></p>
                                {/* 👇 FIXED START LOCATION DISPLAY */}
                                <p>Start Location: <span className="text-white">{booking.tour.startLocation || "Not Specified"}</span></p>
                                <p>Base Price: <span className="text-white">₹{booking.tour.tourPrice}</span> / person</p>
                            </div>
                        </div>
                    </div>

                    {/* Guest List */}
                    <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="text-blue-400" size={20} /> Guest List ({booking.totalGuests})
                        </h3>
                        <div className="overflow-hidden rounded-lg border border-gray-700">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-dd-sidebar text-gray-400">
                                <tr>
                                    <th className="p-3">#</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Age</th>
                                    <th className="p-3">Gender</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-gray-300">
                                {booking.guestDetails && booking.guestDetails.map((guest, idx) => (
                                    <tr key={idx} className="hover:bg-gray-800/50">
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3 font-medium text-white">{guest.name}</td>
                                        <td className="p-3">{guest.age}</td>
                                        <td className="p-3 capitalize">{guest.gender}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Payment */}
                <div className="space-y-6">

                    {/* Customer Card */}
                    <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="text-purple-400" size={20} /> Customer Info
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                                    {booking.user.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{booking.user.userName}</p>
                                    <p className="text-xs text-gray-500">ID: {booking.bookingId.slice(0,6)}...</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-800 pt-3 space-y-2 text-sm text-gray-400">
                                <p className="flex items-center gap-2"><Mail size={14}/> {booking.user.userEmail}</p>
                                <p className="flex items-center gap-2"><Phone size={14}/> {booking.user.phoneNumber}</p>
                                <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5"/> {booking.user.userAddress || "No address provided"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-dd-card border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="text-green-400" size={20} /> Payment Info
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>Payment Method</span>
                                <span className="text-white font-medium">{booking.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-gray-400 text-sm">
                                <span>Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                    booking.paymentStatus === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>{booking.paymentStatus}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                <span className="text-gray-300">Total Amount</span>
                                <span className="text-2xl font-bold text-white">₹ {booking.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingDetails;