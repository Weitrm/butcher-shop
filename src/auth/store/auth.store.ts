import type { User } from '@/interface/user.interface'
import { create } from 'zustand'
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { registerAction } from '../actions/register.action';


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
        set({user: null, token: null, authStatus: 'not-authenticated'});
    },

    checkAuthStatus: async() => {

        try {
            const { user, token } = await checkAuthAction();
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

            set({user: data.user, token: data.token, authStatus: 'authenticated'});
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            set({user: null, token: null, authStatus: 'not-authenticated'});
            return false;
        }
    },
}));
