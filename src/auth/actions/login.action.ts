import { butcherApi } from "@/api/butcherApi"
import type { AuthResponse } from "../interfaces/auth.response";


export const loginAction = async(employeeNumber: string, password: string):Promise<AuthResponse> => {

    try {
        const {data} = await butcherApi.post<AuthResponse>('/auth/login', { employeeNumber, password })
        
        return data;
    } catch (error) {  
        console.log(error);
        throw error;
        
    }

}
