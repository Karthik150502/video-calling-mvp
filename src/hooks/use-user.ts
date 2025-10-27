"use client"

import { getSession } from "@/actions/auth/getSession";
import { UserProfile } from "@/packages/supabase/types";
import useUserStore from "@/zustand/stores/userSession";
import { useEffect } from "react";

export function useUser() {
    const { updateUser, updateAccessToken } = useUserStore();
    useEffect(() => {
        getSession().then(({ session }) => {
            console.log({ session })
            if (session) {  
                const userData: UserProfile = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata.full_name,
                    emailVerified: session.user.user_metadata.email_verified,
                    avatar_url: session.user.user_metadata.avatar_url
                }
                updateUser(userData)
                updateAccessToken(session.access_token)
            }
        })

        return () => {
            updateUser(null);
            updateAccessToken(null)
        }
    }, []);

    return null
}