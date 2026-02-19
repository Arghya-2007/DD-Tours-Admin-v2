import { useEffect, useRef, useState, useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Map,
    CalendarDays,
    Star,
    Image,
    Settings,
    LogOut,
    Loader2
} from 'lucide-react';
import gsap from 'gsap';
import axios from '../api/axios';
import AuthContext from '../context/AuthProvider';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    // 🚨 Pull in your Zustand store & React Router navigation
    const { auth, logout } = useContext(AuthContext);
    const user = auth?.user;
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const sidebarRef = useRef(null);
    const contentRef = useRef(null);

    // GSAP Animation
    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(sidebarRef.current,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        )
            .fromTo(contentRef.current,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
                "-=0.3"
            );
    }, []);

    // 🚨 The strict Logout Flow
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // 1. Tell the backend to destroy the cookie and blacklist the token
            await axios.post('/auth/logout');
        } catch (error) {
            console.error("Backend logout failed, but proceeding with frontend logout.", error);
        } finally {
            // 2. Clear Zustand memory (happens no matter what)
            logout();

            // 3. User feedback
            toast.success("System locked. See you next time!");

            // 4. Kick back to login
            navigate('/login', { replace: true });
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Tours', path: '/tours', icon: Map },
        { name: 'Bookings', path: '/bookings', icon: CalendarDays },
        { name: 'Reviews', path: '/reviews', icon: Star },
        { name: 'Blogs', path: '/blogs', icon: Image },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-dd-bg text-dd-text-main font-sans">

            {/* SIDEBAR */}
            <aside
                ref={sidebarRef}
                className="w-64 bg-dd-sidebar border-r border-gray-800 flex flex-col justify-between shadow-2xl z-10"
            >
                <div>
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-800">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-dd-orange to-dd-red bg-clip-text text-transparent">
                            DD Admin
                        </h1>
                        <p className="text-xs text-dd-text-muted mt-1 uppercase tracking-wider">
                            Control Panel v2.0
                        </p>
                    </div>

                    {/* Nav */}
                    <nav className="mt-6 px-4 space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }: { isActive: boolean }) => `
                                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-dd-orange/20 to-dd-red/10 text-dd-orange border-l-4 border-dd-orange'
                                        : 'text-dd-text-muted hover:bg-gray-800 hover:text-white hover:translate-x-1'}
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer Status */}
                <div className="p-6 border-t border-gray-800">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-lg border border-gray-700">
                        <div className="relative">
                            <div className="w-3 h-3 bg-dd-success rounded-full animate-pulse"></div>
                            <div className="absolute top-0 left-0 w-3 h-3 bg-dd-success rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-xs font-mono text-dd-success tracking-wider">SYSTEM ONLINE</span>
                    </div>
                </div>
            </aside>

            {/* CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-dd-bg/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8">
                    <div className="text-sm text-dd-text-muted">
                        {/* 🚨 Use the actual logged-in user's name */}
                        Welcome back, <span className="text-white font-semibold">{user?.name || "Commander"}</span>
                    </div>

                    {/* 🚨 Attach the logout handler */}
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-2 text-sm text-dd-danger hover:bg-dd-danger/10 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                        {isLoggingOut ? "Locking..." : "Logout"}
                    </button>
                </header>

                <div ref={contentRef} className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default AdminLayout;