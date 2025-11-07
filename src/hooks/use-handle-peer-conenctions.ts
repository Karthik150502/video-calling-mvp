"use client"

import { Participant } from "@/types"
import useStore from "@/zustand/stores/participants"
import useUserStore from "@/zustand/stores/userSession"
import { useRef, useCallback, useState, RefObject } from "react"
import { ICE_SERVERS } from "@/lib/data"

interface UseHandlePeerConnectionsProps {
    onParticipantStreamUpdate?: (participantId: string, stream: MediaStream) => void
    onConnectionStateChange?: (participantId: string, state: RTCPeerConnectionState) => void
    onError?: (error: Error) => void,
    wsRef: RefObject<WebSocket | null>,
    localStreamRef: RefObject<MediaStream | null>,
}

export function useHandlePeerConnections({
    onParticipantStreamUpdate,
    onConnectionStateChange,
    onError,
    wsRef,
    localStreamRef
}: UseHandlePeerConnectionsProps) {
    const [isConnected, setIsConnected] = useState(false)
    const { setParticipants } = useStore();
    const currentMeetingId = useStore(state => state.currentMeetingId);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const createPeerConnection = useCallback(
        (participantId: string) => {
            console.log("Creating peer connection for:", participantId)

            // Close existing connection if it exists
            const existingPc = peerConnectionsRef.current.get(participantId)
            if (existingPc) {
                console.log("Closing existing connection for:", participantId)
                existingPc.close()
            }

            const pc = new RTCPeerConnection({
                iceServers: ICE_SERVERS,
                iceCandidatePoolSize: 10,
                iceTransportPolicy: "all",
                bundlePolicy: "max-bundle",
                rtcpMuxPolicy: "require",
            })

            pc.onicecandidate = (event) => {
                console.log("ICE candidate for", participantId, ":", event.candidate?.type || "null")
                if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(
                        JSON.stringify({
                            type: "ice-candidate",
                            candidate: event.candidate,
                            targetId: participantId,
                            roomId: currentMeetingId
                        }),
                    )
                }
            }

            pc.ontrack = (event) => {
                console.log("Received remote stream from", participantId, "tracks:", event.streams[0]?.getTracks().length)
                if (event.streams[0]) {
                    setParticipants((prev) => {
                        const updated = new Map(prev);
                        const participant = updated.get(participantId) || {
                            id: participantId,
                            connectionState: "new" as RTCPeerConnectionState,
                        }
                        participant.stream = event.streams[0]
                        updated.set(participantId, participant)
                        return updated
                    })

                    if (onParticipantStreamUpdate) {
                        onParticipantStreamUpdate(participantId, event.streams[0])
                    }
                }
            }

            pc.onconnectionstatechange = () => {
                console.log("Connection state changed for", participantId, ":", pc.connectionState)
                console.log("ICE connection state:", pc.iceConnectionState)
                console.log("ICE gathering state:", pc.iceGatheringState)
                console.log("Signaling state:", pc.signalingState)

                setParticipants((prev) => {
                    const updated = new Map(prev);
                    const participant = updated.get(participantId) || { id: participantId, connectionState: pc.connectionState }
                    participant.connectionState = pc.connectionState
                    updated.set(participantId, participant)
                    return updated
                })

                if (onConnectionStateChange) {
                    onConnectionStateChange(participantId, pc.connectionState)
                }

                if (pc.connectionState === "failed") {
                    console.log("Connection failed for", participantId, "- attempting reconnection")
                    attemptReconnection(participantId)
                } else if (pc.connectionState === "disconnected") {
                    console.log("Connection disconnected for", participantId, "- monitoring for recovery")
                    // Give it some time to recover before attempting reconnection
                    setTimeout(() => {
                        if (pc.connectionState === "disconnected") {
                            console.log("Connection still disconnected, attempting reconnection")
                            attemptReconnection(participantId)
                        }
                    }, 5000)
                }

                // Update overall connection status
                const allConnections = Array.from(peerConnectionsRef.current.values())
                const hasConnectedPeers = allConnections.some((conn) => conn.connectionState === "connected")
                setIsConnected(hasConnectedPeers)
            }

            pc.oniceconnectionstatechange = () => {
                console.log("ICE connection state for", participantId, ":", pc.iceConnectionState)

                if (pc.iceConnectionState === "failed") {
                    console.log("ICE connection failed for", participantId, "- restarting ICE")
                    pc.restartIce()
                }
            }

            pc.onsignalingstatechange = () => {
                console.log("Signaling state for", participantId, ":", pc.signalingState)
            }

            peerConnectionsRef.current.set(participantId, pc)
            return pc
        },
        [onParticipantStreamUpdate, onConnectionStateChange, currentMeetingId],
    )

    const createOffer = useCallback(
        async (participantId: string) => {
            console.log("Creating offer for:", participantId)
            const pc = peerConnectionsRef.current.get(participantId)
            if (!pc || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.log("Cannot create offer - missing peer connection or websocket")
                return
            }

            try {
                const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                    iceRestart: false,
                })

                console.log("Created offer for", participantId, "- setting local description")
                await pc.setLocalDescription(offer)

                console.log("Sending offer to", participantId)
                wsRef.current.send(
                    JSON.stringify({
                        type: "offer",
                        offer: offer,
                        targetId: participantId,
                        roomId: currentMeetingId
                    }),
                )
            } catch (error) {
                console.error("Error creating offer for", participantId, ":", error)
                if (onError) onError(error as Error)
            }
        },
        [onError],
    )

    const handleOffer = useCallback(
        async (offer: RTCSessionDescriptionInit, fromId: string) => {
            console.log("Handling offer from:", fromId)

            let pc = peerConnectionsRef.current.get(fromId)
            if (!pc) {
                console.log("Creating new peer connection for offer from:", fromId)
                pc = createPeerConnection(fromId)

                // Add local stream if available
                if (localStreamRef.current) {
                    console.log("Adding local stream to new peer connection")
                    localStreamRef.current.getTracks().forEach((track) => {
                        pc!.addTrack(track, localStreamRef.current!)
                    })
                }
            }

            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.log("Cannot handle offer - websocket not ready")
                return
            }

            try {
                console.log("Setting remote description from", fromId)
                await pc.setRemoteDescription(offer)

                console.log("Creating answer for", fromId)
                const answer = await pc.createAnswer()

                console.log("Setting local description (answer) for", fromId)
                await pc.setLocalDescription(answer)

                console.log("Sending answer to", fromId)
                wsRef.current.send(
                    JSON.stringify({
                        type: "answer",
                        answer: answer,
                        targetId: fromId,
                        roomId: currentMeetingId
                    }),
                )
            } catch (error) {
                console.error("Error handling offer from", fromId, ":", error)
                if (onError) onError(error as Error)
            }
        },
        [createPeerConnection, onError, currentMeetingId],
    )

    const handleAnswer = useCallback(
        async (answer: RTCSessionDescriptionInit, fromId: string) => {
            console.log("Handling answer from:", fromId)
            const pc = peerConnectionsRef.current.get(fromId)
            if (!pc) {
                console.log("No peer connection found for answer from:", fromId)
                return
            }

            try {
                console.log("Setting remote description (answer) from", fromId)
                await pc.setRemoteDescription(answer)
                console.log("Answer processed successfully from", fromId)
            } catch (error) {
                console.error("Error handling answer from", fromId, ":", error)
                if (onError) onError(error as Error)
            }
        },
        [onError],
    )

    const handleIceCandidate = useCallback(
        async (candidate: RTCIceCandidateInit, fromId: string) => {
            console.log("Handling ICE candidate from:", fromId, "type:", candidate.candidate?.split(" ")[7])
            const pc = peerConnectionsRef.current.get(fromId)
            if (!pc) {
                console.log("No peer connection found for ICE candidate from:", fromId)
                return
            }

            if (pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(candidate)
                    console.log("ICE candidate added successfully from", fromId)
                } catch (error) {
                    console.error("Error adding ICE candidate from", fromId, ":", error)
                    if (onError) onError(error as Error);
                    // Don't call onError for ICE candidate failures as they're often non-critical
                }
            } else {
                console.log("Queuing ICE candidate from", fromId, "- no remote description yet");
                // Queue the candidate for later
                setTimeout(() => {
                    if (pc.remoteDescription) {
                        pc.addIceCandidate(candidate).catch(console.error)
                    }
                }, 1000)
            }
        },
        [onError],
    )

    const attemptReconnection = useCallback((participantId: string) => {
        console.log("Attempting reconnection for:", participantId)

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }

        reconnectTimeoutRef.current = setTimeout(() => {
            const pc = peerConnectionsRef.current.get(participantId)
            if (pc && (pc.connectionState === "failed" || pc.connectionState === "disconnected")) {
                console.log("Restarting ICE for", participantId)
                pc.restartIce()
            }
        }, 2000) // Reduced timeout for faster recovery
    }, [])

    const updatePeerConnections = useCallback((stream: MediaStream) => {
        peerConnectionsRef.current.forEach((pc, participantId) => {
            console.log("Adding tracks to peer connection for:", participantId)

            // Remove existing tracks first
            pc.getSenders().forEach((sender) => {
                if (sender.track) {
                    console.log("Removing existing track:", sender.track.kind)
                    pc.removeTrack(sender)
                }
            })

            // Add new tracks
            stream.getTracks().forEach((track) => {
                console.log("Adding track:", track.kind, "enabled:", track.enabled)
                pc.addTrack(track, stream)
            })
        })
    }, [])

    const replaceAudioVideoTrackInPeerConnections = useCallback(async (newTrack: MediaStreamTrack, replaceAudio: boolean = true) => {
        if (!peerConnectionsRef.current) {
            console.log('No peer connections available, falling back to updatePeerConnections');
            if (localStreamRef.current) {
                updatePeerConnections(localStreamRef.current);
            }
            return;
        }
        const track = replaceAudio ? "audio" : "video"

        console.log(`Replacing ${track} track in`, peerConnectionsRef.current.size, 'peer connections');

        const replacePromises = Array.from(peerConnectionsRef.current.entries()).map(async ([participantId, pc]) => {
            try {
                // Find the audio sender
                const sender = pc.getSenders().find(sender =>
                    sender.track && sender.track.kind === track
                );

                if (sender) {
                    console.log(`Replacing ${track} track for participant ${participantId}`);
                    await sender.replaceTrack(newTrack);
                    console.log(`Successfully replaced ${track} track for participant ${participantId}`);
                } else {
                    console.log(`No ${track} sender found for participant ${participantId}, adding track`);
                    pc.addTrack(newTrack, localStreamRef.current!);
                }
            } catch (error) {
                console.error(`Error replacing track for participant ${participantId}: `, error);
                // Fallback: try removing and adding the track
                try {
                    const sender = pc.getSenders().find(sender =>
                        sender.track && sender.track.kind === track
                    );
                    if (sender) {
                        pc.removeTrack(sender);
                    }
                    pc.addTrack(newTrack, localStreamRef.current!);
                    console.log(`Fallback successful for participant ${participantId}`);
                } catch (fallbackError) {
                    console.error(`Fallback also failed for participant ${participantId}: `, fallbackError);
                }
            }
        });

        await Promise.allSettled(replacePromises);
    }, [updatePeerConnections]);


    return {
        isConnected,
        replaceAudioVideoTrackInPeerConnections,
        updatePeerConnections,
        currentMeetingId,
        handleAnswer,
        handleOffer,
        handleIceCandidate,
        createOffer,
        createPeerConnection,
        setIsConnected
    }
}
