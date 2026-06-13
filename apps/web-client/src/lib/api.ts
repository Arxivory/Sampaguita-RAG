import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const storedAuth = localStorage.getItem('sampaguita_auth_session');
        if (storedAuth) {
            try {
                const session = JSON.parse(storedAuth);
                if (session?.access_token) {
                    config.headers.Authorization = `Bearer ${session.access_token}`;
                }
            } catch (e) {
                console.error("Malformed auth data in localStorage", e);
            }
        }
    }
    return config;
})