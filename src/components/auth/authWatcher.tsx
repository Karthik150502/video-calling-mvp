"use client"

import { useUser } from '@/hooks/use-user'

export default function AuthWatcher() {
    useUser();
    return null;
}
