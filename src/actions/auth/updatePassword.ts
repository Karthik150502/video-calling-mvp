import { createClient } from "@/packages/supabase/client";
import { ActionResponse, UIError } from "@/types/error";
import { AuthError } from "@supabase/supabase-js";

export async function updatePassword(password: string): Promise<ActionResponse<null>> {
    try {
        const supabase = createClient();
        const result = await supabase.auth.updateUser({
            password: password
        })
        if (result.error instanceof AuthError) {
            return { errorCode: UIError.CRED_UPDATE_PWD_ERROR }
        }
        return { successMsg: "Password updated successfully." }
    } catch (error) {
        console.error({ error })
        return { errorCode: UIError.CRED_UPDATE_PWD_ERROR }
    }
}