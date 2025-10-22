"use client"

import { useState, useRef, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { VideoPlayer } from "@/components/video-player"
import CallControls from "@/components/controls"
import { useHTMLVideoRefs } from "@/hooks/use-videoRefs"
import { useParams } from "next/navigation";
import useStore from "@/zustand/stores/store"
import { useRouter } from "next/navigation";
import { useAddtionalCallSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"
import { useAudioSettings } from "@/hooks/use-audio"
import { useVideoSettings } from "@/hooks/use-video"

export default function MeetingPage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const { setCurrentMeetingId } = useStore();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const params = useParams();
    const [signalingServerUrl, setSignalingServerUrl] = useState("ws://localhost:3001")
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
    const { toggleFullscreen, isFullscreen } = useAddtionalCallSettings();

    const [showControls, setShowControls] = useState<boolean>(isFullscreen ?? false);
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
        participantCount
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
    })
    const minimize = participantCount > 0;

    const checkServerStatus = async () => {
        if (!signalingServerUrl) return
        setServerStatus("checking")
        try {
            const isOnline = await checkSignalingServer(signalingServerUrl)
            setServerStatus(isOnline ? "online" : "offline")
        } catch {
            setServerStatus("offline")
        }
    }

    useEffect(() => {
        if (signalingServerUrl) {
            const timeoutId = setTimeout(checkServerStatus, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [signalingServerUrl])

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

            await connectToSignalingServer(`${signalingServerUrl}?clientId=${"idFromSupabaseSession"}`)

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
        router.push("/");
        setIsCallActive(false)
        setConnectionError(null)
        setIsConnecting(false)
    }


    useEffect(() => {
        if (currentMeetingId) {
            startCall(currentMeetingId);
        }
    }, [currentMeetingId])

    useEffect(() => {
        window.addEventListener("unload", disconnectCall)
        return () => {
            disconnectCall()
            window.removeEventListener("unload", disconnectCall)
        }
    }, [])

    return (
        <div className="w-full min-h-screen bg-background relative">
            <div className={cn("py-2 h-[calc(100dvh-4rem)] w-[calc(100dvw-2rem)] absolute right-0 left-0 m-auto", isFullscreen && "py-0 min-h-screen lg:w-full")}>
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
