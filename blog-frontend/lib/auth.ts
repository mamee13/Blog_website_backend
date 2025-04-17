import { API_URL } from "@/lib/utils"
import { authEvents } from './authEvents'

export const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Dispatch login event
    authEvents.login();

    return data;
};