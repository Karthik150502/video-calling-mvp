import { LoginType } from "@/lib/schema/zod";
import { createClient } from "@/packages/supabase/client";
import { ActionResponse, UIError } from "@/types/error";
import { AuthError } from "@supabase/supabase-js";

export async function login(values: LoginType): Promise<ActionResponse<unknown>> {
    try {
        const supabase = createClient();
        const result = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        })
        if (result.error) {
            return { data: null, errorCode: result.error.code === "invalid_credentials" ? UIError.LOGIN_INVALID_CREDENTIALS : UIError.CRED_LOGIN_ERROR }
        }
        return { data: result.data.user, successMsg: "Successfully logged in!" }
    } catch (error) {
        console.error(error)
        if (error instanceof AuthError) {
            return { data: null, errorCode: error.code === "invalid_credentials" ? UIError.LOGIN_INVALID_CREDENTIALS : UIError.CRED_LOGIN_ERROR }
        }
        return { data: null, errorCode: UIError.CRED_LOGIN_ERROR }
    }
}