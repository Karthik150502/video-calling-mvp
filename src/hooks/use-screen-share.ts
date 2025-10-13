import { useState, useRef, useCallback } from 'react'

interface UseScreenShareProps {
  onScreenShareStart?: (stream: MediaStream) => void
  onScreenShareStop?: () => void
  onError?: (error: Error) => void
  replaceVideoTrack?: (track: MediaStreamTrack) => Promise<void>
}

export function useScreenShare({
  onScreenShareStart,
  onScreenShareStop,
  onError,
  replaceVideoTrack
}: UseScreenShareProps = {}) {
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null)

  const startScreenShare = useCallback(async () => {
    try {
      console.log('Starting screen share...')
      
      // Get screen share stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false // Set to true if you want to share system audio
      })

      const screenTrack = screenStream.getVideoTracks()[0]
      
      if (!screenTrack) {
        throw new Error('No video track found in screen share stream')
      }

      console.log('Screen share track obtained:', screenTrack.id)

      // Store the screen stream
      screenStreamRef.current = screenStream

      // Listen for when user stops sharing via browser UI
      screenTrack.onended = () => {
        console.log('Screen share ended by user')
        stopScreenShare()
      }

      // Replace video track in peer connections
      if (replaceVideoTrack) {
        await replaceVideoTrack(screenTrack)
      }

      setIsScreenSharing(true)
      
      if (onScreenShareStart) {
        onScreenShareStart(screenStream)
      }

      console.log('Screen share started successfully')
    } catch (error) {
      console.error('Error starting screen share:', error)
      
      if (error instanceof Error) {
        // User cancelled screen share
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          console.log('User cancelled screen share')
        } else {
          if (onError) onError(error)
        }
      }
      
      // Clean up on error
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop())
        screenStreamRef.current = null
      }
    }
  }, [replaceVideoTrack, onScreenShareStart, onError])

  const stopScreenShare = useCallback(async () => {
    console.log('Stopping screen share...')

    // Stop screen share tracks
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping screen track:', track.id)
        track.stop()
      })
      screenStreamRef.current = null
    }

    // Restore original video track
    if (originalVideoTrackRef.current && replaceVideoTrack) {
      console.log('Restoring original video track')
      await replaceVideoTrack(originalVideoTrackRef.current)
      originalVideoTrackRef.current = null
    }

    setIsScreenSharing(false)
    
    if (onScreenShareStop) {
      onScreenShareStop()
    }

    console.log('Screen share stopped')
  }, [replaceVideoTrack, onScreenShareStop])

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare()
    } else {
      await startScreenShare()
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare])

  // Store original video track before starting screen share
  const setOriginalVideoTrack = useCallback((track: MediaStreamTrack) => {
    originalVideoTrackRef.current = track
  }, [])

  return {
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    screenStream: screenStreamRef.current,
    setOriginalVideoTrack
  }
}