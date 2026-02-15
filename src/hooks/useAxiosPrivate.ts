import { useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import useAuth from "./useAuth"; // We will create this simple hook next

const useAxiosPrivate = () => {
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                if (!config.headers['Authorization']) {
                    // 🚨 ATTACH TOKEN HERE
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Cleanup: Eject the interceptor when component unmounts
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
        }
    }, [auth]);

    return axiosPrivate;
}

export default useAxiosPrivate;