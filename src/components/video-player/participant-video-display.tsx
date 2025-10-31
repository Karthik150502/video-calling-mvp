"use client"

import { forwardRef, useCallback, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, Signal, SignalHigh, SignalLow, SignalMedium, CircleUserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWebRTC } from "@/hooks/use-webrtc"
import Image from "next/image"
import VideoDisplayOverlay from "../bate/ui/videoDisplayOverlay"

interface ParticipantVideoDisplayProps {
    title?: string
    isVideoEnabled?: boolean
    isAudioEnabled?: boolean
    connectionQuality?: "poor" | "fair" | "good" | "excellent"
    isConnected?: boolean
    className?: string,
    minimize?: boolean,
    isFullscreen?: boolean,
    displayPicture?: string
}

const ParticipantVideoDisplay = forwardRef<HTMLVideoElement, ParticipantVideoDisplayProps>(
    (
        {
            title,
            displayPicture,
            isVideoEnabled,
            isAudioEnabled,
            connectionQuality,
            isConnected,
            minimize,
            isFullscreen
        },
        ref,
    ) => {
        const [isVideoLoaded, setIsVideoLoaded] = useState(false);
        const { participantCount } = useWebRTC();

        const getQualityIcon = () => {
            switch (connectionQuality) {
                case "excellent":
                    return <SignalHigh className="w-4 h-4 text-green-500" />
                case "good":
                    return <SignalMedium className="w-4 h-4 text-yellow-500" />
                case "fair":
                    return <SignalLow className="w-4 h-4 text-orange-500" />
                case "poor":
                    return <Signal className="w-4 h-4 text-red-500" />
                default:
                    return null
            }
        }

        const getQualityText = () => {
            switch (connectionQuality) {
                case "excellent":
                    return "Excellent"
                case "good":
                    return "Good"
                case "fair":
                    return "Fair"
                case "poor":
                    return "Poor"
                default:
                    return null
            }
        }

        const getAdditionalStyles = useCallback(() => {
            if (minimize) {
                return "z-50 transition-all duration-500 absolute md:w-[325px] md:h-[175px] bottom-0 right-0 w-[220px] h-[120px]"
            }
            else if (participantCount > 1) {
                return "aspect-video"
            }
            else if (isFullscreen) {
                return "w-full h-full rounded-none"
            }
            else {
                return "w-full h-full"
            }
        }, [minimize, participantCount, isFullscreen])

        const getOverlay = useCallback(() => {
            if (!isVideoEnabled) {
                return <VideoDisplayOverlay
                    overlayContent={displayPicture ? <Image width={50} height={50} className="rounded-full" src={displayPicture} alt={`${title}'s display picure`} /> : <CircleUserRound className="w-16 h-16 text-muted-foreground mx-auto mb-2" />}
                />
            }

            if (!isConnected) {
                return <VideoDisplayOverlay
                    overlayContent={<div className="animate-pulse">
                        <Video className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    </div>}
                    label="Waiting for connection..."
                />
            }
            if (!isVideoLoaded && isConnected) {
                return <VideoDisplayOverlay
                    overlayContent={<div className="animate-pulse">
                        <Video className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    </div>}
                    label="Loading video..."
                />
            }
            return null;
        }, [isVideoEnabled, isVideoLoaded, isConnected, displayPicture, title])

        return (
            <div className={cn("relative bg-muted overflow-hidden rounded-2xl", getAdditionalStyles())}>

                {getOverlay()}

                {/* Only render video element when video should be enabled */}
                <video
                    ref={ref}
                    autoPlay
                    playsInline
                    className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        isVideoLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onError={() => setIsVideoLoaded(false)}
                />

                {/* Local Video Indicator */}
                <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                        {title}
                    </Badge>
                </div>

                <div className="absolute top-2 right-2 flex items-center justify-center gap-2">
                    <Badge variant="outline" className="px-2 py-1">
                        {
                            isAudioEnabled ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />
                        }
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1">
                        {
                            isVideoEnabled ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />
                        }
                    </Badge>
                </div>
            </div>
        )
    },
)

ParticipantVideoDisplay.displayName = "ParticipantVideoDisplay"

export { ParticipantVideoDisplay }
