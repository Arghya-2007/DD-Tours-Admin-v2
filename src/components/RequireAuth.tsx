// src/components/RequireAuth.tsx
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RequireAuth = () => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    // 1. If not logged in, kick them to the login page.
    // We save the location they tried to visit in 'state' so we can send them there after they log in!
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. 🚨 CRITICAL: If they are logged in, but NOT an admin, kick them out.
    // This prevents standard users from accessing the admin panel if they somehow get the URL.
    if (user?.role !== "ADMIN") {
        return <Navigate to="/login" replace />;
        // Or you could route them to a specific <Navigate to="/unauthorized" /> page
    }

    // 3. If they pass both checks, let them render the child routes!
    return <Outlet />;
};

export default RequireAuth;