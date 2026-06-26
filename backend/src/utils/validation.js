const { z } = require('zod');

// Cursor format: base64(json) encoding of { id, updatedAt }
// This ensures the cursor is opaque to clients but debuggable if needed.
const cursorSchema = z.string().min(1, 'Cursor cannot be empty');

const getProductsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1) return undefined;
      return Math.min(num, 100); // max 100 per page
    }),
  category: z.string().optional(),
  cursor: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(99999999.99)
    .optional(),
});

module.exports = {
  getProductsSchema,
  updateProductSchema,
  cursorSchema,
};