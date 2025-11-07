"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import React from 'react'
import SignUpForm from '../forms/signUpForm';

type SignUpComponentProps = {
    scrollToLogin: () => void
};

export default function SignUpComponent({ scrollToLogin }: SignUpComponentProps) {
    return <Card className='shadow-2xs'>
        <CardHeader>
            <p className='font-bold'>
                Register to Bate.io
            </p>
        </CardHeader>
        <CardContent className='w-[90dvw] sm:w-[700px]'>
            <SignUpForm />
        </CardContent>
        <CardDescription>

        </CardDescription>
        <CardFooter>
            <p className='text-xs'>Already have an account? <span className='underline cursor-pointer' onClick={scrollToLogin}>log in</span></p>
        </CardFooter>
    </Card>
}