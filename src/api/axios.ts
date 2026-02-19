import axios from 'axios';

// 🚀 LIVE BACKEND URL
const BASE_URL = "/api";

export default axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // Crucial! Allows the browser to send/receive the HttpOnly Cookie
});

// Optional: Private instance for requests that need the Access Token attached
export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});