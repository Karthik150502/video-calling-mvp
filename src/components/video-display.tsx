"use client"

import { forwardRef, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoDisplayProps {
  title: string
  isLocal?: boolean
  isVideoEnabled?: boolean
  isAudioEnabled?: boolean
  connectionQuality?: "poor" | "fair" | "good" | "excellent"
  isConnected?: boolean
  className?: string,
  minimize?: boolean
}

const VideoDisplay = forwardRef<HTMLVideoElement, VideoDisplayProps>(
  (
    { title, isLocal = false, isVideoEnabled = true, isAudioEnabled = true, connectionQuality, isConnected, className, minimize },
    ref,
  ) => {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)

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

    return (
      <div className={cn("relative bg-muted overflow-hidden rounded-2xl", minimize ? "z-50 transition-all duration-500 absolute md:w-[325px] md:h-[175px] bottom-0 right-0 w-[220px] h-[120px]" : "h-full w-full"
      )}>
        {/* Video Disabled Overlay */}
        {!isVideoEnabled && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Video disabled</p>
            </div>
          </div>)}

        <video
          ref={ref}
          autoPlay
          muted={isLocal}
          playsInline
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
        />

        {/* Waiting for Connection Overlay */}
        {!isLocal && !isConnected && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
              </div>
              <p className="text-sm text-muted-foreground">Waiting for connection...</p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isVideoEnabled && !isVideoLoaded && isConnected && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
              </div>
              <p className="text-sm text-muted-foreground">Loading video...</p>
            </div>
          </div>
        )}

        {/* Local Video Indicator */}
        {isLocal && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              You
            </Badge>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center justify-center gap-2">
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

VideoDisplay.displayName = "VideoDisplay"

export { VideoDisplay }
