"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Users, Settings, AlertCircle, CheckCircle } from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { VideoGrid } from "@/components/video-grid"
import { ParticipantPanel } from "@/components/participant-panel"
import CallControls from "@/components/controls"
import { useHTMLVideoRefs } from "@/hooks/use-VideoRefs"

export default function VideoCallPage() {
    const [isCallActive, setIsCallActive] = useState(false)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [roomId, setRoomId] = useState("")
    const [signalingServerUrl, setSignalingServerUrl] = useState("ws://localhost:3001")
    const [connectionError, setConnectionError] = useState<string | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown")
    const [useLocalMode, setUseLocalMode] = useState(false)

    const localStreamRef = useRef<MediaStream | null>(null);

    const { localVideoRef, remoteVideoRefs } = useHTMLVideoRefs()

    const {
        isConnected,
        participants,
        roomId: currentRoomId,
        connectToSignalingServer,
        joinRoom,
        addLocalStream,
        disconnect,
        clientId,
        checkSignalingServer,
        replaceAudioTrackInPeerConnections,
        toggleAudio,
        toggleVideo
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
                // video: isVideoEnabled ? { width: 1280, height: 720, frameRate: 30 } : false,
                // audio: isAudioEnabled ? { echoCancellation: true, noiseSuppression: true } : false,
                video: { width: 1280, height: 720, frameRate: 30 },
                audio: { echoCancellation: true, noiseSuppression: true },
            })
            const audioTrack = stream.getAudioTracks()[0];
            const videoTrack = stream.getVideoTracks()[0];
            audioTrack.enabled = isAudioEnabled;
            videoTrack.enabled = isVideoEnabled;

            localStreamRef.current = stream
            return stream
        } catch (error) {
            console.error("Error accessing media devices:", error)
            throw error
        }
    }

    const startCall = async () => {
        setConnectionError(null);
        setIsConnecting(true);

        try {
            const stream = await getUserMedia()
            setIsCallActive(true)

            if (!useLocalMode) {
                await connectToSignalingServer(`${signalingServerUrl}?clientId=${"idFromSupabaseSession"}`)
            }

            addLocalStream(stream)
            const room = roomId || "default-room"

            if (!useLocalMode) {
                joinRoom(room, {
                    videoEnabled: isVideoEnabled,
                    audioEnabled: isAudioEnabled
                })
            }

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

    const endCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop())
        }

        disconnect()
        setIsCallActive(false)
        localStreamRef.current = null
        setConnectionError(null)
        setIsConnecting(false)
    }

    const getConnectionStatus = () => {
        if (!isCallActive) return "disconnected"
        if (isConnecting) return "connecting"
        if (isConnected) return "connected"
        return "waiting"
    }

    const getConnectionBadgeVariant = () => {
        const status = getConnectionStatus()
        switch (status) {
            case "connected":
                return "default"
            case "connecting":
                return "secondary"
            default:
                return "outline"
        }
    }

    const getConnectionText = () => {
        const status = getConnectionStatus()
        const participantCount = participants.size
        switch (status) {
            case "connected":
                return participantCount > 0 ? `Connected (${participantCount + 1} total)` : "Connected"
            case "connecting":
                return "Connecting..."
            case "waiting":
                return "Waiting for participants..."
            default:
                return "Disconnected"
        }
    }

    const getServerStatusDisplay = () => {
        switch (serverStatus) {
            case "online":
                return { icon: CheckCircle, text: "Server Online", variant: "default" as const }
            case "offline":
                return { icon: AlertCircle, text: "Server Offline", variant: "destructive" as const }
            case "checking":
                return { icon: AlertCircle, text: "Checking...", variant: "secondary" as const }
            default:
                return { icon: AlertCircle, text: "Unknown", variant: "outline" as const }
        }
    }

    useEffect(() => {
        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop())
            }
            disconnect()
        }
    }, [disconnect])

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-7xl mx-auto">


                {connectionError && (
                    <Card className="mb-6 max-w-2xl mx-auto border-destructive">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-destructive mb-1">Connection Failed</h4>
                                    <p className="text-sm text-muted-foreground mb-3">{connectionError}</p>
                                    <div className="text-xs text-muted-foreground">
                                        <p>• Make sure the signaling server is running on {signalingServerUrl}</p>
                                        <p>
                                            • Run: <code className="bg-muted px-1 rounded">cd server && npm install && npm start</code>
                                        </p>
                                        <p>• Check that the WebSocket URL is correct</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isCallActive && (
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
                            />
                        </div>

                        <div className="xl:col-span-1">
                            <ParticipantPanel
                                participants={participants}
                                clientId={clientId}
                                roomId={currentRoomId}
                                className="sticky top-4"
                            />
                        </div>
                    </div>
                )}

                <CallControls
                    isVideoEnabled={isVideoEnabled}
                    isAudioEnabled={isAudioEnabled}
                    setIsAudioEnabled={setIsAudioEnabled}
                    setIsVideoEnabled={setIsVideoEnabled}
                    endCall={endCall}
                    localStreamRef={localStreamRef}
                    replaceAudioTrackInPeerConnections={replaceAudioTrackInPeerConnections}
                    localVideoRef={localVideoRef}
                    remoteVideoRefs={remoteVideoRefs}
                    sendToggleAudio={toggleAudio}
                    sendToggleVideo={toggleVideo}
                />
            </div>
        </div>
    )
}
