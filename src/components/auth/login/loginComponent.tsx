"use client";
import { Button } from '@/components/ui/button';
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
            <Button
                variant={"link"}
                size={"sm"}
                onClick={scrollToSignUp}>
                Sign Up
            </Button>
        </CardFooter>
    </Card>
}