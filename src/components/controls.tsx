"use client";
import React, { RefObject } from 'react'
import { Button } from './ui/button'
import { Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react'
import CallSettingsDrawer from './callSettingsDrawer';
import TooltipWrapper from './tooltipWrapper';
import AdditionalCallSettings from './addtionalCallSettings';
import { Participant } from '@/types/call';
import ParticipantsTab from './participantsTab';
import { cn } from '@/lib/utils';

type ControlsProps = {
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    endCall: () => void,
    localStreamRef: RefObject<MediaStream | null>,
    setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setIsVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    replaceAudioVideoTrackInPeerConnections: (newTrack: MediaStreamTrack) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>,
    sendToggleAudio: (value: boolean) => void,
    sendToggleVideo: (value: boolean) => void,
    isFullscreen?: boolean,
    toggleFullscreen: () => void,
    participants: Map<string, Participant>
    participantCount: number,
    showControls: boolean
}

export default function CallControls({
    isVideoEnabled,
    isAudioEnabled,
    endCall,
    toggleFullscreen,
    isFullscreen,
    participants,
    participantCount,
    showControls,
    localStreamRef,
    setIsAudioEnabled,
    setIsVideoEnabled,
    replaceAudioVideoTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
    sendToggleAudio,
    sendToggleVideo,
}: ControlsProps) {


    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                sendToggleVideo(!videoTrack.enabled)
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                sendToggleAudio(!audioTrack.enabled)
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    return <div className={cn("w-screen h-16 flex justify-center gap-4 fixed bottom-0 transition-transform duration-300",
        isFullscreen && "translate-y-16",
        showControls && "translate-y-0")}>
        <div className={"w-[400px] p-4 flex items-center justify-center gap-4"}>
            <TooltipWrapper label='Video On/ Off'>
                <Button
                    variant={isVideoEnabled ? "default" : "secondary"}
                    onClick={toggleVideo}
                    size={"icon"}
                    className="rounded-full"
                >
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>
            </TooltipWrapper>
            <TooltipWrapper label='Mic On/ Off'>
                <Button
                    variant={isAudioEnabled ? "default" : "secondary"}
                    onClick={toggleAudio}
                    size={"icon"}
                    className="rounded-full"
                >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                </Button>
            </TooltipWrapper>
            <CallSettingsDrawer
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                localStreamRef={localStreamRef}
                replaceAudioVideoTrackInPeerConnections={replaceAudioVideoTrackInPeerConnections}
                localVideoRef={localVideoRef}
                remoteVideoRefs={remoteVideoRefs}
                drawerTrigger={<Button size="icon" className='rounded-full'><Settings /></Button>}
            />
            <Button
                variant="destructive"
                onClick={endCall}
                size={"default"}
                className="rounded-full">
                <PhoneOff />
                End Call
            </Button>
            <ParticipantsTab
                participants={participants}
                participantCount={participantCount}
            />
            <AdditionalCallSettings
                label='More Settings'
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
            />
        </div>
    </div>
}
