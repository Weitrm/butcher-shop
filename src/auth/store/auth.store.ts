import type { User } from '@/interface/user.interface'
import { create } from 'zustand'
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { registerAction } from '../actions/register.action';
import { useCartStore } from '@/shop/store/cart.store';

const CART_STORAGE_KEY = 'butcher-cart';
const CART_USER_KEY = 'butcher-cart-user';

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



type AuthState = {
    // Properties
    user: User | null,
    token: string | null,
    authStatus: authStatus;
    //Getters

    isAdmin: () => boolean;
    
    //Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (email: string, password: string, fullName: string) => Promise<boolean>;
    checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
    user: null,
    token: null,
    authStatus: 'checking',


    //Getters
    isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('admin');
    },

    //Actions
    login: async(email: string, password: string) => {
        try {
            const data = await loginAction(email, password);
            localStorage.setItem('token', data.token);

            syncCartOwner(data.user.id);
            set({user: data.user, token: data.token, authStatus: 'authenticated'});
            return true;
        } catch (error) {
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
            const { user, token } = await checkAuthAction();
            syncCartOwner(user?.id);
            set({ user, token, authStatus: 'authenticated' });
            return true;
        } catch (error) {
            set({user: undefined, token: undefined, authStatus: 'not-authenticated'});
            return false;
        }
    },
    register: async(email: string, password: string, fullName: string) => {
        try {
            const data = await registerAction(email, password, fullName);
            localStorage.setItem('token', data.token);

            syncCartOwner(data.user.id);
            set({user: data.user, token: data.token, authStatus: 'authenticated'});
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            set({user: null, token: null, authStatus: 'not-authenticated'});
            return false;
        }
    },
}));
