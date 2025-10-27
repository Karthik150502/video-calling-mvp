import AuthWatcher from '@/components/auth/authWatcher';
import React from 'react'

export default function ProtectedLayoutPage({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='min-h-screen relative flex items-center justify-center'>
            <AuthWatcher />
            {children}
        </main>
    )
}
