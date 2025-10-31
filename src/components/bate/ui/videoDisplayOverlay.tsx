import React from 'react'

export default function VideoDisplayOverlay({
    overlayContent,
    label
}: {
    overlayContent: React.ReactNode,
    label?: string
}) {
    return <div className="absolute inset-0 bg-muted flex items-center justify-center">
        <div className="text-center">
            {overlayContent}
            {label && <p className="text-sm text-muted-foreground">{label}</p>}
        </div>
    </div>
}
