import { z } from "zod";

export const SignUpSchema = z.object({
    firstName: z
        .string()
        .min(2, { error: "First name must be at least 2 characters" })
        .max(100, { error: "First name must be at most 100 characters" })
        .transform((s) => s.trim()),

    lastName: z
        .string()
        .max(100, { error: "Last name must be at most 100 characters" })
        .transform((s) => s.trim())
        .optional(),

    email: z
        .string()
        .email({ error: "Invalid email address" })
        .transform((s) => s.trim().toLowerCase()),

    password: z
        .string()
        .min(7, { error: "Password must be more than 6 characters" })
        .max(16, { error: "Password must be less than 16 characters" })
        .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { error: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { error: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { error: "Password must contain at least one special character" }),

    confirmPassword: z
        .string()
        .min(7, { error: "Confirm Password must be more than 6 characters" })
        .max(16, { error: "Confirm Password must be less than 16 characters" })
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
}).strict();


export type SignUpType = z.infer<typeof SignUpSchema>;



export const LogingSchema = z.object({
    email: z
        .string()
        .email({ error: "Invalid email address" })
        .transform((s) => s.trim().toLowerCase()),
    password: z
        .string()
        .min(1, { error: "Enter the password" }),
}).strict();


export type LoginType = z.infer<typeof LogingSchema>;



export const EmailSchema = z.object({
    email: z
        .string()
        .email({ error: "Invalid email address" })
        .transform((s) => s.trim().toLowerCase())
}).strict();


export type EmaiLType = z.infer<typeof EmailSchema>;

export const UpdatePasswordSchema = z.object({
    password: z
        .string()
        .min(7, { error: "Password must be more than 6 characters" })
        .max(16, { error: "Password must be less than 16 characters" })
        .regex(/[A-Z]/, { error: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { error: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { error: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { error: "Password must contain at least one special character" }),

    confirmPassword: z
        .string()
        .min(7, { error: "Confirm Password must be more than 6 characters" })
        .max(16, { error: "Confirm Password must be less than 16 characters" })
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match",
}).strict();



export type UpdatePasswordType = z.infer<typeof UpdatePasswordSchema>;