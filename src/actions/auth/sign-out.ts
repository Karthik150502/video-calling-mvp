import { createClient } from "@/packages/supabase/client";

export async function signOut() {
    const supabase = createClient()
    return supabase.auth.signOut({ scope: "local" });
}