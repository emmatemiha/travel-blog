import { create } from 'zustand';

interface AuthState {
    userId: number | null;
    authToken: string | null;
    setAuth: (token: string, id: number) => void;
    removeAuth: () => void;
}
const getLocalStorage = (key: string): string | null => window.localStorage.getItem(key);
const setLocalStorage = (key: string, value: string) => window.localStorage.setItem(key, value);

const useStore = create<AuthState>((set) => ({
    userId: getLocalStorage('userId') ? Number(getLocalStorage('userId')) : null,
    authToken: getLocalStorage('authToken') || null,
    setAuth: (token: string, id: number) => set(() => {
        setLocalStorage('authToken', token)
        setLocalStorage('userId', String(id))
        return {authToken: token, userId: id}
    }),
    removeAuth: () => set(() => {
        setLocalStorage('authToken', '')
        setLocalStorage('userId', '')
        return { authToken: null, userId: null }
    })
}))
export const useAuthStore = useStore;