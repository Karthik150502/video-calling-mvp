"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/bate/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Settings, AlertCircle, CheckCircle } from "lucide-react"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useRouter } from "next/navigation"
import ErrorBanner from "@/components/errorBanner"
import { UserProfile } from "@/packages/supabase/types"
import { getSession } from "@/actions/auth/getSession"
import LogoutButton from "@/components/auth/logoutButton"

export default function HomePage() {
  const [roomId, setRoomId] = useState("")
  const [signalingServerUrl, setSignalingServerUrl] = useState("ws://localhost:3001")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown")
  const [useLocalMode, setUseLocalMode] = useState(false);
  const router = useRouter();


  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata.firstName,
          lastName: session.user.user_metadata.lastName,
          emailVerified: session.user.user_metadata.email_verified,
        }
        console.log({
          userData
        })
        setUser(userData)
      }
    })
  }, [])

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


        {
          connectionError && <ErrorBanner
            heading={"Connection Failed"}
            title={connectionError}
            description={<div className="w-full h-full">
              <p>• Make sure the signaling server is running on {signalingServerUrl}</p>
              <p>
                • Run: <code className="bg-muted px-1 rounded">cd server && npm install && npm start</code>
              </p>
              <p>• Check that the WebSocket URL is correct</p>
            </div>}
          />
        }
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
            disabled={isConnecting || (!useLocalMode && serverStatus === "offline")}
          >
            <Phone />
            {isConnecting ? "Connecting..." : useLocalMode ? "Start Local Test" : "Join Call"}
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
