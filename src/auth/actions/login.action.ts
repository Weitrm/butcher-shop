import { butcherApi } from "@/api/butcherApi"
import { runRequestWithRetry } from "@/api/httpRetry";
import type { AuthResponse } from "../interfaces/auth.response";

const AUTH_LOGIN_TIMEOUTS_MS = [12000, 25000];

export const loginAction = async(employeeNumber: string, password: string):Promise<AuthResponse> => {
    return runRequestWithRetry<AuthResponse>(
        async (timeoutMs) => {
            const response = await butcherApi.post<AuthResponse>(
                '/auth/login',
                { employeeNumber, password },
                { timeout: timeoutMs },
            );
            return response.data;
        },
        { timeoutsMs: AUTH_LOGIN_TIMEOUTS_MS, retryDelayMs: 1200 },
    );

}
