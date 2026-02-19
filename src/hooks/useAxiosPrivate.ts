// src/hooks/useAxiosPrivate.ts
import { useEffect, useContext } from "react";
import { axiosPrivate } from "../api/axios";
import AuthContext from "../context/AuthProvider";
import { useRefreshToken } from "./useRefreshToken";

const useAxiosPrivate = () => {
    const { auth } = useContext(AuthContext);
    const refresh = useRefreshToken();

    useEffect(() => {
        // 1. REQUEST INTERCEPTOR: Attach the token before the request leaves
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 2. RESPONSE INTERCEPTOR: Catch 403s and trigger the silent refresh
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response, // If it succeeds, just pass it through!
            async (error) => {
                const prevRequest = error?.config;

                // If it's a 403 (Forbidden) AND we haven't already retried this request
                if ((error?.response?.status === 403 || error?.response?.status === 401) && !prevRequest?.sent) {
                    prevRequest.sent = true; // Mark as sent to prevent an infinite loop

                    try {
                        // Wait for the new token
                        const newAccessToken = await refresh();

                        // Swap out the old expired token for the new one
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        // Resend the original request!
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // 3. CLEANUP: Remove interceptors when the component unmounts
        // This prevents memory leaks and overlapping interceptors if the user navigates around
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh]);

    return axiosPrivate;
}

export default useAxiosPrivate;