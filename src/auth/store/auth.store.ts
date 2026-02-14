import type { User } from '@/interface/user.interface'
import { create } from 'zustand'
import axios from 'axios'
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { registerAction } from '../actions/register.action';
import { useCartStore } from '@/shop/store/cart.store';

const CART_STORAGE_KEY = 'butcher-cart';
const CART_USER_KEY = 'butcher-cart-user';
const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const syncCartOwner = (userId?: string | null) => {
    if (!userId) return;
    const currentOwner = localStorage.getItem(CART_USER_KEY);
    if (currentOwner && currentOwner !== userId) {
        useCartStore.getState().clear();
        localStorage.removeItem(CART_STORAGE_KEY);
    }
    localStorage.setItem(CART_USER_KEY, userId);
};

const clearCartStorage = () => {
    useCartStore.getState().clear();
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_USER_KEY);
};


type authStatus = 'authenticated' | 'not-authenticated' | 'checking';
type AuthError = 'timeout' | 'invalid' | 'network' | 'unknown' | null;



type AuthState = {
    // Properties
    user: User | null,
    token: string | null,
    authStatus: authStatus;
    lastError: AuthError;
    //Getters

    isAdmin: () => boolean;
    
    //Actions
    login: (employeeNumber: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (
        fullName: string,
        employeeNumber: string,
        nationalId: string,
        password: string
    ) => Promise<boolean>;
    checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    token: storedToken,
    authStatus: storedToken ? 'checking' : 'not-authenticated',
    lastError: null,


    //Getters
    isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('admin');
    },

    //Actions
    login: async(employeeNumber: string, password: string) => {
        try {
            set({ lastError: null });
            const data = await loginAction(employeeNumber, password);
            localStorage.setItem('token', data.token);

            syncCartOwner(data.user.id);
            set({user: data.user, token: data.token, authStatus: 'authenticated'});
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
                    set({ lastError: 'timeout' });
                } else if (status === 401) {
                    set({ lastError: 'invalid' });
                } else if (!error.response) {
                    set({ lastError: 'network' });
                } else {
                    set({ lastError: 'unknown' });
                }
            } else {
                set({ lastError: 'unknown' });
            }
            localStorage.removeItem('token');
            set({user: null, token: null, authStatus: 'not-authenticated'});
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        clearCartStorage();
        set({user: null, token: null, authStatus: 'not-authenticated'});
    },

    checkAuthStatus: async() => {

        try {
            set({ lastError: null });
            const { user, token } = await checkAuthAction();
            syncCartOwner(user?.id);
            set({ user, token, authStatus: 'authenticated' });
            return true;
        } catch (error) {
            set({user: undefined, token: undefined, authStatus: 'not-authenticated'});
            return false;
        }
    },
    register: async(fullName: string, employeeNumber: string, nationalId: string, password: string) => {
        try {
            set({ lastError: null });
            const data = await registerAction(fullName, employeeNumber, nationalId, password);
            localStorage.setItem('token', data.token);

            syncCartOwner(data.user.id);
            set({user: data.user, token: data.token, authStatus: 'authenticated'});
            return true;
        } catch (error) {
            set({ lastError: 'unknown' });
            localStorage.removeItem('token');
            set({user: null, token: null, authStatus: 'not-authenticated'});
            return false;
        }
    },
}));
