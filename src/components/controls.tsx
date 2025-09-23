"use client";
import React, { RefObject, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Mic, MicOff, PhoneOff, Settings, Video, VideoOff } from 'lucide-react'
import AudioSettingsDrawer from './audioSettingsDrawer';

type ControlsProps = {
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    endCall: () => void,
    localStreamRef: RefObject<MediaStream | null>,
    setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setIsVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    replaceAudioTrackInPeerConnections: (newTrack: MediaStreamTrack) => Promise<void>
}

export default function CallControls({
    isVideoEnabled,
    isAudioEnabled,
    endCall,
    localStreamRef,
    setIsAudioEnabled,
    setIsVideoEnabled,
    replaceAudioTrackInPeerConnections
}: ControlsProps) {

    const [activeAudioDeviceId, setActiveAudioDeviceId] = useState<string | undefined>(undefined);
    const [availableAudioDivices, setAvailableAudioDevices] = useState<{ value: string, label: string }[]>([]);

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    // const switchAudioInput = async (deviceId: string) => {
    //     // Ask browser for new mic input
    //     const newStream = await navigator.mediaDevices.getUserMedia({
    //         audio: {
    //             deviceId: { exact: deviceId },
    //             echoCancellation: true,
    //             noiseSuppression: true,
    //         },
    //         video: false
    //     })
    //     // Grab the new audio track
    //     const newTrack = newStream.getAudioTracks()[0];
    //     setActiveAudioDeviceId(newTrack.getSettings().deviceId);
    //     if (localStreamRef.current) {
    //         // Remove the old track from local stream
    //         const oldTrack = localStreamRef.current.getAudioTracks()[0];
    //         if (oldTrack) {
    //             oldTrack.stop(); // stop the mic
    //             localStreamRef.current.removeTrack(oldTrack);
    //         }
    //         // Add the new track
    //         localStreamRef.current.addTrack(newTrack);
    //     }
    // }

    const switchAudioInput = async (deviceId: string) => {
        try {
            console.log('Switching to audio device:', deviceId);

            // Get new audio stream with the selected device
            const newAudioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: { exact: deviceId },
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
                await replaceAudioTrackInPeerConnections(newAudioTrack);

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
            setActiveAudioDeviceId(newAudioTrack.getSettings().deviceId);

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
    }


    useEffect(() => {
        enumerateDevices()

        navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);

        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
        }
    }, [])

    const enumerateDevices = () => {
        // Setting the active audio deviec Id.
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const track = stream.getAudioTracks()[0];
                const settings = track.getSettings();
                setActiveAudioDeviceId(settings.deviceId)
            });

        // Getting all the audio input devices
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const mics = devices.filter(d => {
                    return d.kind === "audioinput"
                    //  && d.deviceId !== "default" && d.deviceId !== "communications"
                }).map(device => ({
                    value: device.deviceId,
                    label: device.label,
                }));
                setAvailableAudioDevices(mics);
            });
    }


    return (
        <div className='w-[400px] p-4 flex items-center justify-center gap-4'>
            <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                onClick={toggleVideo}
                size={"lg"}
                className="rounded-full"
            >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button
                variant={isAudioEnabled ? "default" : "secondary"}
                onClick={toggleAudio}
                size={"lg"}
                className="rounded-full"
            >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <AudioSettingsDrawer
                audioInputs={availableAudioDivices}
                activeAudioInputId={activeAudioDeviceId}
                onSelectAudioInput={switchAudioInput}
                drawerTrigger={<Button size={"lg"} className='rounded-full'><Settings /></Button>}
            />
            <Button
                variant="destructive"
                onClick={endCall}
                size={"lg"}
                className="rounded-full">
                <PhoneOff className="w-5 h-5" />
                End Call
            </Button>
        </div>
    )
}
