/**
 * Seed Script — Generates 200,000 products efficiently.
 *
 * Strategy:
 * - Pre-generate all product data in memory as arrays of objects.
 * - Use Prisma's createMany() which translates to a single INSERT with
 *   multiple value rows: INSERT INTO products (...) VALUES (...), (...), ...
 * - Batch size of 5,000 per createMany call to balance memory usage vs speed.
 * - Use realistic categories with weighted distribution.
 * - Use @faker-js/faker for realistic names and prices.
 *
 * Performance expectation: ~15-30 seconds for 200K rows on a local machine
 * with SSD. This is approximately 6,000-13,000 inserts/second.
 *
 * Without batching (one row at a time): would take 5-10 minutes due to
 * network round-trips for each row.
 */

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

const BATCH_SIZE = 5000;
const TOTAL_PRODUCTS = 200_000;

// Realistic product categories
const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Health & Beauty',
  'Office Supplies',
  'Groceries',
];

// Weighted distribution for categories (some are more common)
const CATEGORY_WEIGHTS = [0.20, 0.15, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.04, 0.03];

/**
 * Pick a category using weighted random selection.
 */
function pickCategory() {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    cumulative += CATEGORY_WEIGHTS[i];
    if (rand < cumulative) return CATEGORIES[i];
  }
  return CATEGORIES[CATEGORIES.length - 1];
}

/**
 * Generate a batch of products.
 * We use faker for realistic names and prices, but generate timestamps
 * that are spread across the last 90 days to simulate real data.
 */
function generateBatch(startIndex, count) {
  const products = [];
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    // Generate a created_at timestamp spread across the last 90 days
    const createdAt = new Date(now - Math.random() * ninetyDaysMs);
    // updated_at is slightly after created_at, or same for new products
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);

    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category: pickCategory(),
      price: parseFloat(faker.commerce.price({ min: 0.99, max: 9999.99, dec: 2 })),
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
  }
  return products;
}

async function main() {
  console.log(`[Seed] Starting generation of ${TOTAL_PRODUCTS.toLocaleString()} products...`);
  console.log(`[Seed] Batch size: ${BATCH_SIZE}`);
  console.log(`[Seed] Categories: ${CATEGORIES.join(', ')}`);
  console.log('');

  // Verify database connection
  await prisma.$connect();
  console.log('[Seed] Connected to database');

  // Clear existing products (idempotent)
  console.log('[Seed] Clearing existing products...');
  await prisma.product.deleteMany();
  console.log('[Seed] Existing products cleared');

  const startTime = Date.now();
  let totalInserted = 0;

  // Pre-compute all batches
  const batches = Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE);

  for (let batch = 0; batch < batches; batch++) {
    const remaining = TOTAL_PRODUCTS - totalInserted;
    const count = Math.min(BATCH_SIZE, remaining);
    const batchStart = totalInserted + 1;

    const products = generateBatch(totalInserted, count);

    await prisma.product.createMany({
      data: products,
      skipDuplicates: false,
    });

    totalInserted += count;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Seed] Batch ${batch + 1}/${batches}: Inserted ${count} products ` +
      `(total: ${totalInserted.toLocaleString()}, elapsed: ${elapsed}s)`
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const rate = (TOTAL_PRODUCTS / parseFloat(totalTime)).toFixed(0);

  console.log('');
  console.log('[Seed] ✅ Seeding complete!');
  console.log(`[Seed] Total products: ${TOTAL_PRODUCTS.toLocaleString()}`);
  console.log(`[Seed] Total time: ${totalTime}s`);
  console.log(`[Seed] Insert rate: ${rate} products/second`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[Seed] ❌ Seeding failed:', err);
  process.exit(1);
});