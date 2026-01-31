import { butcherApi } from "@/api/butcherApi";
import type { AuthResponse } from "../interfaces/auth.response";


export const checkAuthAction = async():Promise<AuthResponse> => {


    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    try {
        
        const {data} = await butcherApi.get<AuthResponse>('/auth/check-status'); 

        localStorage.setItem('token', data.token);

        return data;
    } catch (error) {
        localStorage.removeItem('token');
        throw new Error('Invalid token');
    }
}