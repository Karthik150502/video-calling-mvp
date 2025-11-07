"use client"
import { useAudioSettings } from "@/hooks/use-audio";
import { useAddtionalCallSettings } from "@/hooks/use-settings";
import { useVideoSettings } from "@/hooks/use-video";
import { DeviceType } from "@/types";
import React, { createContext, useContext, ReactNode, RefObject, useState } from "react";

interface UserCallSettingsType {
    activeAudioInput?: string | null,
    activeAudioOutput?: string | null,
    availableAudioInputs: DeviceType[],
    availableAudioOutputs: DeviceType[],
    switchAudioInput: (deviceId?: string) => Promise<void>,
    switchAudioOutput: (deviceId?: string) => Promise<void>,
    isAudioInputsLoading: boolean,
    activeVideoInput?: string | null,
    availableVideoInputs: DeviceType[],
    switchVideoInput: (deviceId: string) => Promise<void>,
    isVideoInputsLoading: boolean,
    setIsVideoEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    setIsAudioEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    toggleFullscreen: () => void,
    isFullscreen: boolean,
    showControls: boolean
}

const UserCallSettingsContext = createContext<UserCallSettingsType | null>(null);

type UserCallSettingsProviderProps = {
    localStreamRef: RefObject<MediaStream | null>,
    replaceAudioVideoTrackInPeerConnections: (newTrack: MediaStreamTrack, replaceAudio?: boolean) => Promise<void>,
    localVideoRef: RefObject<HTMLVideoElement | null>,
    remoteVideoRefs: RefObject<Map<string, HTMLVideoElement>>,
    children: ReactNode
}

export const UserCallSettingsProvider: React.FC<UserCallSettingsProviderProps> = ({
    children,
    replaceAudioVideoTrackInPeerConnections,
    localStreamRef,
    remoteVideoRefs,
    localVideoRef
}) => {

    const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
    const { toggleFullscreen, isFullscreen, showControls } = useAddtionalCallSettings();


    const {
        activeAudioInput,
        activeAudioOutput,
        availableAudioInputs,
        availableAudioOutputs,
        switchAudioInput,
        switchAudioOutput,
        isLoading: isAudioInputsLoading
    } = useAudioSettings({
        isAudioEnabled,
        replaceAudioVideoTrackInPeerConnections,
        localStreamRef,
        remoteVideoRefs,
        localVideoRef
    });
    const {
        activeVideoInput,
        availableVideoInputs,
        switchVideoInput,
        isLoading: isVideoInputsLoading
    } = useVideoSettings({
        isVideoEnabled,
        replaceAudioVideoTrackInPeerConnections,
        localStreamRef,
    });

    return (
        <UserCallSettingsContext.Provider value={{
            activeAudioInput,
            activeAudioOutput,
            availableAudioInputs,
            availableAudioOutputs,
            switchAudioInput,
            switchAudioOutput,
            isAudioInputsLoading,
            activeVideoInput,
            availableVideoInputs,
            switchVideoInput,
            isVideoInputsLoading,
            setIsAudioEnabled,
            setIsVideoEnabled,
            toggleFullscreen,
            isFullscreen,
            showControls
        }}>
            {children}
        </UserCallSettingsContext.Provider>
    );
};

export const useUserAudioVideo = (): UserCallSettingsType => {
    const context = useContext(UserCallSettingsContext);
    if (!context) throw new Error("useUserAudioVideo must be used within a UserAudioVideoProvider");
    return context;
};
