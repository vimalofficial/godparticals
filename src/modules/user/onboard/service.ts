import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { generateOTP, sendOTPEmail } from '../../library/mail';

import { generateOTP, sendOTPEmail } from '../../../library/mail';

import { userRepository } from './repository';

// ── In-memory OTP store (swap with Redis in production) ───────────────────────
const otpStore = new Map<string, { otp: string; expiresAt: number; name?: string }>();

const JWT_SECRET          = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN ?? '7d';
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET!;
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
const OTP_EXPIRY_MINUTES  = parseInt(process.env.OTP_EXPIRY_MINUTES ?? '10', 10);

// ── Token helpers ─────────────────────────────────────────────────────────────
const makeAccessToken = (id: string, role: string) =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

const makeRefreshToken = (id: string) =>
  jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] });

// ── Service ───────────────────────────────────────────────────────────────────
export const userOnboardService = {
  sendOTP: async (email: string, name?: string) => {
    const otp       = generateOTP(6);
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    const existing = await userRepository.findByEmail(email);
    if (!existing) {
      await userRepository.createUser({ email, name });
    } else if (name && !existing.name) {
      await userRepository.updateUser(existing.id, { name });
    }

    otpStore.set(email, { otp, expiresAt, name });

    const sent = await sendOTPEmail(email, otp, name);
    if (!sent) throw new Error('Failed to send OTP email. Check SMTP config.');

    return { message: 'OTP sent successfully. Check your email.' };
  },

  verifyOTP: async (email: string, otp: string) => {
    const record = otpStore.get(email);
    if (!record)              throw new Error('OTP not found. Please request a new one.');
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      throw new Error('OTP has expired. Please request a new one.');
    }
    if (record.otp !== otp)  throw new Error('Invalid OTP.');

    otpStore.delete(email);

    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('User not found.');

    await userRepository.updateUser(user.id, { isVerified: true });

    const accessToken  = makeAccessToken(user.id, user.role);
    const refreshToken = makeRefreshToken(user.id);
    const hashed       = await bcrypt.hash(refreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: hashed });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  refreshToken: async (token: string) => {
    let payload: { id: string };
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    } catch {
      throw new Error('Invalid or expired refresh token.');
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.refreshToken)
      throw new Error('Session not found. Please log in again.');

    const match = await bcrypt.compare(token, user.refreshToken);
    if (!match) throw new Error('Refresh token mismatch. Please log in again.');

    const accessToken     = makeAccessToken(user.id, user.role);
    const newRefreshToken = makeRefreshToken(user.id);
    const hashed          = await bcrypt.hash(newRefreshToken, 10);
    await userRepository.updateUser(user.id, { refreshToken: hashed });

    return { accessToken, refreshToken: newRefreshToken };
  },

  completeOnboarding: async (userId: string, data: { name: string; password: string }) => {
    const hashed = await bcrypt.hash(data.password, 12);
    const user   = await userRepository.updateUser(userId, {
      name: data.name,
      password: hashed,
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };
  },

  getProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  },

  logout: async (userId: string) => {
    await userRepository.clearRefreshToken(userId);
    return { message: 'Logged out successfully.' };
  },
};