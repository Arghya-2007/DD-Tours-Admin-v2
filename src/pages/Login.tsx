import { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from '../api/axios'; // Import our configured axios
import AuthContext from '../context/AuthProvider';
import toast from 'react-hot-toast';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const { setAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    const formRef = useRef(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // GSAP Entrance Animation
    useEffect(() => {
        gsap.fromTo(formRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 🚀 HIT THE LIVE ENDPOINT
            const response = await axios.post('/auth/login', {
                userEmail: email,
                password: password
            });

            const { accessToken, user } = response.data;

            // 1. Save to Context (Memory)
            setAuth({ user, accessToken });

            // 2. Success Feedback
            toast.success(`Welcome back, ${user.name}!`);

            // 3. Redirect to Dashboard
            navigate('/', { replace: true });

        } catch (err: any) {
            console.error(err);
            if (!err?.response) {
                toast.error('No Server Response');
            } else if (err.response?.status === 400) {
                toast.error('Missing Username or Password');
            } else if (err.response?.status === 401) {
                toast.error('Unauthorized: Wrong Credentials');
            } else {
                toast.error('Login Failed');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-dd-bg flex items-center justify-center p-4">

            {/* Login Card */}
            <div
                ref={formRef}
                className="w-full max-w-md bg-dd-sidebar border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-dd-orange to-dd-red"></div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-dd-text-muted text-sm">Enter your credentials to access the control panel.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-dd-text-muted">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-dd-orange transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-dd-card border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-dd-orange focus:ring-1 focus:ring-dd-orange transition-all"
                                placeholder="admin@ddtours.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-dd-text-muted">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-dd-orange transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-dd-card border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-dd-orange focus:ring-1 focus:ring-dd-orange transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-dd-orange to-dd-red text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-dd-orange/20 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Verifying...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-dd-text-muted">
                    <p>Protected by DD Security Protocols v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default Login;