"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Settings, AlertCircle, CheckCircle } from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useRouter } from "next/navigation"

export default function VideoCallPage() {
  const [roomId, setRoomId] = useState("")
  const [signalingServerUrl, setSignalingServerUrl] = useState("ws://localhost:3001")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown")
  const [useLocalMode, setUseLocalMode] = useState(false);
  const router = useRouter();

  const {
    checkSignalingServer
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

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={async () => {
              if (useLocalMode) {
                
              } else {
                router.push(`/meeting/${roomId}`);
              }
            }}
            size="lg"
            className="px-8"
            disabled={isConnecting || (!useLocalMode && serverStatus === "offline")}
          >
            <Phone className="w-5 h-5 mr-2" />
            {isConnecting ? "Connecting..." : useLocalMode ? "Start Local Test" : "Join Call"}
          </Button>
        </div>

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
      </div>
    </div>
  )
}
