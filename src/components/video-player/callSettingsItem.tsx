import React from 'react'
import { SettingsCombobox } from './audioInputs'

export default function CallSettingsItem({
    activeItem,
    items,
    onSelect,
    label,
    emptyCommandLabel,
    searchInputLabel,
    selectItemLabel,
    isLoading
}: {
    activeItem: string | undefined
    items: { value: string, label: string }[],
    onSelect: (deviceId: string) => void,
    label: string,
    emptyCommandLabel: string,
    searchInputLabel: string,
    selectItemLabel: string,
    isLoading?: boolean
}) {
    return <div className='w-full flex flex-col md:flex-row items-start md:items-center justify-center md:justify-between md:gap-6 gap-2'>
        <p className='text-xs md:text-sm whitespace-nowrap'>{label}</p>
        <SettingsCombobox
            items={items}
            activeItem={activeItem}
            onSelect={onSelect}
            emptyCommandLabel={emptyCommandLabel}
            searchInputLabel={searchInputLabel}
            selectItemLabel={selectItemLabel}
            isLoading={isLoading}
        />
    </div>
}
