import { LoginType } from "@/lib/schema/zod";
import { createClient } from "@/packages/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export async function login(values: LoginType) {
    try {
        const supabase = createClient();
        const result = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        })
        console.log({
            result
        })
        if (result.error) {
            return { user: null, error: result.error.message, invalidCredentials: result.error.code === "invalid_credentials" }
        }
        return { user: result.data.user, error: null, invalidCredentials: false }
    } catch (error) {
        console.log({ error })
        if (error instanceof AuthError) {
            return { user: null, error: error.message, invalidCredentials: error.code === "invalid_credentials" }
        }
        return { user: null, error: "Couldn't sign in due to some technical errors, please try again later.", invalidCredentials: false }
    }
}