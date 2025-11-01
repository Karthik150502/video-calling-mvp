import { createClient } from "@/packages/supabase/client";
import { ActionResponse, UIError } from "@/types/error";

export async function resetPassword(email: string): Promise<ActionResponse<unknown>> {
    try {
        const supabase = createClient();
        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `http://localhost:3000/auth/v1/callback?next=/auth/update-password`
        })
        if (result.error) {
            return { errorCode: UIError.CRED_RESET_PWD_ERROR }
        }
        return null
    } catch (error) {
        console.log(error)
        return { errorCode: UIError.CRED_RESET_PWD_ERROR }
    }
}