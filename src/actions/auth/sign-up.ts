import { AUTH_CALLBACK } from "@/lib/constants";
import { SignUpType } from "@/lib/schema/zod";
import { createClient } from "@/packages/supabase/client";
import { ActionResponse, UIError } from "@/types/error";

export async function signUp(values: SignUpType): Promise<ActionResponse<unknown>> {
    try {
        const supabase = createClient()
        const result = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
                emailRedirectTo: AUTH_CALLBACK,
                data: {
                    firstName: values.firstName,
                    lastName: values.lastName
                }
            }
        })
        if (result.error) {
            return { data: null, errorCode: UIError.CRED_SIGNUP_ERROR }
        }
        return { data: result.data.user, successMsg: `A confirmation email has been sent at ${values.email}. Please verify your email before logging in.` }
    } catch (error) {
        console.error(error)
        return { data: null, errorCode: UIError.CRED_SIGNUP_ERROR }
    }
}