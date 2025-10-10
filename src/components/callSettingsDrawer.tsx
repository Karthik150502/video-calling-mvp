"use client";
import React, { RefObject } from 'react'
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
import CallSettingsItem from './callSettingsItem';
import TooltipWrapper from './tooltipWrapper';
import { Separator } from '@radix-ui/react-separator';
import { useAudioSettings } from '@/hooks/use-audio';
import { useVideoSettings } from '@/hooks/use-video';

type CallSettingsProps = {
    isVideoEnabled: boolean,
    isAudioEnabled: boolean,
    localStreamRef: RefObject<MediaStream | null>,
    replaceAudioVideoTrackInPeerConnections: (newTrack: MediaStreamTrack) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>
    drawerTrigger: React.ReactNode,
}

export default function CallSettingsDrawer({
    isVideoEnabled,
    isAudioEnabled,
    localStreamRef,
    replaceAudioVideoTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
    drawerTrigger
}: CallSettingsProps) {


    const {
        activeAudioInput,
        availableAudioOutputs,
        availableAudioInputs,
        activeAudioOutput,
        switchAudioInput,
        switchAudioOutput
    } = useAudioSettings({
        isAudioEnabled,
        localStreamRef,
        replaceAudioVideoTrackInPeerConnections,
        localVideoRef,
        remoteVideoRefs,
    })

    const {
        activeVideoInput,
        availableVideoInputs,
        switchVideoInput,
    } = useVideoSettings({
        isVideoEnabled,
        localStreamRef,
        replaceAudioVideoTrackInPeerConnections
    })

    return (
        <Drawer>
            <TooltipWrapper label='More Settings'>
                <DrawerTrigger asChild>
                    {drawerTrigger}
                </DrawerTrigger>
            </TooltipWrapper>
            <DrawerContent className='w-full'>
                <div className="mx-auto w-full md:w-5xl flex flex-col gap-4 items-center justify-center px-4">
                    <DrawerHeader className='w-full'>
                        <DrawerTitle>Audio Settings</DrawerTitle>
                    </DrawerHeader>
                    <div className='w-full flex flex-col items-center justify-center gap-2'>
                        <CallSettingsItem
                            items={availableAudioInputs}
                            activeItem={activeAudioInput}
                            onSelect={switchAudioInput}
                            label="Audio Input"
                            emptyCommandLabel={"No Audio Device found."}
                            searchInputLabel={"Select Audio Input"}
                            selectItemLabel={"Select Audio Input"}
                        />
                        <Separator />
                        <CallSettingsItem
                            items={availableAudioOutputs}
                            activeItem={activeAudioOutput}
                            onSelect={switchAudioOutput}
                            label="Audio Output"
                            emptyCommandLabel={"No Audio Device found."}
                            searchInputLabel={"Select Audio Ouput"}
                            selectItemLabel={"Select Audio Ouput"}
                        />
                        <Separator />
                        <CallSettingsItem
                            items={availableVideoInputs}
                            activeItem={activeVideoInput}
                            onSelect={switchVideoInput}
                            label="Video Input"
                            emptyCommandLabel={"No Video Device found."}
                            searchInputLabel={"Select Video Input"}
                            selectItemLabel={"Select Video Input"}
                        />
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer >
    )
}
