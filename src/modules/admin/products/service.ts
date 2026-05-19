import slugify from 'slugify';
import { uploadProductImage, deleteProductImage, extractKeyFromUrl } from '../../../library/s3';
import { adminProductRepository } from './repository';
import { CreateProductInput, UpdateProductInput } from './validation';

export const adminProductService = {
  // ── CREATE ──────────────────────────────────────────────────────────────────
  createProduct: async (data: CreateProductInput, file: Express.Multer.File) => {
    // 1. Generate slug
    let slug = slugify(data.name, { lower: true, strict: true });

    // 2. Ensure slug is unique — append counter if needed
    const existing = await adminProductRepository.findBySlug(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    // 3. Upload image → get public URL
    const { url: thumbnail } = await uploadProductImage(file);

    // 4. Save to DB
    const product = await adminProductRepository.create({
      name:        data.name,
      slug,
      description: data.description,
      price:       data.price,
      stock:       data.stock,
      thumbnail,
      category:    data.category,
      isActive:    data.isActive ?? true,
    });

    return product;
  },

  // ── READ ALL ─────────────────────────────────────────────────────────────────
  getAllProducts: async () => {
    return adminProductRepository.findAll();
  },

  // ── READ ONE ─────────────────────────────────────────────────────────────────
  getProductById: async (id: string) => {
    const product = await adminProductRepository.findById(id);
    if (!product) throw new Error('Product not found.');
    return product;
  },

  // ── UPDATE ───────────────────────────────────────────────────────────────────
  updateProduct: async (
    id: string,
    data: UpdateProductInput,
    file?: Express.Multer.File
  ) => {
    const product = await adminProductRepository.findById(id);
    if (!product) throw new Error('Product not found.');

    const updateData: Parameters<typeof adminProductRepository.update>[1] = { ...data };

    // Re-generate slug if name changed
    if (data.name) {
      let slug = slugify(data.name, { lower: true, strict: true });
      const clash = await adminProductRepository.findBySlug(slug, id);
      if (clash) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }

    // Replace image if a new file was sent
    if (file) {
      // Delete old image from bucket
      try {
        const oldKey = extractKeyFromUrl(product.thumbnail);
        await deleteProductImage(oldKey);
      } catch {
        // Non-fatal — old file might not exist
      }

      const { url: thumbnail } = await uploadProductImage(file);
      updateData.thumbnail = thumbnail;
    }

    return adminProductRepository.update(id, updateData);
  },

  // ── DELETE (soft) ─────────────────────────────────────────────────────────
  deleteProduct: async (id: string) => {
    const product = await adminProductRepository.findById(id);
    if (!product) throw new Error('Product not found.');

    // // Delete image from bucket
    // try {
    //   const key = extractKeyFromUrl(product.thumbnail);
    //   await deleteProductImage(key);
    // } catch {
    //   // Non-fatal
    // }

    await adminProductRepository.softDelete(id);
    return { message: 'Product deleted successfully.' };
  },
};