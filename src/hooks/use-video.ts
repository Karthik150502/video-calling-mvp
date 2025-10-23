"use client";
import { RefObject, useCallback, useEffect, useState } from "react";

type UseVideoSettingsProps = {
    isVideoEnabled: boolean,
    localStreamRef: RefObject<MediaStream | null>,
    replaceAudioVideoTrackInPeerConnections: (newTrack: MediaStreamTrack, replaceAudio?: boolean) => Promise<void>,
}


type DeviceType = { value: string, label: string }


export function useVideoSettings({
    isVideoEnabled,
    localStreamRef,
    replaceAudioVideoTrackInPeerConnections,
}: UseVideoSettingsProps) {

    const [activeVideoInput, setActiveVideoInput] = useState<string | undefined>(undefined);
    const [availableVideoInputs, setAvailableVideoInputs] = useState<DeviceType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const switchVideoInput = useCallback(async (deviceId: string) => {
        try {
            console.log('Switching to video device:', deviceId);
            // Get new video stream with the selected device
            const newVideoStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    deviceId: { exact: deviceId },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                }
            });

            const newVideoTrack = newVideoStream.getVideoTracks()[0];

            if (!newVideoTrack) {
                console.error('Failed to get new video track');
                return;
            }

            console.log('New video track settings:', newVideoTrack.getSettings());

            // Set the enabled state to match current video state
            newVideoTrack.enabled = isVideoEnabled;

            if (localStreamRef.current) {
                // Get reference to old track before replacing
                const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];

                // Replace in peer connections FIRST (before updating local stream)
                await replaceAudioVideoTrackInPeerConnections(newVideoTrack, false);

                // Now update local stream
                if (oldVideoTrack) {
                    console.log('Removing old video track from local stream');
                    localStreamRef.current.removeTrack(oldVideoTrack);
                    oldVideoTrack.stop();
                }

                // Add new video track to local stream
                localStreamRef.current.addTrack(newVideoTrack);

                console.log('Local stream updated with new video track');
                console.log('Local stream tracks:', localStreamRef.current.getTracks().map(t => `${t.kind}: ${t.label}`));
            }

            // Update active device ID
            setActiveVideoInput(newVideoTrack.getSettings().deviceId);

            // Clean up the temporary stream
            newVideoStream.getVideoTracks().forEach(track => {
                if (track !== newVideoTrack) {
                    track.stop();
                }
            });

            console.log('Video input switch completed successfully');

        } catch (error) {
            console.error('Error switching Video input:', error);

            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.name === 'NotFoundError') {
                    console.error('Selected Video device not found');
                } else if (error.name === 'NotAllowedError') {
                    console.error('Permission denied for Video device');
                } else if (error.name === 'NotReadableError') {
                    console.error('Video device is in use by another application');
                }
            }
        }
    }, [isVideoEnabled, localStreamRef, replaceAudioVideoTrackInPeerConnections])

    const enumerateDevices = useCallback(async () => {
        try {
            setIsLoading(true);
            const enumeratedDevices = await navigator.mediaDevices.enumerateDevices()
            console.log({
                enumeratedDevices
            })
            const inputs: DeviceType[] = [];
            const outputs: DeviceType[] = [];
            for (let i = 0; i < enumeratedDevices.length; i++) {
                const device = enumeratedDevices[i];
                if (device.kind === "videoinput") {
                    inputs.push({
                        label: device.label,
                        value: device.deviceId
                    })
                }
                if (device.kind === "videoinput") {
                    outputs.push({
                        label: device.label,
                        value: device.deviceId
                    })
                }
            }
            setAvailableVideoInputs(inputs);
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false);
        }
    }, [])


    const handleVideoInput = useCallback(async () => {
        console.log("Changing Video Input")
        await enumerateDevices()
        const device = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000
            }
        })
        const videoTrack = device.getVideoTracks()[0]
        if (videoTrack.getSettings().deviceId) {
            await switchVideoInput(videoTrack.getSettings().deviceId!);
        }
    }, [switchVideoInput, enumerateDevices])

    useEffect(() => {
        handleVideoInput()

        navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
        }
    }, [])

    return {
        activeVideoInput,
        availableVideoInputs,
        switchVideoInput,
        isLoading
    }

}