import { createClient } from "@/packages/supabase/client"
import { AuthError } from "@supabase/supabase-js"

export async function googleSignIn() {
    try {
        const supabase = createClient()
        const result = await supabase.auth.signInWithOAuth({
            provider: "google", options: {
                redirectTo: "http://localhost:3000/auth/v1/callback",
                scopes: "openid email profile"
            }
        })
        if (result.error) {
            return { user: null, error: result.error.message }
        }
        return { user: result.data, error: null }
    } catch (error) {
        if (error instanceof AuthError) {
            return { user: null, error: error.message }
        }
        return { user: null, error: "Couldn't sign up due to some technical errors, please try again later." }
    }
}