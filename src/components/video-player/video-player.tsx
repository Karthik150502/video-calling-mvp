"use client"

import { useEffect, RefObject } from "react"
import { VideoDisplay } from "./video-display"
import { cn } from "@/lib/utils"
import { Participants } from "@/zustand/stores/participants"
import useStore from "@/zustand/stores/userSession"


interface VideoGridProps {
  localStream?: MediaStream | null
  participants: Participants
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  className?: string,
  localVideoRef: RefObject<HTMLVideoElement | null>,
  remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>,
  participantCount: number,
  minimize?: boolean,
  isFullscreen?: boolean
}

export function VideoPlayer({ localStream, participants, isVideoEnabled, isAudioEnabled, className, localVideoRef, remoteVideoRefs, participantCount, minimize, isFullscreen }: VideoGridProps) {

  const { user } = useStore();

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream, localVideoRef])

  // Set up remote video streams
  useEffect(() => {
    Array.from(participants.entries()).forEach(([participantId, participant]) => {
      const videoElement = remoteVideoRefs.current.get(participantId)
      if (videoElement && participant.stream instanceof MediaStream) {
        videoElement.srcObject = participant.stream
      }
    })
  }, [participants])

  // Get video size based on participant count
  const getCols = () => {
    if (participantCount == 1) return "grid grid-cols-1"
    if (participantCount == 2) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    if (participantCount > 2) return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  }

  return <div className={cn("w-full h-full gap-4", className, getCols())
  }>
    <VideoDisplay
      ref={localVideoRef}
      title={user?.name}
      isLocal={true}
      isVideoEnabled={isVideoEnabled}
      isAudioEnabled={isAudioEnabled}
      isConnected={true}
      className={cn("min-h-0 aspect-video")}
      minimize={minimize}
      isFullscreen={isFullscreen}
      displayPicture={user?.avatar_url}
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
          title={participant.name}
          displayPicture={participant.avatar_url}
          isLocal={false}
          isVideoEnabled={participant.videoEnabled}
          isAudioEnabled={participant.audioEnabled}
          connectionQuality={isConnected ? "good" : "poor"}
          isConnected={isConnected}
          className={cn("min-h-0 aspect-video")}
        />
      )
    })}
  </div>
}
