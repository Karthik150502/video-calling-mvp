"use client"

import { Participant } from "@/types"
import useStore from "@/zustand/stores/participants"
import useUserStore from "@/zustand/stores/userSession"
import { useRef } from "react"
import { useAddtionalCallSettings } from "./use-settings"
import useWs from "./use-ws"
import { useHandlePeerConnections } from "./use-handle-peer-conenctions"
import useHandleMeeting from "./use-handle-meeting"

interface UseWebRTCProps {
  onParticipantJoined?: (participant: Participant) => void
  onParticipantLeft?: (participantId: string) => void
  onParticipantStreamUpdate?: (participantId: string, stream: MediaStream) => void
  onConnectionStateChange?: (participantId: string, state: RTCPeerConnectionState) => void
  onError?: (error: Error) => void,
  onServerError?: (message?: string) => void
}

export function useWebRTC({
  onParticipantJoined,
  onParticipantLeft,
  onParticipantStreamUpdate,
  onConnectionStateChange,
  onError,
  onServerError
}: UseWebRTCProps = {}) {
  const { setParticipants, setCurrentMeetingId } = useStore();
  const participants = useStore(state => state.participants);
  const currentMeetingId = useStore(state => state.currentMeetingId);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const participantCount = participants.size;
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { accessToken } = useUserStore();
  const { toggleFullscreen } = useAddtionalCallSettings();

  const {
    isConnected,
    setIsConnected,
    replaceAudioVideoTrackInPeerConnections,
    updatePeerConnections,
    handleAnswer,
    handleOffer,
    handleIceCandidate,
    createOffer,
    createPeerConnection
  } = useHandlePeerConnections({
    onParticipantStreamUpdate,
    onConnectionStateChange,
    onError,
    wsRef,
    localStreamRef
  })

  const { handleWs } = useWs({
    onParticipantJoined,
    onParticipantLeft,
    wsRef,
    onServerError,
    onError,
    createPeerConnection,
    localStreamRef,
    peerConnectionsRef,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate
  })

  const {
    checkSignalingServer,
    addLocalStream,
    removeLocalStream,
    disconnect,
    connectToSignalingServer,
    sendToggleAudio,
    sendToggleVideo,
    joinRoom
  } = useHandleMeeting({
    accessToken,
    handleWs,
    wsRef,
    localStreamRef,
    currentMeetingId,
    updatePeerConnections,
    reconnectTimeoutRef,
    peerConnectionsRef,
    setParticipants,
    setCurrentMeetingId,
    toggleFullscreen,
    setIsConnected
  })

  return {
    isConnected,
    participants,
    connectToSignalingServer,
    joinRoom,
    addLocalStream,
    disconnect,
    checkSignalingServer,
    replaceAudioVideoTrackInPeerConnections,
    updatePeerConnections,
    sendToggleAudio,
    sendToggleVideo,
    currentMeetingId,
    participantCount,
    localStreamRef,
    accessToken,
    removeLocalStream
  }
}
