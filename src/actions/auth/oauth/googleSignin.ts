import { AUTH_CALLBACK } from "@/lib/constants"
import { createClient } from "@/packages/supabase/client"
import { ActionResponse, UIError } from "@/types/error"

export async function googleSignIn(): Promise<ActionResponse<unknown>> {
    try {
        const supabase = createClient()
        const result = await supabase.auth.signInWithOAuth({
            provider: "google", options: {
                redirectTo: AUTH_CALLBACK,
                scopes: "openid email profile"
            }
        })
        if (result.error) {
            return { errorCode: UIError.GOOGLE_SIGNUP_ERROR }
        }
        return null
    } catch (error) {
        console.error(error)
        return { errorCode: UIError.GOOGLE_SIGNUP_ERROR }
    }
}