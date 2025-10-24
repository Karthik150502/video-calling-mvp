import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assertEnvVariable(name: string) {
  const envVar = process.env[name]
  if (!envVar) throw new Error(`Environment variable: "${name}" not defined`);
  return envVar;
}