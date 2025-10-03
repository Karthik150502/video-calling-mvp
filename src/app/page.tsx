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
    connectToSignalingServer,
    joinRoom,
    addLocalStream,
    disconnect,
    clientId,
    checkSignalingServer,
    replaceAudioTrackInPeerConnections,
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

  const participantsCount = participants.size

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

      localStreamRef.current = stream
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
      setIsCallActive(true)

      if (!useLocalMode) {
        await connectToSignalingServer(`${signalingServerUrl}?clientId=${"idFromSupabaseSession"}`)
      }

      addLocalStream(stream)
      const room = roomId || "default-room"


      if (!useLocalMode) {
        joinRoom(activeMeetingId ? activeMeetingId : room, {
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
    switch (status) {
      case "connected":
        return participantsCount > 0 ? `Connected (${participantsCount + 1} total)` : "Connected"
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
    if (currentMeetingId) {
      startCall();
    }
  }, [])

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      disconnect(true)
    }
  }, [disconnect])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Multi-Peer Video Call</h1>
          <p className="text-muted-foreground text-pretty">
            Group video calling with WebRTC - supports 2 or more participants
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <Badge variant={getConnectionBadgeVariant()}>{getConnectionText()}</Badge>
            {clientId && (
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                ID: {clientId.substring(0, 6)}
              </Badge>
            )}
            {currentMeetingId && <Badge variant="outline">Room: {currentMeetingId}</Badge>}
          </div>
        </div>

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

        {!isCallActive && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Call Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="local-mode"
                  checked={useLocalMode}
                  onChange={(e) => setUseLocalMode(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="local-mode" className="text-sm">
                  Local Mode (Browser-only testing)
                </Label>
              </div>

              {!useLocalMode && (
                <>
                  <div>
                    <Label htmlFor="room-id">Room ID (optional)</Label>
                    <Input
                      id="room-id"
                      placeholder="Enter room ID or leave empty for default"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="server-url">Signaling Server</Label>
                    <Input
                      id="server-url"
                      placeholder="ws://localhost:3001"
                      value={signalingServerUrl}
                      onChange={(e) => setSignalingServerUrl(e.target.value)}
                    />
                    {serverStatus !== "unknown" && (
                      <div className="mt-2">
                        {(() => {
                          const status = getServerStatusDisplay()
                          return (
                            <Badge variant={status.variant} className="text-xs">
                              <status.icon className="w-3 h-3 mr-1" />
                              {status.text}
                            </Badge>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </>
              )}

              {useLocalMode && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Local mode allows you to test camera/microphone access without a signaling server. Perfect for
                    development and testing the UI components.
                  </p>
                </div>
              )}
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
        )}

        <div className="flex justify-center gap-4 mb-8">
          {!isCallActive ? (
            <Button
              onClick={() => { startCall() }}
              size="lg"
              className="px-8"
              disabled={isConnecting || (!useLocalMode && serverStatus === "offline")}
            >
              <Phone className="w-5 h-5 mr-2" />
              {isConnecting ? "Connecting..." : useLocalMode ? "Start Local Test" : "Join Call"}
            </Button>
          ) : <CallControls
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
          />}
        </div>

        {!isCallActive && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>How to Use Multi-Peer Video Calling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Setup Steps:</h4>
                  <ol className="space-y-1 text-sm">
                    <li>1. Start the signaling server</li>
                    <li>2. Enter a room ID (optional)</li>
                    <li>3. Click (Join Call)</li>
                    <li>4. Share room ID with multiple participants</li>
                    <li>5. Each participant joins the same room</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Support for 2+ participants</li>
                    <li>• Automatic video grid layout</li>
                    <li>• Participant management panel</li>
                    <li>• Real-time connection status</li>
                    <li>• HD video quality (720p)</li>
                    <li>• Echo cancellation</li>
                    <li>• Room ID sharing</li>
                  </ul>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Server Setup:</strong> Run{" "}
                  <code className="bg-muted px-1 rounded">cd server && npm install && npm start</code> to start the
                  signaling server on port 3001. Multiple participants can join the same room for group video calls.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
