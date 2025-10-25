import { createClient } from "@/packages/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export async function updatePassword(password: string) {
    try {
        const supabase = createClient();
        const result = await supabase.auth.updateUser({
            password: password
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
        return { error: "Couldn't update password due to some technical errors, please try again later." }
    }
}