"use client"

import { useState, useTransition } from "react";
import { ActionResponse, ErrorMessages } from "@/types/error";

export function useActionHandler<T>(
    action: (values: T) => Promise<ActionResponse<unknown>>
) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handle = (values: T, onSuccess?: (data: unknown) => void) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const { data, errorCode, successMsg } = await action(values);
            if (successMsg) {
                setSuccess(successMsg);
            }
            if (errorCode) {
                setError(ErrorMessages[errorCode]);
            }
            onSuccess?.(data)
        });
    };

    return { handle, isPending, error, success };
}
