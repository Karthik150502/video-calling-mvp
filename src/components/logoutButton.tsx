"use client"
import React from 'react'
import { Button } from './ui/button'
import { signOut } from '@/actions/sign-out'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter();

    return <Button onClick={() => {
        signOut().then(() => {
            router.push("/")
        })
    }}>Logout</Button>
}
