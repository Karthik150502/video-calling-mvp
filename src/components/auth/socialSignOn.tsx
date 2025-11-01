"use client"

import React from 'react'
import { Button } from '../bate/ui/button'
import { GoogleIcon } from '@/lib/icons'
import { googleSignIn } from '@/actions/auth/oauth/googleSignin'

export default function SocialSignOn() {

    return <div className='w-full flex flex-col items-start justify-center gap-2'>
        <p className='text-xs'>Try other ways to sign in</p>
        <div className='w-full flex items-center justify-center'>
            <Button className='w-full' type="button" variant={"outline"} onClick={googleSignIn}>
                <GoogleIcon />
                Google
            </Button>
        </div>
    </div>
}
