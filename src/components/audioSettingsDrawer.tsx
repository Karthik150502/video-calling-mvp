import React from 'react'
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
import { AudioInputs } from './audioInputs'


type AudioSettingsProps = {
    activeAudioInputId: string | undefined
    audioInputs: { value: string, label: string }[],
    onSelectAudioInput: (deviceId: string) => void,
    drawerTrigger: React.ReactNode,
}

export default function AudioSettingsDrawer({
    activeAudioInputId,
    audioInputs,
    onSelectAudioInput,
    drawerTrigger
}: AudioSettingsProps) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                {drawerTrigger}
            </DrawerTrigger>
            <DrawerContent className='w-full'>
                <div className="mx-auto w-full flex flex-col gap-4 items-center justify-center">
                    <DrawerHeader>
                        <DrawerTitle>Audio Settings</DrawerTitle>
                    </DrawerHeader>
                    <div className='md:max-w-fit w-full flex flex-col items-start justify-center gap-2 px-4'>
                        <div className='w-[90%] flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start gap-6'>
                            <p className='text-sm whitespace-nowrap'>Select Audio Device</p>
                            <AudioInputs
                                audioInputs={audioInputs}
                                activeAudioInputId={activeAudioInputId}
                                onSelect={onSelectAudioInput}
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
