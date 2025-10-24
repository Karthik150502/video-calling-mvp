"use client"
import React, { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import SignUpComponent from './signComponent';
import LoginComponent from './loginComponent';

interface LoginComponentsProps {
    aasd?: boolean
}

export default function LoginComponents({ }: LoginComponentsProps) {
    const loginRef = useRef<HTMLDivElement>(null);
    const signUpRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const params = useSearchParams();

    const ssu = useRef<boolean>(params.get("ssu") === "true");

    const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
        if (containerRef.current && ref.current) {
            containerRef.current.scrollTo({
                left: ref.current.offsetLeft,
                behavior: "smooth",
            });
        }
    };

    useEffect(() => {
        if (ssu.current) {
            scrollToSection(signUpRef)
        }
    }, [])

    return (
        <div ref={containerRef} className='w-full min-h-screen relative flex flex-row items-start justify-start overflow-scroll no-scrollbar'>
            <div ref={loginRef} className='min-h-screen w-[100dvw] flex-shrink-0 flex flex-col items-center justify-center'>
                <LoginComponent scrollToSignUp={() => { scrollToSection(signUpRef) }} />
            </div>
            <div ref={signUpRef} className='min-h-screen w-[100dvw] flex-shrink-0 flex flex-col items-center justify-center py-5'>
                <SignUpComponent scrollToLogin={() => { scrollToSection(loginRef) }} />
            </div>
        </div>
    )
}
