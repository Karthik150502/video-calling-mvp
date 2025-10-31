"use client"

import { useEffect, RefObject } from "react"
import { VideoDisplay } from "./video-display"
import { cn } from "@/lib/utils"
import useStore from "@/zustand/stores/userSession"

interface LocalVideoPlayerProps {
    localStream?: MediaStream | null
    isVideoEnabled: boolean
    isAudioEnabled: boolean
    localVideoRef: RefObject<HTMLVideoElement | null>,
    minimize?: boolean,
    isFullscreen?: boolean,
}

export function LocalVideoPlayer({
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    localVideoRef,
    minimize,
    isFullscreen
}: LocalVideoPlayerProps) {

    const { user } = useStore();

    // Set up local video stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream, localVideoRef])

    return <VideoDisplay
        ref={localVideoRef}
        title={user?.name}
        isLocal={true}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isConnected={true}
        className={cn("min-h-0 aspect-video")}
        minimize={minimize}
        isFullscreen={isFullscreen}
        displayPicture={user?.avatar_url}
    />

}
