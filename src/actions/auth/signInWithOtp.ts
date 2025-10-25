import { createClient } from "@/packages/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export async function sendOtp(email: string) {
    try {
        const supabase = createClient();
        const result = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true,
            }
        })
        if (result.error) {
            return { error: result.error.message }
        }
        return { error: null }
    } catch (error) {
        console.log({ error })
        if (error instanceof AuthError) {
            return { error: error.message }
        }
        return { error: "Couldn't send otp due to some technical errors, please try again later." }
    }
}