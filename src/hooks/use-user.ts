"use client"

import { getSession } from "@/actions/auth/getSession";
import { UserProfile } from "@/packages/supabase/types";
import { useEffect, useState } from "react";

export function useUser() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
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
                setAccessToken(session.access_token);
                setUser(userData)
            }
        })
    }, []);

    return {
        accessToken,
        user
    }
}