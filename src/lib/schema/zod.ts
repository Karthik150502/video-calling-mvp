import { z } from "zod";

export const SignUpSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: "First name must be at least 2 characters" })
        .max(100, { message: "First name must be at most 100 characters" })
        .transform((s) => s.trim()),

    lastName: z
        .string()
        .max(100, { message: "Last name must be at most 100 characters" })
        .transform((s) => s.trim())
        .optional(),

    email: z
        .string()
        .email({ message: "Invalid email address" })
        .transform((s) => s.trim().toLowerCase()),

    password: z
        .string()
        .min(7, { message: "Password must be more than 6 characters" })
        .max(16, { message: "Password must be less than 16 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),

    confirmPassword: z
        .string()
        .min(7, { message: "Confirm Password must be more than 6 characters" })
        .max(16, { message: "Confirm Password must be less than 16 characters" })
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
}).strict();


export type SignUpType = z.infer<typeof SignUpSchema>;



export const LogingSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" })
        .transform((s) => s.trim().toLowerCase()),
    password: z
        .string()
        .min(1, { message: "Enter the password" }),
}).strict();


export type LoginType = z.infer<typeof LogingSchema>;
