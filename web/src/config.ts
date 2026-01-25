/// <reference types="vite/client" />
const getBaseUrl = () => {
    // Production (served by same origin)
    if (import.meta.env.PROD) return '';

    // Local Network Development
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3001`;
    }
    return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();
