"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import React from 'react'
import SignUpForm from './signUpForm';

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

            <Button
                variant={"link"}
                size={"sm"}
                onClick={scrollToLogin}>
                log in
            </Button>

        </CardFooter>
    </Card>
}