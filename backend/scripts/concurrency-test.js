/**
 * Concurrency Test: Cursor Pagination Under Data Changes
 *
 * Verifies cursor-based pagination remains consistent when products
 * are inserted and updated concurrently during browsing.
 *
 * Tests:
 *   1. Fetch page 1 (limit=20), save IDs and cursor
 *   2. Insert 50 new products directly into DB
 *   3. Update 50 random products (changes updated_at)
 *   4. Fetch page 2+ using saved cursor
 *   5. Verify no duplicates, no leaks from new/updated products
 */

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

const API = 'http://localhost:3000/api';
const LIMIT = 20;
const TOTAL_PAGES = 5;
const NEW_COUNT = 50;
const UPDATE_COUNT = 50;

const CATEGORIES = [
  'Electronics','Clothing','Home & Kitchen','Books','Sports & Outdoors',
  'Toys & Games','Automotive','Health & Beauty','Office Supplies','Groceries',
];

const results = { pages: [], allIds: [], insertedIds: [], updatedIds: [], duplicates: [] };

function pickCategory() { return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]; }

async function apiGet(path) {
  const url = `${API}${path}`;
  console.log(`  REQUEST: GET ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  console.log(`  RESPONSE: ${data.data?.length || 0} products, hasMore=${data.pagination?.hasMore}`);
  return data;
}

async function insertProducts(count) {
  console.log(`\n--- INSERTING ${count} new products...`);
  const products = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const createdAt = new Date(now - Math.random() * 86400000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 3600000);
    products.push({
      id: faker.string.uuid(),
      name: `[CONCURRENCY-TEST-${Date.now()}-${i}] ${faker.commerce.productName()}`,
      category: pickCategory(),
      price: parseFloat(faker.commerce.price({ min: 0.99, max: 9999.99, dec: 2 })),
      createdAt, updatedAt,
    });
  }
  await prisma.product.createMany({ data: products });
  const ids = products.map(p => p.id);
  console.log(`  Inserted ${count} new products (first ID: ${ids[0].substring(0, 8)}...)`);
  return ids;
}

async function updateProducts(count) {
  console.log(`\n--- UPDATING ${count} random products...`);
  const rand = await prisma.product.findMany({ take: count, skip: Math.floor(Math.random() * 5000), orderBy: { id: 'asc' } });
  const ids = [];
  for (const p of rand) {
    await prisma.product.update({
      where: { id: p.id },
      data: { name: `[UPDATED-${Date.now()}] ${p.name}`, updatedAt: new Date() },
    });
    ids.push(p.id);
  }
  console.log(`  Updated ${ids.length} products (updatedAt → now, moved to front of sort order)`);
  return ids;
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CONCURRENCY TEST: Cursor Pagination Under Data Changes');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Config: limit=${LIMIT}, pages=${TOTAL_PAGES}, inserts=${NEW_COUNT}, updates=${UPDATE_COUNT}\n`);

  try {
    // STEP 1: Fetch page 1
    console.log('── [STEP 1] Fetch page 1 (baseline) ──');
    const page1 = await apiGet(`/products?limit=${LIMIT}`);
    const p1Ids = page1.data.map(p => p.id);
    results.pages.push({ page: 1, ids: p1Ids, cursor: page1.pagination.nextCursor });
    results.allIds.push(...p1Ids);
    console.log(`  Page 1 IDs: [${p1Ids.map(i => i.substring(0, 8)).join(', ')}]`);
    console.log(`  Cursor: ${page1.pagination.nextCursor?.substring(0, 30)}...`);

    // STEP 2: Insert new products
    console.log('\n── [STEP 2] Insert new products ──');
    results.insertedIds = await insertProducts(NEW_COUNT);

    // STEP 3: Update random products
    console.log('\n── [STEP 3] Update random products ──');
    results.updatedIds = await updateProducts(UPDATE_COUNT);

    // STEP 4: Fetch pages 2-5 using cursor
    console.log('\n── [STEP 4] Fetch pages 2-5 using cursor ──');
    let cursor = page1.pagination.nextCursor;
    for (let p = 2; p <= TOTAL_PAGES; p++) {
      if (!cursor) { console.log(`  No cursor — stopping at page ${p-1}`); break; }
      const page = await apiGet(`/products?limit=${LIMIT}&cursor=${encodeURIComponent(cursor)}`);
      const ids = page.data.map(i => i.id);
      results.pages.push({ page: p, ids, cursor: page.pagination.nextCursor });
      results.allIds.push(...ids);
      console.log(`  Page ${p} IDs: [${ids.map(i => i.substring(0, 8)).join(', ')}]`);
      cursor = page.pagination.nextCursor;
    }

    // STEP 5: Verify
    console.log('\n══ [VERIFICATION] ══\n');

    // 5a. Check duplicates
    const seen = new Set();
    for (const id of results.allIds) {
      if (seen.has(id)) results.duplicates.push(id);
      seen.add(id);
    }
    const dupPass = results.duplicates.length === 0;
    console.log(`[${dupPass ? 'PASS' : 'FAIL'}] No duplicates across all pages`);
    console.log(`      Total fetched: ${results.allIds.length}, Unique: ${seen.size}, Dupes: ${results.duplicates.length}`);

    // 5b. Check page 1 products don't appear on pages 2+
    let overlapFound = false;
    for (let pi = 1; pi < results.pages.length; pi++) {
      const overlap = results.pages[pi].ids.filter(id => p1Ids.includes(id));
      if (overlap.length > 0) {
        console.log(`[FAIL] Page ${results.pages[pi].page} has ${overlap.length} items from page 1`);
        overlapFound = true;
      }
    }
    if (!overlapFound) console.log('[PASS] No page 1 products leaked into later pages');

    // 5c. New inserts should NOT appear (they have newer updatedAt)
    const newLeak = results.allIds.filter(id => results.insertedIds.includes(id));
    const newPass = newLeak.length === 0;
    console.log(`[${newPass ? 'PASS' : 'FAIL'}] New inserts didn't leak into pagination`);
    console.log(`      ${newLeak.length} new products appeared mid-pagination`);

    // 5d. Updated products should not cause duplicates
    let updateDupes = 0;
    for (const id of results.updatedIds) {
      const count = results.allIds.filter(fid => fid === id).length;
      if (count > 1) updateDupes++;
    }
    const updPass = updateDupes === 0;
    console.log(`[${updPass ? 'PASS' : 'FAIL'}] Updates didn't cause duplicates`);
    console.log(`      ${updateDupes} updated products appeared more than once`);

    // 5e. Cursor validity
    let cursorPass = true;
    for (let i = 0; i < results.pages.length - 1; i++) {
      if (!results.pages[i].cursor) { cursorPass = false; break; }
    }
    console.log(`[${cursorPass ? 'PASS' : 'FAIL'}] Cursors valid for all pages`);

    // Summary
    const allPass = dupPass && !overlapFound && newPass && updPass && cursorPass;
    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log(`  ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (allPass) {
      console.log('Cursor pagination handles concurrent data changes correctly because:');
      console.log('  1. The WHERE clause uses (updated_at, id) < (cursor) — position-based, not offset');
      console.log('  2. New products have recent updated_at values → appear BEFORE cursor, excluded');
      console.log('  3. Updated products move to front of sort → same exclusion principle');
      console.log('  4. id tiebreaker ensures deterministic order when timestamps are identical');
    } else {
      console.log('Root cause analysis:');
      if (!dupPass) console.log('  - Duplicates suggest overlapping cursor windows — check LIMIT+1 logic');
      if (newLeak.length > 0) console.log('  - New products leaked — cursor condition may not properly filter');
      if (updateDupes > 0) console.log('  - Updates caused dupes — updated_at change creates new position');
    }

  } catch (err) {
    console.error('\n❌ TEST ERROR:', err.message);
    if (err.cause) console.error('  Cause:', err.cause);
  } finally {
    await prisma.$disconnect();
  }
}

run();