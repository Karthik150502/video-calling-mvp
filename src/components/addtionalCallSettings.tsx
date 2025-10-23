"use client";
import React from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { Ellipsis } from 'lucide-react';
import TooltipWrapper from './tooltipWrapper';
type CallSettingsProps = {
    label: string,
    isFullscreen?: boolean,
    toggleFullscreen: () => void,
    triggerElement: React.ReactNode
}

export default function AdditionalCallSettings({
    label,
    toggleFullscreen,
    isFullscreen,
    triggerElement
}: CallSettingsProps) {

    return (
        <DropdownMenu>
            <TooltipWrapper
                label='Additional Settings'
                element={<DropdownMenuTrigger asChild>
                    {triggerElement}
                </DropdownMenuTrigger>}
            />
            <DropdownMenuPortal>
                <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>{label}</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={toggleFullscreen}>
                        {isFullscreen ? "Exit Fullscreen" : "Enable Fullscreen"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    )
}
