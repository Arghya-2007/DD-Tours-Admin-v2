import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.accessToken
            ? <Outlet /> // ✅ Token exists? Let them in.
            : <Navigate to="/login" state={{ from: location }} replace /> // 🚫 No Token? Go to Login.
    );
}

export default RequireAuth;