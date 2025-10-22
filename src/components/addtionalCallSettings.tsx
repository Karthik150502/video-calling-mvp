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
type CallSettingsProps = {
    label: string,
    isFullscreen?: boolean,
    toggleFullscreen: () => void
}

export default function AdditionalCallSettings({
    label,
    toggleFullscreen,
    isFullscreen,
}: CallSettingsProps) {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    size={"icon"}
                    className="rounded-full">
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
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
