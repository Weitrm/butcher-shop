import { butcherApi } from "@/api/butcherApi"
import type { AuthResponse } from "../interfaces/auth.response";


export const registerAction = async(email: string, password: string, fullName: string):Promise<AuthResponse> => {

    try {
        const {data} = await butcherApi.post<AuthResponse>('/auth/register', { email, password, fullName })

        
        return data;
    } catch (error) {  
        throw error;
        
    }

}