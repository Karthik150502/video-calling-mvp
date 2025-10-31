import { Participants } from '@/zustand/stores/participants'
import React, { RefObject } from 'react'
import { cn } from '@/lib/utils'
import { ParticipantVideoDisplay } from './participant-video-display'

type ParticipantsVideoPlayerProps = {
    participants: Participants
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>,
    participantCount: number,
    isFullscreen?: boolean,
    minimize?: boolean
}

export default function ParticipantsVideoPlayer({ participants, remoteVideoRefs, isFullscreen }: ParticipantsVideoPlayerProps) {
    return Array.from(participants.entries()).map(([participantId, participant]) => {
        const isConnected = participant.connectionState === "connected"
        return <ParticipantVideoDisplay
            key={participantId}
            ref={(el) => {
                if (el) {
                    remoteVideoRefs.current.set(participantId, el)
                } else {
                    remoteVideoRefs.current.delete(participantId)
                }
            }}
            title={participant.name}
            displayPicture={participant.avatar_url}
            isVideoEnabled={participant.videoEnabled}
            isAudioEnabled={participant.audioEnabled}
            connectionQuality={isConnected ? "good" : "poor"}
            isConnected={isConnected}
            className={cn("min-h-0 aspect-video")}
            isFullscreen={isFullscreen}
        />
    })
}
