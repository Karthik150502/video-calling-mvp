"use client";
import React, { RefObject, useCallback, useEffect, useState } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { SettingsCombobox } from './audioInputs';


type AudioSettingsProps = {
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    localStreamRef: RefObject<MediaStream | null>,
    replaceAudioTrackInPeerConnections: (newTrack: MediaStreamTrack) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>
    drawerTrigger: React.ReactNode,
}

type DeviceType = { value: string, label: string }

export default function AudioSettingsDrawer({
    isVideoEnabled,
    isAudioEnabled,
    localStreamRef,
    replaceAudioTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
    drawerTrigger
}: AudioSettingsProps) {

    const [activeAudioInput, setActiveAudioInput] = useState<string | undefined>(undefined);
    const [activeAudioOutput, setActiveAudioOutput] = useState<string | undefined>(undefined);
    const [availableAudioInputs, setAvailableAudioInputs] = useState<DeviceType[]>([]);
    const [availableAudioOutputs, setAvailableAudioOutputs] = useState<DeviceType[]>([]);

    const switchAudioOutput = useCallback(async (deviceId?: string) => {
        const finalDeviceId = deviceId ?? "communications";
        if (localVideoRef.current) {
            localVideoRef.current.setSinkId(finalDeviceId)
            setActiveAudioOutput(finalDeviceId)
        }
        remoteVideoRefs.current.entries().forEach(([id, videoRef]) => {
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
    }, [isAudioEnabled, localStreamRef, replaceAudioTrackInPeerConnections])

    const enumerateDevices = useCallback(async () => {
        navigator.mediaDevices.enumerateDevices()
            .then(async (devices) => {
                const inputs: DeviceType[] = [];
                const outputs: DeviceType[] = [];
                for (let i = 0; i < devices.length; i++) {
                    const device = devices[i];
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
            });


        // Activate the "communications" devices
        await switchAudioInput();
        await switchAudioOutput();
    }, [switchAudioInput, switchAudioOutput])

    useEffect(() => {
        enumerateDevices()

        navigator.mediaDevices.addEventListener("devicechange", enumerateDevices);
        return () => {
            navigator.mediaDevices.removeEventListener("devicechange", enumerateDevices);
        }
    }, [enumerateDevices])


    return (
        <Drawer>
            <DrawerTrigger asChild>
                {drawerTrigger}
            </DrawerTrigger>
            <DrawerContent className='w-full'>
                <div className="mx-auto w-full flex flex-col gap-4 items-center justify-center">
                    <DrawerHeader className='w-full'>
                        <DrawerTitle>Audio Settings</DrawerTitle>
                    </DrawerHeader>
                    <div className='w-full flex flex-col items-center justify-center gap-2 px-4'>
                        <div className='w-[90%] flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start md:gap-6 gap-2'>
                            <p className='text-xs md:text-sm whitespace-nowrap'>Select Audio Input</p>
                            <SettingsCombobox
                                items={availableAudioInputs}
                                activeItem={activeAudioInput}
                                onSelect={switchAudioInput}
                            />
                        </div>
                        <div className='w-[90%] flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start md:gap-6 gap-2'>
                            <p className='text-xs md:text-sm whitespace-nowrap'>Select Audio Output</p>
                            <SettingsCombobox
                                items={availableAudioOutputs}
                                activeItem={activeAudioOutput}
                                onSelect={switchAudioOutput}
                            />
                        </div>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
