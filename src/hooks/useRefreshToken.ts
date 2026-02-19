// src/hooks/useRefreshToken.ts
import { useContext } from 'react';
import axios from '../api/axios'; // 🚨 Use the PUBLIC axios here!
import AuthContext from '../context/AuthProvider';

export const useRefreshToken = () => {
    const { setAuth, logout } = useContext(AuthContext);

    const refresh = async () => {
        try {
            // Because withCredentials is true, the browser auto-sends the Session Cookie
            const response = await axios.post('/auth/refresh-token');

            // Update React Context with the fresh 15-minute token
            setAuth({
                user: response.data.user,
                accessToken: response.data.accessToken
            });

            return response.data.accessToken;
        } catch (error) {
            // If the refresh token is blacklisted or the session ended, kick them out
            console.error("Session expired. Logging out.");
            logout();
            throw error;
        }
    };

    return refresh;
};