import axios from 'axios'

//ham yaha pe base url set kar rahe hai taki hum easily api calls kar sake baar baar base url likhne ki zarurat na pade
const api = axios.create({
    baseURL: 'http://localhost:3000/api/auth',
    withCredentials: true // This is important to include if your server is setting cookies
});
export async function registerUser(username, email, password) {
    try {
        const response = await api.post('/register', {
            username,
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

export async function loginUser(email, password) {
    try {
        const response = await api.post('/login', {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}

export async function logoutUser() {
    try {
        const response = await api.get('/logout');
        return response.data;
    } catch (error) {
        console.error('Error logging out user:', error);
        throw error;
    }
}

export async function getMe() {
    try {
        const response = await api.get('/get-me');
        return response.data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}