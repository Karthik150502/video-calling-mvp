"use client";
import { UserProfile } from "@/packages/supabase/types";
import { Participant } from "@/types";
import useStore from "@/zustand/stores/participants";
import { RefObject } from "react";

interface WebRTCMessage {
    type: string
    [key: string]: unknown
}

type UseWsProps = {
    onParticipantJoined?: (participant: Participant) => void
    onParticipantLeft?: (participantId: string) => void
    onError?: (error: Error) => void,
    onServerError?: (message?: string) => void,
    createPeerConnection: (participantId: string) => RTCPeerConnection,
    wsRef: RefObject<WebSocket | null>,
    localStreamRef: RefObject<MediaStream | null>,
    peerConnectionsRef: RefObject<Map<string, RTCPeerConnection>>,
    createOffer: (participantId: string) => Promise<void>,
    handleOffer: (offer: RTCSessionDescriptionInit, fromId: string) => Promise<void>,
    handleAnswer: (answer: RTCSessionDescriptionInit, fromId: string) => Promise<void>,
    handleIceCandidate: (candidate: RTCIceCandidateInit, fromId: string) => Promise<void>
}

export default function useWs({
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
}: UseWsProps) {

    const { setCurrentMeetingId, setParticipants } = useStore();

    const handleWs = (serverUrl: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!serverUrl || !serverUrl.startsWith("ws")) {
                const error = new Error("Invalid WebSocket URL provided")
                console.error("Invalid WebSocket URL:", serverUrl)
                reject(error)
                return
            }

            const ws = new WebSocket(serverUrl)
            let connectionTimeout: NodeJS.Timeout | null = null;

            connectionTimeout = setTimeout(() => {
                console.log("Connection timeout to signaling server")
                ws.close()
                reject(new Error("Connection timeout - signaling server may not be running"))
            }, 5000) // Reduced timeout from 10s to 5s

            ws.onopen = () => {
                console.log("Connected to signaling server successfully")
                clearTimeout(connectionTimeout)
                wsRef.current = ws
                resolve()
            }

            ws.onmessage = async (event) => {
                try {
                    const message: WebRTCMessage = JSON.parse(event.data)
                    console.log("Received message:", message.type, message.fromId ? `from ${message.fromId} ` : "")
                    const participantId = message.participantId as string;
                    const fromId = message.fromId as string;
                    const roomId = message.roomId as string;
                    switch (message.type) {
                        case "error-restart-server":
                            const cause = message.cause as string;
                            // Handle server restart.
                            if (onServerError) onServerError(cause);
                            break

                        case "room-joined":
                            setCurrentMeetingId(roomId)
                            console.log("Joined room", roomId, "with", message.participantCount, "participants")
                            break

                        case "existing-participants":
                            const existingParticipants = message.participants as Participant[];
                            console.log("Existing participants:", existingParticipants)
                            for (const participant of existingParticipants) {
                                console.log("Setting up connection to existing participant:", participant.id)
                                const pc = createPeerConnection(participant.id)

                                if (localStreamRef.current) {
                                    localStreamRef.current.getTracks().forEach((track) => {
                                        pc.addTrack(track, localStreamRef.current!)
                                    })
                                }
                                const newParticipant = { ...participant, connectionState: "new" as RTCPeerConnectionState }
                                setParticipants((prev) => {
                                    const updated = new Map(prev);
                                    updated.set(participant.id, newParticipant)
                                    return updated
                                })

                                if (onParticipantJoined) {
                                    onParticipantJoined(newParticipant)
                                }

                                setTimeout(() => createOffer(participant.id), 2000)
                            }
                            break

                        case "new-participant":
                            const participant = message.participant as UserProfile;
                            console.log("New participant joined:", participant)
                            const newParticipant: Participant = {
                                ...participant,
                                connectionState: "new" as RTCPeerConnectionState,
                                videoEnabled: message.videoEnabled as boolean,
                                audioEnabled: message.audioEnabled as boolean
                            }
                            setParticipants((prev) => {
                                const updated = new Map(prev);
                                updated.set(newParticipant.id, newParticipant)
                                return updated
                            })

                            if (onParticipantJoined) {
                                onParticipantJoined(newParticipant)
                            }
                            break

                        case "offer":
                            const offer = message.offer as RTCSessionDescriptionInit;
                            await handleOffer(offer, fromId)
                            break

                        case "answer":
                            const answer = message.answer as RTCSessionDescriptionInit;
                            await handleAnswer(answer, fromId)
                            break

                        case "ice-candidate":
                            const rtcCandidateInit = message.candidate as RTCIceCandidateInit
                            await handleIceCandidate(rtcCandidateInit, fromId)
                            break
                        case "participant-video-toggle":
                            const videoEnabled = message.value as boolean;
                            setParticipants(prev => {
                                const updated = new Map(prev);
                                const participant = updated.get(participantId)
                                if (participant) {
                                    participant.videoEnabled = videoEnabled
                                }
                                return updated
                            })
                            break
                        case "participant-audio-toggle":
                            const audioEnabled = message.value as boolean;
                            setParticipants(prev => {
                                const updated = new Map(prev);
                                const participant = updated.get(participantId)
                                if (participant) {
                                    participant.audioEnabled = audioEnabled
                                }
                                return updated
                            })
                            break

                        case "participant-left":
                            console.log("Participant left:", participantId)
                            const pc = peerConnectionsRef.current.get(participantId)
                            if (pc) {
                                pc.close()
                                peerConnectionsRef.current.delete(participantId)
                            }

                            setParticipants((prev) => {
                                const updated = new Map(prev);
                                updated.delete(participantId)
                                return updated
                            })

                            if (onParticipantLeft) {
                                onParticipantLeft(participantId)
                            }
                            break

                        default:
                            console.log("Unknown message type:", message.type)
                    }
                } catch (error) {
                    console.error("Error processing message:", error)
                    if (onError) onError(error as Error)
                }
            }

            ws.onerror = (error) => {
                console.error("WebSocket error:", error)
                clearTimeout(connectionTimeout)
                const errorMessage =
                    ws.readyState === WebSocket.CONNECTING
                        ? "Failed to connect to signaling server - server may not be running on " + serverUrl
                        : "WebSocket connection error"
                reject(new Error(errorMessage))
            }

            ws.onclose = (event) => {
                console.log("Disconnected from signaling server, code:", event.code, "reason:", event.reason)
                wsRef.current = null

                if (event.code === 1006) {
                    console.error("Connection closed abnormally - signaling server may not be running")
                }
            }
        })
    }

    return { handleWs }
}