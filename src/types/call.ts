export interface Participant {
    id: string
    stream?: MediaStream
    connectionState: RTCPeerConnectionState,
    videoEnabled?: boolean,
    audioEnabled?: boolean,
    name?: string
    email?: string,
    emailVerified?: boolean,
    avatar_url?: string
}