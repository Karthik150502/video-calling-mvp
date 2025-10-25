"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import React from 'react'
import LoginForm from './loginForm';

type LoginComponentProps = {
    scrollToSignUp: () => void
};

export default function LoginComponent({ scrollToSignUp }: LoginComponentProps) {
    return <Card className='shadow-2xs'>
        <CardHeader>
            <p className='font-bold'>
                Login to Bate.io
            </p>
        </CardHeader>
        <CardContent className='w-[90dvw] sm:w-[400px]'>
            <LoginForm />
        </CardContent>
        <CardDescription>

        </CardDescription>
        <CardFooter>
            <p className='text-xs'>Don&apos;t have an account? register <span className='underline cursor-pointer' onClick={scrollToSignUp}>here</span></p>
        </CardFooter>
    </Card>
}