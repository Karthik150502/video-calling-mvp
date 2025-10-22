import { cn } from '@/lib/utils'
import { Participant } from '@/types/call'
import React from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Button } from './ui/button'
import { LucideUsersRound } from 'lucide-react'

type ParticipantPanelProps = {
    participants: Map<string, Participant>
    className?: string,
    participantCount: number
}

export default function ParticipantsTab({
    participants,
    participantCount,
    className
}: ParticipantPanelProps) {
    return <Popover>
        <PopoverTrigger asChild>
            <Button
                size={"icon"}
                className="rounded-full">
                <LucideUsersRound />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            <h1>{participantCount}</h1>
            <div className={cn("w-full min-h-[300px] flex-col items-center justify-center", className)}>
                <ScrollArea className="w-full h-full rounded-md border">
                    {
                        Array.from(participants.entries()).map(([id, participant]) => {
                            return <div key={id} className='w-full'>
                                {participant.id}&nbsp;{participant.connectionState}
                            </div>
                        })
                    }
                </ScrollArea>
            </div>
        </PopoverContent>
    </Popover>
}
