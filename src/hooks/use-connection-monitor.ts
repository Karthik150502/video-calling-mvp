"use client"

import { useState, useEffect, useRef } from "react"

interface ConnectionMonitorProps {
  peerConnection: RTCPeerConnection | null
  onQualityChange?: (quality: "poor" | "fair" | "good" | "excellent") => void
}

export function useConnectionMonitor({ peerConnection, onQualityChange }: ConnectionMonitorProps) {
  const [connectionQuality, setConnectionQuality] = useState<"poor" | "fair" | "good" | "excellent">("good")
  const [stats, setStats] = useState<{
    bytesReceived: number
    bytesSent: number
    packetsLost: number
    roundTripTime: number
  }>({
    bytesReceived: 0,
    bytesSent: 0,
    packetsLost: 0,
    roundTripTime: 0,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!peerConnection) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const monitorConnection = async () => {
      try {
        const statsReport = await peerConnection.getStats()
        let bytesReceived = 0
        let bytesSent = 0
        let packetsLost = 0
        let roundTripTime = 0

        statsReport.forEach((report) => {
          if (report.type === "inbound-rtp" && report.mediaType === "video") {
            bytesReceived += report.bytesReceived || 0
            packetsLost += report.packetsLost || 0
          }
          if (report.type === "outbound-rtp" && report.mediaType === "video") {
            bytesSent += report.bytesSent || 0
          }
          if (report.type === "candidate-pair" && report.state === "succeeded") {
            roundTripTime = report.currentRoundTripTime || 0
          }
        })

        setStats({
          bytesReceived,
          bytesSent,
          packetsLost,
          roundTripTime,
        })

        // Determine connection quality based on stats
        let quality: "poor" | "fair" | "good" | "excellent" = "excellent"

        if (roundTripTime > 0.3 || packetsLost > 50) {
          quality = "poor"
        } else if (roundTripTime > 0.2 || packetsLost > 20) {
          quality = "fair"
        } else if (roundTripTime > 0.1 || packetsLost > 5) {
          quality = "good"
        }

        setConnectionQuality(quality)
        if (onQualityChange) {
          onQualityChange(quality)
        }
      } catch (error) {
        console.error("Error monitoring connection:", error)
      }
    }

    // Monitor every 2 seconds
    intervalRef.current = setInterval(monitorConnection, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [peerConnection, onQualityChange])

  return {
    connectionQuality,
    stats,
  }
}
