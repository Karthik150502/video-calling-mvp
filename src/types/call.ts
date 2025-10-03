export interface Participant {
    id: string
    stream?: MediaStream
    connectionState: RTCPeerConnectionState,
    videoEnabled?: boolean,
    audioEnabled?: boolean
}