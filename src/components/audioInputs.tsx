"use client"

import * as React from "react"
import { CheckIcon, ChevronDown } from "lucide-react"

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


export function SettingsCombobox({
    items,
    activeItem,
    onSelect
}: {
    activeItem: string | undefined
    items: { value: string, label: string }[],
    onSelect: (deviceId: string) => void,
}) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-fit h-fit shadow-none text-xs md:text-sm justify-between text-wrap whitespace-normal"
                >
                    {activeItem
                        ? items.find((item) => item.value === activeItem)?.label
                        : "Select Audio Input..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="md:w-fit w-[90dvw] p-0">
                <Command>
                    {
                        items.length > 10 && <CommandInput placeholder="Search framework..." />
                    }
                    <CommandList>
                        <CommandEmpty>No Audio Device found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    className="text-xs md:text-sm"
                                    key={item.value}
                                    value={item.value}
                                    onSelect={(currentValue) => {
                                        setOpen(false)
                                        onSelect(currentValue)
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4 text-xs md:text-sm",
                                            activeItem === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}