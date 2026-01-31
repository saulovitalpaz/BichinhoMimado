/// <reference types="vite/client" />
const getBaseUrl = () => {
    // 1. Manually configured API URL (e.g. for Production)
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 2. Production (served by same origin)
    if (import.meta.env.PROD) return '';

    // 3. Local Network Development
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3001`;
    }

    // 4. Default Localhost
    return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();
