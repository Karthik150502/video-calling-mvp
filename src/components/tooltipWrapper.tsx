import React from 'react'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TooltipWrapper({
    label,
    element
}: {
    element: React.ReactNode,
    label: string
}) {
    return <Tooltip>
        <TooltipTrigger asChild>
            {element}
        </TooltipTrigger>
        <TooltipContent>
            <p className='text-xs whitespace-nowrap'>
                {label}
            </p>
        </TooltipContent>
    </Tooltip>
}
