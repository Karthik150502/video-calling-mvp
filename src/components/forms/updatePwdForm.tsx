"use client"
import { UpdatePasswordSchema, UpdatePasswordType } from '@/lib/schema/zod';
import { EyeOff, Eye, LucideIcon } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/bate/ui/button';
import { FormError } from '@/components/forms/formError';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { FormSuccess } from '@/components/forms/formSuccess';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/actions/auth/updatePassword';
import { useActionHandler } from '@/hooks/use-handle-action';

export default function UpdatePasswordForm() {

    const [showPwd, setShowPwd] = useState<boolean>(false);
    const [showConfPwd, setShowConfPwd] = useState<boolean>(false);

    const pwdRef = useRef<LucideIcon>(EyeOff);
    const router = useRouter();
    const { handle, isPending, error, success } = useActionHandler<string>(updatePassword);


    const form = useForm<UpdatePasswordType>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (values: UpdatePasswordType) => {
        handle(values.password, () => {
            router.push("/auth/login")
        })
    };

    return <div>
        <FormSuccess message={success} />
        {!success && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='space-y-4 grid grid-cols-1 items-start'>
                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className='w-full bg-red h-full relative'>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder='••••••••'
                                                type={showPwd ? "text" : "password"}
                                            />
                                            <Button type="button" variant={"outline"} size={"icon"}
                                                onClick={() => {
                                                    setShowPwd(!showPwd)
                                                    pwdRef.current = showPwd ? EyeOff : Eye
                                                }}
                                                className='absolute right-0 top-0 rounded-tl-none rounded-bl-none group'
                                            >
                                                <pwdRef.current className='stroke-muted-foreground transition-colors duration-300 group-hover:stroke-primary_2' />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <div className='w-full flex items-center justify-start'>
                                        <p className='text-xs'><span className='underline cursor-pointer' onClick={() => { router.push("/auth/forgot-password") }}>forgot password?</span></p>
                                    </div>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='confirmPassword'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Retype Password</FormLabel>
                                    <FormControl>
                                        <div className='w-full bg-red h-full relative'>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                placeholder='••••••••'
                                                type={showConfPwd ? "text" : "password"}
                                            />
                                            <Button type="button" variant={"outline"} size={"icon"}
                                                onClick={() => {
                                                    setShowConfPwd(!showConfPwd)
                                                    pwdRef.current = showConfPwd ? EyeOff : Eye
                                                }}
                                                className='absolute right-0 top-0 rounded-tl-none rounded-bl-none group'
                                            >
                                                <pwdRef.current className='stroke-muted-foreground transition-colors duration-300 group-hover:stroke-primary_2' />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <div className='w-full flex items-center justify-start'>
                                        <p className='text-xs'><span className='underline cursor-pointer' onClick={() => { router.push("/auth/forgot-password") }}>forgot password?</span></p>
                                    </div>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <div className='w-full flex flex-col items-center justify-center gap-4'>
                        <Button isLoading={isPending} disabled={isPending} type='submit' className='w-full'>
                            Update Password
                        </Button>
                    </div>
                </form>
            </Form>
        )}
    </div>
}
