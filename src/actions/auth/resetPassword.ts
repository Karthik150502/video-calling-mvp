import { createClient } from "@/packages/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export async function resetPassword(email: string) {
    try {
        const supabase = createClient();
        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:3000/auth/v1/callback?next=/auth/update-password`
        })
        if (result.error instanceof AuthError) {
            return { error: result.error.message }
        }
        return { error: null }
    } catch (error) {
        console.log({ error })
        if (error instanceof AuthError) {
            return { error: error.message }
        }
        return { error: "Couldn't send link due to some technical errors, please try again later." }
    }
}