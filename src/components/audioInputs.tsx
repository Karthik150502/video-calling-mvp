"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export function AudioInputs({
    audioInputs,
    activeAudioInputId,
    onSelect
}: {
    activeAudioInputId: string | undefined
    audioInputs: { value: string, label: string }[],
    onSelect: (deviceId: string) => void
}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(activeAudioInputId)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? audioInputs.find((audioInput) => audioInput.value === value)?.label
                        : "Select framework..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                        <CommandEmpty>No Audio Device found.</CommandEmpty>
                        <CommandGroup>
                            {audioInputs.map((audioInput) => (
                                <CommandItem
                                    key={audioInput.value}
                                    value={audioInput.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue)
                                        setOpen(false)
                                        onSelect(currentValue)
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === audioInput.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {audioInput.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}