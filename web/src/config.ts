const getBaseUrl = () => {
    // If we're on a local network (e.g. 192.168.x.x), use that IP for the backend too
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:3001`;
    }
    return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();
