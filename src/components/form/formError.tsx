import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
    message?: string;
}

export function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <div className='bg-destructive/15 dark:bg-destructive/30 p-3 rounded-md flex items-center space-x-2 text-xs md:text-sm text-destructive dark:text-red-400'>
            <div className='w-4 h-4'>
                <AlertCircle className='font-bold h-4 w-4' />
            </div>
            <p className='text-xs font-bold'>{message}</p>
        </div>
    );
}
