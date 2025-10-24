"use client"
import { SignUpSchema, SignUpType } from '@/lib/schema/zod';
import { EyeOff, Eye, Loader2, LucideIcon } from 'lucide-react';
import React, { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/form/formError';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { FormSuccess } from '@/components/form/formSuccess';
import { Input } from '@/components/ui/input';
import { signUp } from '@/actions/sign-up';

export default function SignUpForm() {

    const [error, setError] = useState<string | undefined>('');
    const [success, setSuccess] = useState<string | undefined>('');
    const [showConfPwd, setShowConfPwd] = useState<boolean>(false)
    const pwdConfRef = useRef<LucideIcon>(EyeOff);
    const [showPwd, setShowPwd] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition();
    const pwdRef = useRef<LucideIcon>(EyeOff);

    const form = useForm<SignUpType>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: ""
        }
    });

    const onSubmit = (values: SignUpType) => {
        setError('');
        setSuccess('');

        startTransition(() => {
            signUp(values).then((data) => {
                if (data.user) {
                    setSuccess("Successfully signed up.");
                }
                if (data.error) {
                    setError(data.error);
                }
            })
        });
    };

    return <div>
        <FormSuccess message={success} />
        {!success && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='space-y-4 grid grid-cols-1 lg:grid-cols-2 lg:gap-4 items-start'>
                        <FormField
                            control={form.control}
                            name='firstName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder='Steve'
                                            type='text'
                                            autoComplete="name"
                                        />
                                    </FormControl>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='lastName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder='Rogers'
                                            type='text'
                                            autoComplete="family-name"
                                        />
                                    </FormControl>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder='steverogers115@domain.com'
                                            type='email'
                                            autoComplete='email'
                                        />
                                    </FormControl>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
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
                                    <FormLabel>Confirm Password</FormLabel>
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
                                                    pwdConfRef.current = showConfPwd ? EyeOff : Eye
                                                }}
                                                className='absolute right-0 top-0 rounded-tl-none rounded-bl-none group'
                                            >
                                                <pwdConfRef.current className='stroke-muted-foreground transition-colors duration-300 group-hover:stroke-primary_2' />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <div className='w-full flex items-center justify-end'>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <Button disabled={isPending} type='submit' className='w-full'>
                        {isPending && (
                            <>
                                <Loader2 className='animate-spin mr-2' size={18} />
                                Creating...
                            </>
                        )}
                        {!isPending && <>Register</>}
                    </Button>
                </form>
            </Form>
        )}
    </div>
}
