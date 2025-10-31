"use client"

import { useEffect, RefObject } from "react"
import { cn } from "@/lib/utils"
import { Participants } from "@/zustand/stores/participants"
import ParticipantsVideoPlayer from "./participantsVideoPlayer"
import { LocalVideoPlayer } from "./localVideoPlayer"


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
    <LocalVideoPlayer
      localVideoRef={localVideoRef}
      isVideoEnabled={isVideoEnabled}
      isAudioEnabled={isAudioEnabled}
      minimize={minimize}
      isFullscreen={isFullscreen}
    />
    <ParticipantsVideoPlayer
      participants={participants}
      participantCount={participantCount}
      remoteVideoRefs={remoteVideoRefs}
      isFullscreen={isFullscreen}
      minimize={minimize}
    />
  </div>
}
