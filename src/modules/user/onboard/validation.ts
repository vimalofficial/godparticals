import { z } from 'zod';

export const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const completeOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase and a number'
    ),
});

export type SendOTPInput           = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput         = z.infer<typeof verifyOTPSchema>;
export type RefreshTokenInput      = z.infer<typeof refreshTokenSchema>;
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;