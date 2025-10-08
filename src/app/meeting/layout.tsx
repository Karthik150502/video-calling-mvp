import React from 'react'

export default function MeetingLayoutPage({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='min-h-screen relative flex items-center justify-center'>
            {children}
        </main>
    )
}
