import { z } from 'zod';

export const signUpSchema = z.object({
  username: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(255),
  confirmPassword: z.string().min(6).max(255),
});

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6).max(255),
  confirmPassword: z.string().min(6).max(255),
});