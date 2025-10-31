"use client";
import React, { RefObject } from 'react'
import { Button } from '../ui/button'
import { Ellipsis, LucideUsersRound, Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react'
import CallSettingsDrawer from './callSettingsDrawer';
import TooltipWrapper from '../tooltipWrapper';
import AdditionalCallSettings from './addtionalCallSettings';
import { Participant } from '@/types';
import ParticipantsTab from '../participants/participantsTab';
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
        showControls && "translate-y-0",
        "border border-black/20 rounded-full w-[90dvw] overflow-x-scroll no-scrollbar overflow-y-hidden flex items-center justify-start sm:border-none sm:w-fit sm:overflow-hidden")}>
        <div className={"w-[400px] p-4 flex items-center justify-center gap-4"}>
            <TooltipWrapper
                label='Video On/ Off'
                element={<Button
                    variant={isVideoEnabled ? "default" : "secondary"}
                    onClick={toggleVideo}
                    size={"icon"}
                    className="rounded-full"
                >
                    {isVideoEnabled ? <Video /> : <VideoOff />}
                </Button>}
            />
            <TooltipWrapper
                label='Mic On/ Off'
                element={<Button
                    variant={isAudioEnabled ? "default" : "secondary"}
                    onClick={toggleAudio}
                    size={"icon"}
                    className="rounded-full"
                >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                </Button>}
            />
            <Button
                variant="destructive"
                onClick={endCall}
                size={"default"}
                className="rounded-full">
                <PhoneOff />
                End Call
            </Button>
            <CallSettingsDrawer
                isVideoEnabled={isVideoEnabled}
                isAudioEnabled={isAudioEnabled}
                localStreamRef={localStreamRef}
                replaceAudioVideoTrackInPeerConnections={replaceAudioVideoTrackInPeerConnections}
                localVideoRef={localVideoRef}
                remoteVideoRefs={remoteVideoRefs}
                triggerElement={<Button size="icon" className='rounded-full'>
                    <Settings />
                </Button>}
            />
            <ParticipantsTab
                participants={participants}
                participantCount={participantCount}
                triggerElement={<Button
                    size={"icon"}
                    className="rounded-full">
                    <LucideUsersRound />
                </Button>}
            />
            <AdditionalCallSettings
                label='More Settings'
                isFullscreen={isFullscreen}
                toggleFullscreen={toggleFullscreen}
                triggerElement={<Button
                    variant="default"
                    size={"icon"}
                    className="rounded-full">
                    <Ellipsis />
                </Button>}
            />
        </div>
    </div >
}
