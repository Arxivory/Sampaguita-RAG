import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

export const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
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
});

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);