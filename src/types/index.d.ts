import { JwtPayload } from '../middlewares/auth.middleware';

// Multer file interface
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      file?: MulterFile;
      files?: MulterFile[];
    }
  }
}

export {};
