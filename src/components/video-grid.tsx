"use client"

import { useRef, useEffect } from "react"
import { VideoDisplay } from "./video-display"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  stream?: MediaStream
  connectionState: RTCPeerConnectionState
}

interface VideoGridProps {
  localStream?: MediaStream
  participants: Map<string, Participant>
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  className?: string
}

export function VideoGrid({ localStream, participants, isVideoEnabled, isAudioEnabled, className }: VideoGridProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // Set up remote video streams
  useEffect(() => {
    participants.forEach((participant, participantId) => {
      const videoElement = remoteVideoRefs.current.get(participantId)
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream
      }
    })
  }, [participants])

  const participantCount = participants.size
  const totalVideos = participantCount + 1 // +1 for local video

  // Calculate grid layout based on number of participants
  const getGridLayout = () => {
    if (totalVideos <= 1) return "grid-cols-1"
    if (totalVideos <= 2) return "grid-cols-1 md:grid-cols-2"
    if (totalVideos <= 4) return "grid-cols-2"
    if (totalVideos <= 6) return "grid-cols-2 md:grid-cols-3"
    if (totalVideos <= 9) return "grid-cols-3"
    return "grid-cols-3 md:grid-cols-4"
  }

  // Get video size based on participant count
  const getVideoSize = () => {
    if (totalVideos <= 2) return "aspect-video"
    if (totalVideos <= 4) return "aspect-video"
    return "aspect-square md:aspect-video"
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className={cn("grid gap-4 h-full auto-rows-fr", getGridLayout())}>
        {/* Local Video */}
        <VideoDisplay
          ref={localVideoRef}
          title="You (Local)"
          isLocal={true}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          isConnected={true}
          className={cn("min-h-0", getVideoSize())}
        />

        {/* Remote Videos */}
        {Array.from(participants.entries()).map(([participantId, participant]) => {
          const isConnected = participant.connectionState === "connected"

          return (
            <VideoDisplay
              key={participantId}
              ref={(el) => {
                if (el) {
                  remoteVideoRefs.current.set(participantId, el)
                } else {
                  remoteVideoRefs.current.delete(participantId)
                }
              }}
              title={`Participant ${participantId.slice(-4)}`}
              isLocal={false}
              isVideoEnabled={true} // We assume remote video is enabled unless we get specific info
              isAudioEnabled={true} // We assume remote audio is enabled unless we get specific info
              connectionQuality={isConnected ? "good" : "poor"}
              isConnected={isConnected}
              className={cn("min-h-0", getVideoSize())}
            />
          )
        })}
      </div>

      {/* Participant Count Indicator */}
      {participantCount > 0 && (
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium">
          {totalVideos} participant{totalVideos !== 1 ? "s" : ""} in call
        </div>
      )}
    </div>
  )
}
