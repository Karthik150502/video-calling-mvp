import { cn } from '@/lib/utils'
import { Participant } from '@/types/call'
import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from '@radix-ui/react-scroll-area'
import TooltipWrapper from './tooltipWrapper'

type ParticipantPanelProps = {
    participants: Map<string, Participant>
    className?: string,
    participantCount: number,
    triggerElement: React.ReactNode
}

export default function ParticipantsTab({
    participants,
    participantCount,
    className,
    triggerElement
}: ParticipantPanelProps) {
    return <Popover>
        <TooltipWrapper
            label='Participants'
            element={<PopoverTrigger asChild>
                {triggerElement}
            </PopoverTrigger>}
        />
        <PopoverContent className="w-80">
            <div className={cn("min-h-[250px] md:w-fit w-[90dvw] flex-col items-center justify-center", className)}>
                <ScrollArea className="w-full h-full rounded-md border">
                </ScrollArea>
            </div>
        </PopoverContent>
    </Popover>
}
