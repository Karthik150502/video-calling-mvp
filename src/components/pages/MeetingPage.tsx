"use client"

import { useState, useRef, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { VideoPlayer } from "@/components/video-player/video-player"
import CallControls from "@/components/video-player/controls"
import { useHTMLVideoRefs } from "@/hooks/use-video-refs"
import { useParams } from "next/navigation";
import useStore from "@/zustand/stores/participants"
import { useRouter } from "next/navigation";
import { useAddtionalCallSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"
import { SIGNALING_SERVER } from "@/lib/constants"

export default function MeetingPage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const { setCurrentMeetingId } = useStore();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const params = useParams();
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false)
    const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown");
    const router = useRouter();

    useEffect(() => {
        const id = params.meetingId ? Array.isArray(params.meetingId) ? params.meetingId[0] : params.meetingId : ""
        setCurrentMeetingId(id)
    }, [params])

    const localStreamRef = useRef<MediaStream | null>(null);
    const { localVideoRef, remoteVideoRefs } = useHTMLVideoRefs();
    const { toggleFullscreen, isFullscreen, showControls, setShowControls } = useAddtionalCallSettings();

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        let timer = timerRef.current;
        if (showControls) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                setShowControls(false)
            }, 5000)
        }

        return () => {
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [showControls])

    const handleMoudeMove = () => {
        setShowControls(true)
    }
    useEffect(() => {
        window.addEventListener("mouseover", handleMoudeMove);
        return () => {
            window.removeEventListener("mouseover", handleMoudeMove);
        }
    }, [])

    const {
        participants,
        connectToSignalingServer,
        joinRoom,
        addLocalStream,
        disconnect,
        checkSignalingServer,
        replaceAudioVideoTrackInPeerConnections,
        sendToggleAudio,
        sendToggleVideo,
        currentMeetingId,
        participantCount,
        accessToken,
    } = useWebRTC({
        onParticipantJoined: (_participant) => {
        },
        onParticipantLeft: (participantId) => {
            console.log("Participant left:", participantId)
        },
        onParticipantStreamUpdate: (participantId, _stream) => {
            console.log("Participant stream updated:", participantId)
        },
        onConnectionStateChange: (participantId, state) => {
            console.log(`Connection state changed for ${participantId}:`, state)
        },
        onError: (error) => {
            console.error("WebRTC error:", error)
            setConnectionError(error.message)
            setIsConnecting(false)
        },
        onServerError: (message) => {
            console.error(message);
            if (message) {
                setConnectionError(message)
            }
            endCall();
        }
    })
    const minimize = participantCount > 0;

    const checkServerStatus = async () => {
        if (!SIGNALING_SERVER) return
        setServerStatus("checking")
        try {
            const isOnline = await checkSignalingServer(SIGNALING_SERVER)
            setServerStatus(isOnline ? "online" : "offline")
        } catch {
            setServerStatus("offline")
        }
    }

    useEffect(() => {
        if (SIGNALING_SERVER) {
            const timeoutId = setTimeout(checkServerStatus, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [SIGNALING_SERVER])

    const getUserMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, frameRate: 30 },
                audio: { echoCancellation: true, noiseSuppression: true },
            })
            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];
            audioTrack.enabled = isAudioEnabled;
            videoTrack.enabled = isVideoEnabled;
            return stream
        } catch (error) {
            console.error("Error accessing media devices:", error)
            throw error
        }
    }

    const startCall = async (activeMeetingId?: string) => {
        setConnectionError(null);
        setIsConnecting(true);
        try {
            const stream = await getUserMedia()
            localStreamRef.current = stream;
            setIsCallActive(true)

            await connectToSignalingServer(`${SIGNALING_SERVER}`, {
                isAudioEnabled,
                isVideoEnabled
            })

            addLocalStream(stream)
            const room = activeMeetingId || "default-room"

            joinRoom(room, {
                videoEnabled: isVideoEnabled,
                audioEnabled: isAudioEnabled
            })

            setIsConnecting(false)
        } catch (error) {
            console.error("Failed to start call:", error)
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
            setConnectionError(errorMessage)
            setIsCallActive(false)
            setIsConnecting(false)
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop())
                localStreamRef.current = null
            }
        }
    }

    const disconnectCall = () => {
        // Stop all local media tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                track.stop()
            })
            localStreamRef.current = null
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        disconnect()
    }

    const endCall = () => {
        router.push("/home");
        setIsCallActive(false)
        setConnectionError(null)
        setIsConnecting(false)
    }


    useEffect(() => {
        if (currentMeetingId && accessToken) {
            startCall(currentMeetingId);
        }
    }, [currentMeetingId, accessToken])

    useEffect(() => {
        window.addEventListener("unload", disconnectCall)
        return () => {
            disconnectCall()
            window.removeEventListener("unload", disconnectCall)
        }
    }, [])

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
        </div>
    )
}
