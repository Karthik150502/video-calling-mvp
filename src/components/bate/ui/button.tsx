import React from "react"
import { Button as ShadcnButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

type ButtonProps = React.ComponentProps<typeof ShadcnButton>

interface CustomButtonProps extends ButtonProps {
    isLoading?: boolean,
}

export function Button({ isLoading, children, ...props }: CustomButtonProps) {
    return (
        <ShadcnButton {...props} className={cn("rounded-xs text-sm", props.className)} disabled={isLoading || props.disabled}>
            {isLoading && <Spinner />}
            {children}
        </ShadcnButton>
    )
}
