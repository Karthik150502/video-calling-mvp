"use client";
import { RefObject, useCallback, useEffect, useState } from "react";

type UseAudioSettingsProps = {
    isAudioEnabled: boolean,
    localStreamRef: RefObject<MediaStream | null>,
    replaceAudioVideoTrackInPeerConnections: (newTrack: MediaStreamTrack, replaceAudio?: boolean) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>
}


type DeviceType = { value: string, label: string }


export function useAudioSettings({
    isAudioEnabled,
    localStreamRef,
    replaceAudioVideoTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
}: UseAudioSettingsProps) {

    const [activeAudioInput, setActiveAudioInput] = useState<string | undefined>(undefined);
    const [activeAudioOutput, setActiveAudioOutput] = useState<string | undefined>(undefined);
    const [availableAudioInputs, setAvailableAudioInputs] = useState<DeviceType[]>([]);
    const [availableAudioOutputs, setAvailableAudioOutputs] = useState<DeviceType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const switchAudioOutput = useCallback(async (deviceId?: string) => {
        const finalDeviceId = deviceId ?? "communications";
        if (localVideoRef.current) {
            localVideoRef.current.setSinkId(finalDeviceId)
            setActiveAudioOutput(finalDeviceId)
        }
        remoteVideoRefs.current.entries().forEach(([_, videoRef]) => {
            if (videoRef) {
                videoRef.setSinkId(finalDeviceId)
            }
        })
    }, [localVideoRef, remoteVideoRefs])

    const switchAudioInput = useCallback(async (deviceId?: string) => {
        try {
            console.log('Switching to audio device:', deviceId);
            // Get new audio stream with the selected device
            const newAudioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId ?? "communications" },
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000
                },
                video: false
            });

            const newAudioTrack = newAudioStream.getAudioTracks()[0];

            if (!newAudioTrack) {
                console.error('Failed to get new audio track');
                return;
            }

            console.log('New audio track settings:', newAudioTrack.getSettings());

            // Set the enabled state to match current audio state
            newAudioTrack.enabled = isAudioEnabled;

            if (localStreamRef.current) {
                // Get reference to old track before replacing
                const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];

                // Replace in peer connections FIRST (before updating local stream)
                await replaceAudioVideoTrackInPeerConnections(newAudioTrack);

                // Now update local stream
                if (oldAudioTrack) {
                    console.log('Removing old audio track from local stream');
                    localStreamRef.current.removeTrack(oldAudioTrack);
                    oldAudioTrack.stop();
                }

                // Add new audio track to local stream
                localStreamRef.current.addTrack(newAudioTrack);

                console.log('Local stream updated with new audio track');
                console.log('Local stream tracks:', localStreamRef.current.getTracks().map(t => `${t.kind}: ${t.label}`));
            }

            // Update active device ID
            setActiveAudioInput(newAudioTrack.getSettings().deviceId);

            // Clean up the temporary stream
            newAudioStream.getAudioTracks().forEach(track => {
                if (track !== newAudioTrack) {
                    track.stop();
                }
            });

            console.log('Audio input switch completed successfully');

        } catch (error) {
            console.error('Error switching audio input:', error);

            // Show user-friendly error message
            if (error instanceof Error) {
                if (error.name === 'NotFoundError') {
                    console.error('Selected audio device not found');
                } else if (error.name === 'NotAllowedError') {
                    console.error('Permission denied for audio device');
                } else if (error.name === 'NotReadableError') {
                    console.error('Audio device is in use by another application');
                }
            }
        }
    }, [isAudioEnabled, localStreamRef, replaceAudioVideoTrackInPeerConnections])

    const enumerateDevices = useCallback(async () => {
        try {
            setIsLoading(true)
            const enumeratedDevices = await navigator.mediaDevices.enumerateDevices()
            const inputs: DeviceType[] = [];
            const outputs: DeviceType[] = [];
            for (let i = 0; i < enumeratedDevices.length; i++) {
                const device = enumeratedDevices[i];
                if (device.kind === "audioinput") {
                    inputs.push({
                        label: device.label,
                        value: device.deviceId
                    })
                }
                if (device.kind === "audiooutput") {
                    outputs.push({
                        label: device.label,
                        value: device.deviceId
                    })
                }
            }
            setAvailableAudioInputs(inputs);
            setAvailableAudioOutputs(outputs);

            // Activate the "communications" devices
            await switchAudioOutput();
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }

    }, [switchAudioOutput])


    const handleAudioInput = useCallback(async () => {
        console.log("Changing Audio Input")
        await enumerateDevices()
        const device = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000
            },
            video: false
        })
        const audioTrack = device.getAudioTracks()[0]
        await switchAudioInput(audioTrack.getSettings().deviceId);
    }, [switchAudioInput, enumerateDevices])

    useEffect(() => {
        handleAudioInput()

        navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
        }
    }, [])

    return {
        activeAudioInput,
        activeAudioOutput,
        availableAudioInputs,
        availableAudioOutputs,
        switchAudioInput,
        switchAudioOutput,
        isLoading
    }

}