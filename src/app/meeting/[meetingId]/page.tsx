"use client"

import { useState, useRef, useEffect } from "react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { VideoGrid } from "@/components/video-grid"
import { ParticipantPanel } from "@/components/participant-panel"
import CallControls from "@/components/controls"
import { useHTMLVideoRefs } from "@/hooks/use-VideoRefs"
import { useParams } from "next/navigation";
import useStore from "@/zustand/stores/store"
import { useRouter } from "next/navigation"

export default function MeetingPage() {
    const [isCallActive, setIsCallActive] = useState(false);
    const { setCurrentMeetingId } = useStore();
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const params = useParams();
    const [signalingServerUrl, setSignalingServerUrl] = useState("ws://localhost:3001")
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown")
    const router = useRouter();

    useEffect(() => {
        const id = params.meetingId ? Array.isArray(params.meetingId) ? params.meetingId[0] : params.meetingId : ""

        console.log({ meetingId: id })
        setCurrentMeetingId(id)
    }, [params])

    const localStreamRef = useRef<MediaStream | null>(null);
    const { localVideoRef, remoteVideoRefs } = useHTMLVideoRefs()

    const {
        participants,
        connectToSignalingServer,
        joinRoom,
        addLocalStream,
        disconnect,
        clientId,
        checkSignalingServer,
        replaceAudioVideoTrackInPeerConnections,
        toggleAudio,
        toggleVideo,
        currentMeetingId,
        participantCount
    } = useWebRTC({
        onParticipantJoined: (participant) => {
            console.log("Participant joined:", participant.id)
        },
        onParticipantLeft: (participantId) => {
            console.log("Participant left:", participantId)
        },
        onParticipantStreamUpdate: (participantId, stream) => {
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
        // disconnectCall();
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
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
                    <div className="xl:col-span-3">
                        <VideoGrid
                            localStream={localStreamRef.current || undefined}
                            participants={participants}
                            isVideoEnabled={isVideoEnabled}
                            isAudioEnabled={isAudioEnabled}
                            localVideoRef={localVideoRef}
                            remoteVideoRefs={remoteVideoRefs}
                            className="min-h-[400px] max-h-[80vh]"
                            participantCount={participantCount}
                        />
                    </div>

                    <div className="xl:col-span-1">
                        <ParticipantPanel
                            participants={participants}
                            clientId={clientId}
                            roomId={currentMeetingId}
                            className="sticky top-4"
                            participantCount={participantCount}
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mb-8">
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
                        sendToggleAudio={toggleAudio}
                        sendToggleVideo={toggleVideo}
                    />
                </div>
            </div>
        </div>
    )
}
