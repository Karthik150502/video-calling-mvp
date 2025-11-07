"use client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import React from 'react'
import UpdatePasswordForm from '../forms/updatePwdForm';

export default function UpdatePasswordComponent() {
    return <Card className='shadow-2xs'>
        <CardHeader>
            <p className='font-bold'>
                Update Passwword
            </p>
        </CardHeader>
        <CardContent className='w-[90dvw] sm:w-[400px]'>
            <UpdatePasswordForm />
        </CardContent>
        <CardDescription>

        </CardDescription>
        <CardFooter>
        </CardFooter>
    </Card>
}