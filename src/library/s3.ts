import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import path from 'path';

// ── Client (Supabase exposes an S3-compatible endpoint) ───────────────────────
const s3 = new S3Client({
  region: process.env.SUPABASE_REGION!,           // e.g. ap-south-1
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,    // https://<project>.supabase.co/storage/v1/s3
  credentials: {
    accessKeyId:     process.env.SUPABASE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,   // required for Supabase S3
});

const BUCKET = process.env.SUPABASE_BUCKET_NAME!;   // e.g. products

// ── Allowed image types ───────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB   = 5;

export interface UploadResult {
  url: string;       // public HTTP URL to store in DB
  key: string;       // object key (needed to delete later)
}

/**
 * Upload a product thumbnail to Supabase Storage (S3-compatible).
 * Returns the public URL and the storage key.
 */
export const uploadProductImage = async (
  file: Express.Multer.File
): Promise<UploadResult> => {
  // Validate mime type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: jpeg, png, webp, gif`);
  }

  // Validate file size
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`File too large. Max size is ${MAX_FILE_SIZE_MB}MB`);
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const key = `products/${uuid()}${ext}`;   // unique path inside bucket

  await s3.send(
    new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        file.buffer,
      ContentType: file.mimetype,
    })
  );

  // Supabase public URL format
  const url = `${process.env.SUPABASE_PUBLIC_URL}/storage/v1/object/public/${BUCKET}/${key}`;

  return { url, key };
};

/**
 * Delete a product image from Supabase Storage by its key.
 * Pass the key returned from uploadProductImage.
 */
export const deleteProductImage = async (key: string): Promise<void> => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key:    key,
    })
  );
};

/**
 * Extract the storage key from a full Supabase public URL.
 * Useful when you only have the URL stored in DB.
 */
export const extractKeyFromUrl = (url: string): string => {
  // URL pattern: .../storage/v1/object/public/<bucket>/<key>
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx    = url.indexOf(marker);
  if (idx === -1) throw new Error('Could not extract storage key from URL');
  return url.slice(idx + marker.length);
};

export default { uploadProductImage, deleteProductImage, extractKeyFromUrl };