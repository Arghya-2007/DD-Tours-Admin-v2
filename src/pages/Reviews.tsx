import { useEffect, useState } from 'react';
import {
    Star, Trash2, User, Image as ImageIcon
} from 'lucide-react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import toast from 'react-hot-toast';

interface Review {
    reviewId: string;
    userId: string;
    tourName: string;
    reviewText: string;
    rating: number;
    photoUrl?: string;
    createdAt: string;
    user: {
        userName: string;
    };
}

const Reviews = () => {
    const axiosPrivate = useAxiosPrivate();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Reviews
    const fetchReviews = async () => {
        try {
            const response = await axiosPrivate.get('/reviews');
            setReviews(response.data.data);
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // 2. Delete Review
    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this review?')) return;

        try {
            await axiosPrivate.delete(`/reviews/${id}`);
            toast.success('Review removed successfully');
            setReviews(prev => prev.filter(r => r.reviewId !== id));
        } catch (error: any) {
            toast.error('Failed to delete review');
        }
    };

    // Helper: Render Stars
    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <Star
                key={i}
                size={14}
                className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
            />
        ));
    };

    if (loading) return <div className="text-dd-orange animate-pulse">Loading Reviews...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
                    <p className="text-dd-text-muted mt-1">Monitor feedback and user testimonials.</p>
                </div>
                <div className="bg-dd-card px-4 py-2 rounded-lg border border-gray-800 text-sm text-dd-text-muted">
                    Total Reviews: <span className="text-white font-bold">{reviews.length}</span>
                </div>
            </div>

            {/* REVIEWS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No reviews found.
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.reviewId} className="bg-dd-card border border-gray-800 rounded-xl p-5 flex flex-col h-full hover:border-gray-600 transition-colors">

                            {/* Header: User & Rating */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium text-sm">{review.user.userName}</h4>
                                        <div className="flex gap-0.5 mt-0.5">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Tour Name Badge */}
                            <div className="mb-3">
                                <span className="inline-block px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-800/50">
                                    {review.tourName}
                                </span>
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                                <p className="text-gray-300 text-sm leading-relaxed italic">
                                    "{review.reviewText}"
                                </p>

                                {/* Attached Photo */}
                                {review.photoUrl && (
                                    <div className="mt-3 relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-700 cursor-pointer">
                                        <img
                                            src={review.photoUrl}
                                            alt="Review attachment"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon size={16} className="text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-end">
                                <button
                                    onClick={() => handleDelete(review.reviewId)}
                                    className="flex items-center gap-2 text-gray-500 hover:text-dd-danger text-sm transition-colors"
                                >
                                    <Trash2 size={16} /> Remove
                                </button>
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;