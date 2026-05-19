import { Request, Response } from 'express';
import { adminOnboardService } from './service';
import {
  addAdminSchema,
  adminSignInSchema,
  refreshTokenSchema,
} from './validation';

const ok   = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message });

export const adminOnboardController = {
  // POST /add-admin  [protected — admin only]
  addAdmin: async (req: Request, res: Response): Promise<void> => {
    const parsed = addAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await adminOnboardService.addAdmin(parsed.data);
      ok(res, result, 201);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to create admin');
    }
  },

  // POST /sign-in  [public]
  signIn: async (req: Request, res: Response): Promise<void> => {
    const parsed = adminSignInSchema.safeParse(req.body);
    console.log(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      const result = await adminOnboardService.signIn(parsed.data.email, parsed.data.password);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Sign-in failed', 401);
    }
  },

  // POST /refresh-token  [public]
  refreshToken: async (req: Request, res: Response): Promise<void> => {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      fail(res, parsed.error.errors[0].message, 422);
      return;
    }
    try {
      // const result = await adminOnboardService.refreshToken(parsed.data.refreshToken);
      // ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Token refresh failed', 401);
    }
  },

  // GET /profile  [protected]
  getProfile: async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user?.id;
    if (!adminId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await adminOnboardService.getProfile(adminId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Failed to fetch profile');
    }
  },

  // POST /logout  [protected]
  logout: async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user?.id;
    if (!adminId) { fail(res, 'Unauthorized', 401); return; }
    try {
      const result = await adminOnboardService.logout(adminId);
      ok(res, result);
    } catch (e: unknown) {
      fail(res, e instanceof Error ? e.message : 'Logout failed');
    }
  },
};