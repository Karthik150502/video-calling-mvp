"use client";
import React, { RefObject } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
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
    triggerElement: React.ReactNode,
}

export default function CallSettingsDrawer({
    isVideoEnabled,
    isAudioEnabled,
    localStreamRef,
    replaceAudioVideoTrackInPeerConnections,
    localVideoRef,
    remoteVideoRefs,
    triggerElement
}: CallSettingsProps) {


    const {
        activeAudioInput,
        availableAudioOutputs,
        availableAudioInputs,
        activeAudioOutput,
        switchAudioInput,
        switchAudioOutput,
        isLoading: isAudioLoading
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
        isLoading: isVideoLoading
    } = useVideoSettings({
        isVideoEnabled,
        localStreamRef,
        replaceAudioVideoTrackInPeerConnections
    })

    return (
        <Drawer>
            <TooltipWrapper
                label='More Settings'
                element={<DrawerTrigger asChild>
                    {triggerElement}
                </DrawerTrigger>}
            />
            <DrawerContent className='w-full'>
                <div className="mx-auto w-full md:w-5xl flex flex-col gap-4 items-center justify-center px-4">
                    <DrawerHeader className='w-full'>
                        <DrawerTitle>More Settings</DrawerTitle>
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
                            isLoading={isAudioLoading}
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
                            isLoading={isAudioLoading}
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
                            isLoading={isVideoLoading}
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
