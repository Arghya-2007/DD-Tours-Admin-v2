import { createContext, useState, useEffect, type ReactNode } from "react";

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

// Helper: Check if JWT is expired without external libraries
const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        // Decode the payload (2nd part of JWT)
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const payload = JSON.parse(decodedJson);

        // Check expiry (exp is in seconds, Date.now() is in ms)
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true; // Treat invalid tokens as expired
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    // 1. Initialize State (sessionStorage + Expiry Check)
    const [auth, setAuth] = useState<{ user: User | null; accessToken: string | null }>(() => {
        // Clear old localStorage if it exists (Cleanup from previous version)
        localStorage.removeItem("dd_admin_auth");

        const storedAuth = sessionStorage.getItem("dd_admin_auth");

        if (storedAuth) {
            const parsedAuth = JSON.parse(storedAuth);

            // 🛡️ SECURITY CHECK: Is the token expired?
            if (isTokenExpired(parsedAuth.accessToken)) {
                // Token expired? Clear storage and return null
                sessionStorage.removeItem("dd_admin_auth");
                return { user: null, accessToken: null };
            }

            // Token valid? Return it
            return parsedAuth;
        }

        return { user: null, accessToken: null };
    });

    // 2. Sync with SessionStorage (Only persists while tab is open)
    useEffect(() => {
        if (auth.accessToken) {
            sessionStorage.setItem("dd_admin_auth", JSON.stringify(auth));
        } else {
            sessionStorage.removeItem("dd_admin_auth");
        }
    }, [auth]);

    // 3. Logout Function
    const logout = () => {
        setAuth({ user: null, accessToken: null });
        sessionStorage.removeItem("dd_admin_auth");
        localStorage.removeItem("dd_admin_auth"); // Just to be safe

        // Optional: Force reload to clear any application state
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;