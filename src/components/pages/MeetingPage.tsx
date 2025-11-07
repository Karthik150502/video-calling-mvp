"use client"

import { VideoPlayer } from "@/components/video-player/video-player"
import CallControls from "@/components/video-player/controls"
import { cn } from "@/lib/utils"
import useHandleMeetingPage from "@/hooks/use-handle-meeting-page"

export default function MeetingPage() {
    const {
        localStreamRef,
        participants,
        isVideoEnabled,
        isAudioEnabled,
        localVideoRef,
        remoteVideoRefs,
        participantCount,
        minimize,
        isFullscreen,
        setIsAudioEnabled,
        setIsVideoEnabled,
        endCall,
        replaceAudioVideoTrackInPeerConnections,
        sendToggleAudio,
        sendToggleVideo,
        showControls,
        toggleFullscreen
    } = useHandleMeetingPage();

    return (
        <div className="w-full min-h-screen bg-background relative">
            <div className={cn("py-2 h-[calc(100dvh-4rem)] w-[calc(100dvw-2rem)] absolute right-0 left-0 m-auto", isFullscreen && "py-0 min-h-screen w-full")}>
                <VideoPlayer
                    localStream={localStreamRef.current}
                    participants={participants}
                    isVideoEnabled={isVideoEnabled}
                    isAudioEnabled={isAudioEnabled}
                    localVideoRef={localVideoRef}
                    remoteVideoRefs={remoteVideoRefs}
                    participantCount={participantCount}
                    minimize={minimize}
                    isFullscreen={isFullscreen}
                />
            </div>
            <div className="w-screen h-16 flex justify-center gap-4 fixed bottom-0">
                <CallControls
                    isVideoEnabled={isVideoEnabled}
                    isAudioEnabled={isAudioEnabled}
                    setIsAudioEnabled={setIsAudioEnabled}
                    setIsVideoEnabled={setIsVideoEnabled}
                    endCall={endCall}
                    localStreamRef={localStreamRef}
                    replaceAudioVideoTrackInPeerConnections={replaceAudioVideoTrackInPeerConnections}
                    localVideoRef={localVideoRef}
                    remoteVideoRefs={remoteVideoRefs}
                    sendToggleAudio={sendToggleAudio}
                    sendToggleVideo={sendToggleVideo}
                    participantCount={participantCount}
                    participants={participants}
                    showControls={showControls}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                />
            </div>
        </div >
    )
}