import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminRepository } from './repository';

const JWT_SECRET          = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN      = process.env.JWT_EXPIRES_IN ?? '7d';
const JWT_REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET!;
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';

// ── Token helpers ─────────────────────────────────────────────────────────────
const makeAccessToken = (id: string, role: string) =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

const makeRefreshToken = (id: string) =>
  jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'] });

// ── Service ───────────────────────────────────────────────────────────────────
export const adminOnboardService = {
  // Called by an existing authenticated admin to create another admin
  addAdmin: async (data: { name: string; email: string; password: string }) => {
    const existing = await adminRepository.findByEmail(data.email);
    if (existing) throw new Error('An admin with this email already exists.');

    console.log(data.password);
    const hashed = await bcrypt.hash(data.password, 12);
    const admin  = await adminRepository.createAdmin({ ...data, password: hashed });

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };
  },

  // Admin signs in with email + password (no OTP)
  signIn: async (email: string, password: string) => {
    const admin = await adminRepository.findByEmail(email);

     console.log(admin);
  console.log(password);
  console.log(admin?.password);

    console.log(admin?.password,'vmlvml');
    
    if (!admin)          throw new Error('Invalid email or password.');
    if (!admin.isActive) throw new Error('This admin account is deactivated.');

    const match = await bcrypt.compare(password, admin.password);
    if (!match) throw new Error('Invalid email or password.');

    const accessToken  = makeAccessToken(admin.id, admin.role);
    const refreshToken = makeRefreshToken(admin.id);
    const hashed       = await bcrypt.hash(refreshToken, 10);

    await adminRepository.updateAdmin(admin.id, {
      // refreshToken: hashed,
      lastLoginAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    };
  },

  // refreshToken: async (token: string) => {
  //   let payload: { id: string };
  //   try {
  //     payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
  //   } catch {
  //     throw new Error('Invalid or expired refresh token.');
  //   }

  //   const admin = await adminRepository.findById(payload.id);
  //   if (!admin || !admin.refreshToken)
  //     throw new Error('Session not found. Please sign in again.');

  //   const match = await bcrypt.compare(token, admin.refreshToken);
  //   if (!match) throw new Error('Refresh token mismatch. Please sign in again.');

  //   const accessToken     = makeAccessToken(admin.id, admin.role);
  //   const newRefreshToken = makeRefreshToken(admin.id);
  //   const hashed          = await bcrypt.hash(newRefreshToken, 10);
  //   await adminRepository.updateAdmin(admin.id, { refreshToken: hashed });

  //   return { accessToken, refreshToken: newRefreshToken };
  // },
  

  getProfile: async (adminId: string) => {
    const admin = await adminRepository.findById(adminId);
    if (!admin) throw new Error('Admin not found.');
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  },

  logout: async (adminId: string) => {
    await adminRepository.clearRefreshToken(adminId);
    return { message: 'Logged out successfully.' };
  },
};