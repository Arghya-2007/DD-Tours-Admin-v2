import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react'; // 👈 1. Import lazy & Suspense
import { Toaster } from 'react-hot-toast';

// Context & Layouts (Keep these standard for faster initial load)
import { AuthProvider } from './context/AuthProvider';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/RequireAuth';
import Loader from './components/Loader'; // 👈 Import the Loader we just made

// 👈 3. Lazy Load All Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Tours
const Tours = lazy(() => import('./pages/tour/Tours'));
const CreateTour = lazy(() => import('./pages/tour/CreateTour'));
const EditTour = lazy(() => import('./pages/tour/EditTour'));

// Bookings
const Bookings = lazy(() => import('./pages/booking/Bookings'));
const BookingDetails = lazy(() => import('./pages/booking/BookingDetails'));

// Blogs
const Blogs = lazy(() => import('./pages/blog/Blogs'));
const CreateBlog = lazy(() => import('./pages/blog/CreateBlog'));
const EditBlog = lazy(() => import('./pages/blog/EditBlog'));

// Others
const Reviews = lazy(() => import('./pages/Reviews'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster
                    position="top-right"
                    toastOptions={{ style: { background: '#333', color: '#fff' } }}
                />

                {/* 👈 4. Wrap Routes in Suspense with the Loader */}
                <Suspense fallback={<Loader />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* 🔐 PROTECTED ROUTES */}
                        <Route element={<RequireAuth />}>
                            <Route path="/" element={<AdminLayout />}>
                                <Route index element={<Dashboard />} />

                                {/* Tours */}
                                <Route path="tours" element={<Tours />} />
                                <Route path="tours/create" element={<CreateTour />} />
                                <Route path="tours/edit/:id" element={<EditTour />} />

                                {/* Bookings */}
                                <Route path="bookings" element={<Bookings />} />
                                <Route path="bookings/:id" element={<BookingDetails />} />

                                {/* Reviews & Settings */}
                                <Route path="reviews" element={<Reviews />} />
                                <Route path="settings" element={<Settings />} />

                                {/* Blogs */}
                                <Route path="blogs" element={<Blogs />} />
                                <Route path="blogs/create" element={<CreateBlog />} />
                                <Route path="blogs/edit/:id" element={<EditBlog />} />
                            </Route>
                        </Route>

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;