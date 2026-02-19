import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const RequireAuth = () => {
    const { auth } = useContext(AuthContext);
    const location = useLocation();

    // 1. If no access token, kick them to the login page.
    if (!auth?.accessToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. 🚨 CRITICAL: If they are logged in, but NOT an admin, kick them out.
    if (auth?.user?.role !== "ADMIN") {
        return <Navigate to="/login" replace />;
    }

    // 3. If they pass both checks, let them render the child routes!
    return <Outlet />;
};

export default RequireAuth;