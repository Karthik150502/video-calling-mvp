"use client";
import React, { RefObject } from 'react'
import { Button } from './ui/button'
import { Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react'
import CallSettingsDrawer from './callSettingsDrawer';
import TooltipWrapper from './tooltipWrapper';

type ControlsProps = {
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    endCall: () => void,
    localStreamRef: RefObject<MediaStream | null>,
    setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setIsVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    replaceAudioTrackInPeerConnections: (newTrack: MediaStreamTrack) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>,
    sendToggleAudio: (value: boolean) => void,
    sendToggleVideo: (value: boolean) => void
}

export default function CallControls({
    isVideoEnabled,
    isAudioEnabled,
    endCall,
    localStreamRef,
    setIsAudioEnabled,
    setIsVideoEnabled,
    replaceAudioTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
    sendToggleAudio,
    sendToggleVideo
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


    return (
        <div className='w-[400px] p-4 flex items-center justify-center gap-4 fixed bottom-4'>
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
                replaceAudioTrackInPeerConnections={replaceAudioTrackInPeerConnections}
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
        </div>
    )
}
