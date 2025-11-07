"use client"

import { useState, useTransition } from "react";
import { ActionResponse, ErrorMessages } from "@/types/error";

export function useActionHandler<T, U = unknown>(
    action: (values: T) => Promise<ActionResponse<U>>
) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handle = (values: T, onSuccess?: (data: unknown) => void) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            const result = await action(values);
            if (result) {
                const { data, errorCode, successMsg } = result;
                if (successMsg) {
                    setSuccess(successMsg);
                }
                if (errorCode) {
                    setError(ErrorMessages[errorCode]);
                }
                onSuccess?.(data)
            }
        });
    };

    return { handle, isPending, error, success };
}
