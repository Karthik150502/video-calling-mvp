import React from 'react'


import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TooltipWrapper({
    label,
    children
}: {
    children: React.ReactNode,
    label: string
}) {
    return <Tooltip>
        <TooltipTrigger asChild>
            {children}
        </TooltipTrigger>
        <TooltipContent>
            <p className='text-sm whitespace-nowrap'>
                {label}
            </p>
        </TooltipContent>
    </Tooltip>
}
