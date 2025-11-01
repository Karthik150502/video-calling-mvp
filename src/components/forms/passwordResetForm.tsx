"use client"
import React from 'react'
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
import { EmailSchema, EmaiLType } from '@/lib/schema/zod';
import { resetPassword } from '@/actions/auth/resetPassword';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '../ui/card';
import { useActionHandler } from '@/hooks/use-handle-action';

export default function PasswordResetForm() {
  const { handle, isPending, error, success } = useActionHandler<string>(resetPassword);
  const form = useForm<EmaiLType>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = (values: EmaiLType) => {
    handle(values.email)
  };


  return <div>
    <Card className='shadow-2xs'>
      <CardHeader>
        <p className='font-bold'>
          Enter email
        </p>
      </CardHeader>
      <CardContent className='w-[90dvw] sm:w-[400px]'>
        <FormSuccess message={success} />
        {!success && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='space-y-4 grid grid-cols-1 items-start'>
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

              </div>
              <FormError message={error} />
              <div className='w-full flex flex-col items-center justify-center gap-4'>
                <Button isLoading={isPending} disabled={isPending} type='submit' className='w-full'>
                  Send Password Reset Link
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
      <CardDescription>

      </CardDescription>
      <CardFooter>

      </CardFooter>
    </Card>
  </div>
}
