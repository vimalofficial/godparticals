import { Request, Response } from 'express';
import { userOnboardService } from './service';
import {
  sendOTPSchema,
  verifyOTPSchema,
  refreshTokenSchema,
  completeOnboardingSchema,
} from './validation';

const ok  = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const onboardController = {
  // POST /send-otp
  sendOTP: async (req: Request, res: Response): Promise<void> => {
    const parsed = sendOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await userOnboardService.sendOTP(parsed.data.email, parsed.data.name);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to send OTP');
    }
  },

  // POST /verify-otp
  verifyOTP: async (req: Request, res: Response): Promise<void> => {
    const parsed = verifyOTPSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await userOnboardService.verifyOTP(parsed.data.email, parsed.data.otp);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'OTP verification failed', 401);
    }
  },

  // POST /refresh-token
  refreshToken: async (req: Request, res: Response): Promise<void> => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await userOnboardService.refreshToken(parsed.data.refreshToken);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Token refresh failed', 401);
    }
  },

  // POST /complete-onboarding  [protected]
  completeOnboarding: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }

    const parsed = completeOnboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await userOnboardService.completeOnboarding(userId, parsed.data);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Onboarding failed');
    }
  },

  // GET /profile  [protected]
  getProfile: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await userOnboardService.getProfile(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch profile');
    }
  },

  // POST /logout  [protected]
  logout: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await userOnboardService.logout(userId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Logout failed');
    }
  },
};