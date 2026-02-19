import { createContext, useState, useEffect, type ReactNode } from "react";
import axios from "../api/axios"; // Your configured axios instance
import Loader from "../components/Loader";

interface User {
    id: string;
    name: string;
    role: string;
}

interface AuthContextType {
    auth: { user: User | null; accessToken: string | null };
    setAuth: (auth: any) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // 1. Store auth strictly in memory (React State), completely immune to XSS
    const [auth, setAuth] = useState<{ user: User | null; accessToken: string | null }>({
        user: null,
        accessToken: null
    });

    // 2. Add a loading state to prevent the "flicker" on page reload
    const [isLoading, setIsLoading] = useState(true);

    // 3. Silent Authentication on Mount
    useEffect(() => {
        let isMounted = true;

        const verifySession = async () => {
            try {
                // This automatically sends the HttpOnly Session Cookie to the backend
                // If the tab wasn't closed, the cookie is still there, and we get a fresh access token!
                const { data } = await axios.post('/auth/refresh-token');

                if (isMounted) {
                    setAuth({ user: data.user, accessToken: data.accessToken });
                }
            } catch (error) {
                // No valid cookie found (or tab was previously closed). Stay logged out.
                console.log("No active admin session found.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        verifySession();

        // Cleanup from previous older versions
        localStorage.removeItem("dd_admin_auth");
        sessionStorage.removeItem("dd_admin_auth");

        return () => { isMounted = false; };
    }, []);

    // 4. Secure Logout Function
    const logout = async () => {
        try {
            // Tell the Node backend to blacklist the token in Redis and clear the cookie
            await axios.post('/auth/logout');
        } catch (error) {
            console.error("Backend logout failed, forcing frontend clear.");
        } finally {
            // Wipe memory and force a hard reload to clear all React states
            setAuth({ user: null, accessToken: null });
            window.location.href = '/login';
        }
    };

    // 5. The Magic Gate: Show loader until we verify the session cookie
    if (isLoading) {
        return <Loader />;
    }

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;