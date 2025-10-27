import { UserProfile } from '@/packages/supabase/types';
import { create } from 'zustand';


type Store = {
    user: UserProfile | null,
    accessToken: string | null,
    updateUser: (updatedUser: Partial<UserProfile> | null) => void,
    updateAccessToken: (token: string | null) => void
}

const useUserStore = create<Store>()(
    (set) => ({
        user: null,
        accessToken: null,
        updateUser: (updated: Partial<UserProfile> | null) => set((state) => {
            return { ...state, user: updated }
        }),
        updateAccessToken: (token: string | null) => set((state) => {
            return { ...state, accessToken: token }
        })
    }))


export default useUserStore;