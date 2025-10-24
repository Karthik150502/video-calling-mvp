"use client"
import React from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

export default function LoginButton() {
    const router = useRouter();

    return <div className='flex items-center justify-center gap-4'>
        <Button onClick={() => {
            router.push("/auth/login")
        }}>
            Login
        </Button>

        <Button onClick={() => {
            router.push("/auth/login?ssu=true")
        }}>
            Sign Up
        </Button>
    </div>
}
