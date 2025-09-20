"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  UserCheck,
  UserX,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  stream?: MediaStream
  connectionState: RTCPeerConnectionState
}

interface ParticipantPanelProps {
  participants: Map<string, Participant>
  clientId?: string | null
  roomId?: string | null
  className?: string
}

export function ParticipantPanel({ participants, clientId, roomId, className }: ParticipantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedRoomId, setCopiedRoomId] = useState(false)

  const getConnectionIcon = (state: RTCPeerConnectionState) => {
    switch (state) {
      case "connected":
        return <SignalHigh className="w-4 h-4 text-green-500" />
      case "connecting":
        return <SignalMedium className="w-4 h-4 text-yellow-500" />
      case "disconnected":
        return <SignalLow className="w-4 h-4 text-orange-500" />
      case "failed":
        return <Signal className="w-4 h-4 text-red-500" />
      default:
        return <Signal className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getConnectionBadgeVariant = (state: RTCPeerConnectionState) => {
    switch (state) {
      case "connected":
        return "default"
      case "connecting":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getConnectionText = (state: RTCPeerConnectionState) => {
    switch (state) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting"
      case "disconnected":
        return "Disconnected"
      case "failed":
        return "Failed"
      case "closed":
        return "Closed"
      default:
        return "Unknown"
    }
  }

  const copyRoomId = async () => {
    if (roomId) {
      try {
        await navigator.clipboard.writeText(roomId)
        setCopiedRoomId(true)
        setTimeout(() => setCopiedRoomId(false), 2000)
      } catch (error) {
        console.error("Failed to copy room ID:", error)
      }
    }
  }

  const connectedParticipants = Array.from(participants.values()).filter(
    (p) => p.connectionState === "connected",
  ).length

  const totalParticipants = participants.size + 1 // +1 for local user

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Participants ({totalParticipants})
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Room Info */}
        {roomId && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Room: {roomId}
            </Badge>
            <Button variant="ghost" size="sm" onClick={copyRoomId} className="h-6 px-2 text-xs">
              {copiedRoomId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span>{connectedParticipants + 1} connected</span>
          </div>
          {participants.size > connectedParticipants && (
            <div className="flex items-center gap-1">
              <UserX className="w-4 h-4 text-orange-500" />
              <span>{participants.size - connectedParticipants} connecting</span>
            </div>
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {/* Local User */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">You (Local)</p>
                    <p className="text-xs text-muted-foreground">
                      {clientId ? `ID: ${clientId.slice(-6)}` : "Connecting..."}
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="text-xs">
                  <SignalHigh className="w-3 h-3 mr-1" />
                  Host
                </Badge>
              </div>

              {/* Remote Participants */}
              {Array.from(participants.entries()).map(([participantId, participant]) => (
                <div key={participantId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Participant</p>
                      <p className="text-xs text-muted-foreground">ID: {participantId.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(participant.connectionState)}
                    <Badge variant={getConnectionBadgeVariant(participant.connectionState)} className="text-xs">
                      {getConnectionText(participant.connectionState)}
                    </Badge>
                  </div>
                </div>
              ))}

              {participants.size === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for participants to join...</p>
                  <p className="text-xs mt-1">Share the room ID to invite others</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
