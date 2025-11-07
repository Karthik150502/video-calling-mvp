"use client"
import { Participant } from "@/types"
import { RefObject, useCallback } from "react"

interface UseHandleMeetingProps {
    accessToken: string | null,
    currentMeetingId: string | null,
    handleWs: (serverUrl: string) => Promise<void>,
    wsRef: RefObject<WebSocket | null>,
    localStreamRef: RefObject<MediaStream | null>,
    updatePeerConnections: (stream: MediaStream) => void,
    reconnectTimeoutRef: RefObject<NodeJS.Timeout | null>,
    peerConnectionsRef: RefObject<Map<string, RTCPeerConnection>>,
    setParticipants: (payload: Map<string, Participant> | ((prev: Map<string, Participant>) => Map<string, Participant>)) => void,
    setCurrentMeetingId: (payload: string | null) => void,
    toggleFullscreen: () => void,
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
}

export default function useHandleMeeting({
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
}: UseHandleMeetingProps) {

    const connectToSignalingServer = useCallback((url: string, { isAudioEnabled, isVideoEnabled }: { isVideoEnabled: boolean, isAudioEnabled: boolean }) => {
        const serverUrl = `${url}?token=${accessToken}&isVideoEnabled=${isVideoEnabled}&isAudioEnabled=${isAudioEnabled}`
        return handleWs(serverUrl);
    },
        [
            accessToken,
            handleWs
        ],
    )

    const addLocalStream = useCallback((stream: MediaStream) => {
        console.log("Adding local stream with tracks:", stream.getTracks().length)
        localStreamRef.current = stream
        updatePeerConnections(stream)
    }, [updatePeerConnections])

    const removeLocalStream = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop())
            localStreamRef.current = null
        }
    }, [])

    const joinRoom = useCallback((roomId: string, {
        videoEnabled,
        audioEnabled
    }: {
        videoEnabled: boolean,
        audioEnabled: boolean
    }) => {
        if (wsRef.current) {
            wsRef.current.send(
                JSON.stringify({
                    type: "join-room",
                    roomId: roomId,
                    videoEnabled,
                    audioEnabled
                }),
            )
        }
    }, [])

    const sendToggleAudio = useCallback((value: boolean) => {
        if (wsRef.current) {
            wsRef.current.send(
                JSON.stringify({
                    type: "toggle-audio",
                    roomId: currentMeetingId,
                    value
                }),
            )
        }
    }, [currentMeetingId])

    const sendToggleVideo = useCallback((value: boolean) => {
        if (wsRef.current) {
            wsRef.current.send(
                JSON.stringify({
                    type: "toggle-video",
                    roomId: currentMeetingId,
                    value
                }),
            )
        }
    }, [currentMeetingId])

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }

        peerConnectionsRef.current.forEach((pc) => {
            pc.close()
        })
        peerConnectionsRef.current.clear()

        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        removeLocalStream()
        setIsConnected(false)
        setParticipants(new Map())
        setCurrentMeetingId(null);
        if (document.fullscreenElement) {
            toggleFullscreen();
        }
    }, [])

    const checkSignalingServer = useCallback(async (serverUrl: string): Promise<boolean> => {
        try {
            const response = await fetch(serverUrl.replace("ws://", "http://").replace("wss://", "https://"))
            return response.ok
        } catch {
            return false
        }
    }, [])

    return {
        checkSignalingServer,
        addLocalStream,
        removeLocalStream,
        disconnect,
        connectToSignalingServer,
        sendToggleAudio,
        sendToggleVideo,
        joinRoom
    }
}