"use client"

import { Participant } from "@/types/call"
import useStore, { Participants } from "@/zustand/stores/store"
import { useRef, useCallback, useState, useEffect } from "react"

interface WebRTCMessage {
  type: string
  [key: string]: any
}

interface UseWebRTCProps {
  onParticipantJoined?: (participant: Participant) => void
  onParticipantLeft?: (participantId: string) => void
  onParticipantStreamUpdate?: (participantId: string, stream: MediaStream) => void
  onConnectionStateChange?: (participantId: string, state: RTCPeerConnectionState) => void
  onError?: (error: Error) => void
}

export function useWebRTC({
  onParticipantJoined,
  onParticipantLeft,
  onParticipantStreamUpdate,
  onConnectionStateChange,
  onError,
}: UseWebRTCProps = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const { setParticipants, setCurrentMeetingId, currentMeetingId } = useStore();
  const participants = useStore(state => state.participants)
  const [participantsFmt, setParticipantsFormatted] = useState<Participants>(new Map());
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const clientIdRef = useRef<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log("Hydration finished?", useStore.persist.hasHydrated())
    useStore.persist.onFinishHydration(() => {
      console.log("✅ Persist hydration complete")
    })
  }, [])

  useEffect(() => {
    const updated = (participants instanceof Map
      ? new Map(participants)
      : new Map(Object.entries(participants ?? {}))) as Participants;
    setParticipantsFormatted(updated)
    console.log("participants value:", participants)
    console.log("isMap?", participants instanceof Map)
    console.log({
      updated,
      participants
    })
  }, [participants])

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ]

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
        iceServers,
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
    [onParticipantStreamUpdate, onConnectionStateChange],
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

  const replaceAudioTrackInPeerConnections = useCallback(async (newTrack: MediaStreamTrack) => {
    if (!peerConnectionsRef.current) {
      console.log('No peer connections available, falling back to updatePeerConnections');
      if (localStreamRef.current) {
        updatePeerConnections(localStreamRef.current);
      }
      return;
    }

    console.log('Replacing audio track in', peerConnectionsRef.current.size, 'peer connections');

    const replacePromises = Array.from(peerConnectionsRef.current.entries()).map(async ([participantId, pc]) => {
      try {
        // Find the audio sender
        const audioSender = pc.getSenders().find(sender =>
          sender.track && sender.track.kind === 'audio'
        );

        if (audioSender) {
          console.log(`Replacing audio track for participant ${participantId}`);
          await audioSender.replaceTrack(newTrack);
          console.log(`Successfully replaced audio track for participant ${participantId}`);
        } else {
          console.log(`No audio sender found for participant ${participantId}, adding track`);
          pc.addTrack(newTrack, localStreamRef.current!);
        }
      } catch (error) {
        console.error(`Error replacing track for participant ${participantId}:`, error);
        // Fallback: try removing and adding the track
        try {
          const audioSender = pc.getSenders().find(sender =>
            sender.track && sender.track.kind === 'audio'
          );
          if (audioSender) {
            pc.removeTrack(audioSender);
          }
          pc.addTrack(newTrack, localStreamRef.current!);
          console.log(`Fallback successful for participant ${participantId}`);
        } catch (fallbackError) {
          console.error(`Fallback also failed for participant ${participantId}:`, fallbackError);
        }
      }
    });

    await Promise.allSettled(replacePromises);
  }, [updatePeerConnections]);

  const addLocalStream = useCallback((stream: MediaStream) => {
    console.log("Adding local stream with tracks:", stream.getTracks().length)
    localStreamRef.current = stream
    updatePeerConnections(stream)
  }, [updatePeerConnections])

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
          }),
        )
      } catch (error) {
        console.error("Error handling offer from", fromId, ":", error)
        if (onError) onError(error as Error)
      }
    },
    [createPeerConnection, onError],
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
          // Don't call onError for ICE candidate failures as they're often non-critical
        }
      } else {
        console.log("Queuing ICE candidate from", fromId, "- no remote description yet")
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

  const toggleAudio = useCallback((value: boolean) => {
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
  const toggleVideo = useCallback((value: boolean) => {
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

  const disconnect = useCallback((cleanUp?: boolean) => {
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

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }

    setIsConnected(false)
    setParticipants(new Map())
    if (!cleanUp) {
      setCurrentMeetingId(null);
    }
    clientIdRef.current = null
  }, [])


  const connectToSignalingServer = useCallback(
    (serverUrl: string) => {
      console.log("Connecting to signaling server:", serverUrl)

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
            console.log("Received message:", message.type, message.fromId ? `from ${message.fromId}` : "")

            switch (message.type) {
              case "client-id":
                clientIdRef.current = message.clientId
                console.log("Received client ID:", message.clientId)
                break

              case "room-joined":
                setCurrentMeetingId(message.roomId)
                console.log("Joined room", message.roomId, "with", message.participantCount, "participants")
                break

              case "existing-participants":
                console.log("Existing participants:", message.participants)
                for (const participantId of message.participants) {
                  console.log("Setting up connection to existing participant:", participantId)
                  const pc = createPeerConnection(participantId)

                  if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach((track) => {
                      pc.addTrack(track, localStreamRef.current!)
                    })
                  }

                  setParticipants((prev) => {
                    const updated = new Map(prev);
                    updated.set(participantId, { id: participantId, connectionState: "new" })
                    return updated
                  })

                  if (onParticipantJoined) {
                    onParticipantJoined({ id: participantId, connectionState: "new" })
                  }

                  setTimeout(() => createOffer(participantId), 2000)
                }
                break

              case "new-participant":
                console.log("New participant joined:", message.participantId)
                const newParticipant: Participant = { id: message.participantId, connectionState: "new" as RTCPeerConnectionState, videoEnabled: message.videoEnabled, audioEnabled: message.audioEnabled }
                setParticipants((prev) => {
                  const updated = new Map(prev);
                  updated.set(message.participantId, newParticipant)
                  return updated
                })

                if (onParticipantJoined) {
                  onParticipantJoined(newParticipant)
                }
                break

              case "offer":
                await handleOffer(message.offer, message.fromId)
                break

              case "answer":
                await handleAnswer(message.answer, message.fromId)
                break

              case "ice-candidate":
                await handleIceCandidate(message.candidate, message.fromId)
                break
              case "participant-video-toggle":
                setParticipants(prev => {
                  const updated = new Map(prev);
                  const participant = updated.get(message.participantId)
                  if (participant) {
                    participant.videoEnabled = message.value
                  }
                  return updated
                })
                break
              case "participant-audio-toggle":
                setParticipants(prev => {
                  const updated = new Map(prev);
                  const participant = updated.get(message.participantId)
                  if (participant) {
                    participant.audioEnabled = message.value
                  }
                  return updated
                })
                break

              case "participant-left":
                console.log("Participant left:", message.participantId)
                const pc = peerConnectionsRef.current.get(message.participantId)
                if (pc) {
                  pc.close()
                  peerConnectionsRef.current.delete(message.participantId)
                }

                setParticipants((prev) => {
                  const updated = new Map(prev);
                  updated.delete(message.participantId)
                  return updated
                })

                if (onParticipantLeft) {
                  onParticipantLeft(message.participantId)
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
    },
    [
      createPeerConnection,
      createOffer,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      onParticipantJoined,
      onParticipantLeft,
      onError,
    ],
  )

  const checkSignalingServer = useCallback(async (serverUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(serverUrl.replace("ws://", "http://").replace("wss://", "https://"))
      return response.ok
    } catch {
      return false
    }
  }, [])

  return {
    isConnected,
    participants,
    connectToSignalingServer,
    joinRoom,
    addLocalStream,
    disconnect,
    clientId: clientIdRef.current,
    checkSignalingServer, // Exposed helper function
    replaceAudioTrackInPeerConnections,
    updatePeerConnections,
    toggleAudio,
    toggleVideo,
    currentMeetingId,
  }
}
