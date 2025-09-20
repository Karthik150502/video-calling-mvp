"use client";
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { AudioInputs } from './audioInputs';

type ControlsProps = {
    isVideoEnabled: boolean,
    toggleVideo: () => void,
    isAudioEnabled: boolean,
    toggleAudio: () => void,
    endCall: () => void
}

export default function CallControls({
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    endCall
}: ControlsProps) {

    const [activeAudioDevideId, setActiveAudioDeviceId] = useState<string | undefined>(undefined);
    const [availableAudioDivices, setAvailableAudioDevices] = useState<{ value: string, label: string }[]>([]);
    const [openAudioInputs, setOpenAudioInputs] = useState<boolean>(false);

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({
            audio: { deviceId: "communications" }
        }).then(stream => {
            const track = stream.getAudioTracks()[0];
            const settings = track.getSettings();
            console.log("Real active deviceId:", settings.deviceId);
            setActiveAudioDeviceId(settings.deviceId)
        });

        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const mics = devices.filter(d => {
                    return d.kind === "audioinput" && d.deviceId !== "default" && d.deviceId !== "communications"
                }).map(device => ({
                    value: device.deviceId,
                    label: device.label,
                }));
                setAvailableAudioDevices(mics);
                console.log("Available microphones:", mics);
            });

    }, [])

    return (
        <div className='w-[400px] p-4 flex items-center justify-center gap-4'>
            <Button
                variant={isVideoEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="min-w-[60px]"
            >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button onClick={() => {
                setOpenAudioInputs(!openAudioInputs)
            }}>
                Open Audio Items
            </Button>

            {
                openAudioInputs && <AudioInputs
                    audioInputs={availableAudioDivices}
                    activeAudioInputId={activeAudioDevideId}
                    onSelect={toggleAudio}
                />
            }

            <Button
                variant={isAudioEnabled ? "default" : "secondary"}
                size="lg"
                onClick={toggleAudio}
                className="min-w-[60px]"
            >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>

            <Button variant="destructive" size="lg" onClick={endCall} className="px-6">
                <PhoneOff className="w-5 h-5 mr-2" />
                End Call
            </Button>
        </div>
    )
}
