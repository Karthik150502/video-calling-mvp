import { useRef } from "react"

export function useHTMLVideoRefs() {

    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

    return {
        localVideoRef,
        remoteVideoRefs
    }
}