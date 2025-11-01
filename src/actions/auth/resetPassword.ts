import { AUTH_CALLBACK } from "@/lib/constants";
import { createClient } from "@/packages/supabase/client";
import { ActionResponse, UIError } from "@/types/error";

export async function resetPassword(email: string): Promise<ActionResponse<unknown>> {
    try {
        const supabase = createClient();
        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${AUTH_CALLBACK}?next=/auth/update-password`
        })
        if (result.error) {
            return { errorCode: UIError.CRED_RESET_PWD_ERROR }
        }
        return { successMsg: `Sent Password reset link to your registered email at ${email}.` }
    } catch (error) {
        console.log(error)
        return { errorCode: UIError.CRED_RESET_PWD_ERROR }
    }
}