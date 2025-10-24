import { LoginType } from "@/lib/schema/zod";
import { createClient } from "@/packages/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export async function login(values: LoginType) {
    try {
        const supabase = createClient();
        const result = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
        })
        return { user: result.data.user, error: null }
    } catch (error) {
        if (error instanceof AuthError) {
            return { user: null, error: error.message }
        }
        console.log({ error })
        return { user: null, error: "Couldn't sign in due to some technical errors, please try again later." }
    }
}