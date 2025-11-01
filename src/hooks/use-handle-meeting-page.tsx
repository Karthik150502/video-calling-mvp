"use client"

import useStore from "@/zustand/stores/participants";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useHTMLVideoRefs } from "./use-video-refs";
import { useAddtionalCallSettings } from "./use-settings";
import { useWebRTC } from "./use-webrtc";
import { SIGNALING_SERVER } from "@/lib/constants";

export default function useHandleMeetingPage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const { setCurrentMeetingId } = useStore();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const { meetingId } = useParams();
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false)
    const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown");
    const router = useRouter();
    const { localVideoRef, remoteVideoRefs } = useHTMLVideoRefs();
    const { toggleFullscreen, isFullscreen, showControls } = useAddtionalCallSettings();

    useEffect(() => {
        const id = meetingId ? Array.isArray(meetingId) ? meetingId[0] : meetingId : ""
        setCurrentMeetingId(id)
    }, [meetingId])

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
        localStreamRef,
        removeLocalStream
    } = useWebRTC({
        onParticipantJoined: () => {
        },
        onParticipantLeft: (participantId) => {
            console.log("Participant left:", participantId)
        },
        onParticipantStreamUpdate: (participantId) => {
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

    const checkServerStatus = useCallback(async () => {
        if (!SIGNALING_SERVER) return
        setServerStatus("checking")
        try {
            const isOnline = await checkSignalingServer(SIGNALING_SERVER)
            setServerStatus(isOnline ? "online" : "offline")
        } catch {
            setServerStatus("offline")
        }
    }, [])

    useEffect(() => {
        if (SIGNALING_SERVER) {
            const timeoutId = setTimeout(checkServerStatus, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [checkServerStatus])

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

    const startCall = async (activeMeetingId: string) => {
        setConnectionError(null);
        setIsConnecting(true);
        try {
            const stream = await getUserMedia()
            addLocalStream(stream);
            setIsCallActive(true);
            await connectToSignalingServer(`${SIGNALING_SERVER}`, {
                isAudioEnabled,
                isVideoEnabled
            })
            joinRoom(activeMeetingId, {
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
            removeLocalStream()
        }
    }

    const disconnectCall = () => {
        // Stop all local media tracks
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        disconnect()
    }

    const endCall = useCallback(() => {
        router.push("/home");
        setIsCallActive(false)
        setConnectionError(null)
        setIsConnecting(false)
    }, [])

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

    return {
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
        toggleFullscreen,
        isCallActive,
        isConnecting,
        connectionError,
        serverStatus
    }

}