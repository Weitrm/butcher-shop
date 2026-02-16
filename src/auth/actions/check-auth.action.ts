import { butcherApi } from "@/api/butcherApi";
import { isRetryableNetworkError, runRequestWithRetry } from "@/api/httpRetry";
import axios from "axios";
import type { AuthResponse } from "../interfaces/auth.response";

const AUTH_CHECK_TIMEOUTS_MS = [10000, 20000];

export const checkAuthAction = async():Promise<AuthResponse> => {


    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    try {
        const data = await runRequestWithRetry<AuthResponse>(
            async (timeoutMs) => {
                const response = await butcherApi.get<AuthResponse>(
                    '/auth/check-status',
                    { timeout: timeoutMs },
                );
                return response.data;
            },
            { timeoutsMs: AUTH_CHECK_TIMEOUTS_MS, retryDelayMs: 900 },
        );

        localStorage.setItem('token', data.token);

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                localStorage.removeItem('token');
                throw new Error('Invalid token');
            }
            if (isRetryableNetworkError(error)) throw error;
        }
        localStorage.removeItem('token');
        throw error instanceof Error ? error : new Error('Auth check failed');
    }
}
