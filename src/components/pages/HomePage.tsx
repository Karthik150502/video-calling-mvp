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
import LogoutButton from "@/components/auth/logoutButton"
import { SIGNALING_SERVER } from "@/lib/constants"

export default function HomePage() {
  const [roomId, setRoomId] = useState("")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [serverStatus, setServerStatus] = useState<"unknown" | "checking" | "online" | "offline">("unknown")
  const router = useRouter();

  const {
    checkSignalingServer
  } = useWebRTC({
    onError: (error) => {
      console.error("WebRTC error:", error)
      setConnectionError(error.message)
      setIsConnecting(false)
    },
  })

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
              <p>• Make sure the signaling server is running on {SIGNALING_SERVER}</p>
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

          </CardContent>
        </Card>
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={async () => {
              router.push(`/meeting/${roomId}`);
            }}
            disabled={isConnecting || (serverStatus === "offline")}
          >
            <Phone />
            {isConnecting ? "Connecting..." : "Join Call"}
          </Button>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
