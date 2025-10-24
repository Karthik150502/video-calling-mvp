import React from 'react'

export default function AuthLayoutPage({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='min-h-screen relative'>
            {children}
        </main>
    )
}
