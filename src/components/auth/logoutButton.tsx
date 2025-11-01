"use client"
import React from 'react'
import { Button } from '../bate/ui/button'
import { signOut } from '@/actions/auth/sign-out'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter();

    return <Button variant={"destructive"} onClick={() => {
        signOut().then(() => {
            router.push("/")
        })
    }}>Logout</Button>
}
