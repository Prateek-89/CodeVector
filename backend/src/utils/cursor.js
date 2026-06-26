/**
 * Cursor encoding/decoding utilities.
 *
 * Cursor pagination requires the ability to pass the last seen item's
 * sort position to the next query. We encode `{ id, updatedAt }` as
 * a base64 JSON string. This is simple, debuggable, and opaque to clients.
 *
 * Why base64? Because cursors appear in URLs and should not contain
 * special characters that need URL-encoding.
 */

/**
 * Encode a cursor from a product's pagination fields.
 * @param {Object} params
 * @param {string} params.id - Product UUID
 * @param {Date} params.updatedAt - Product updated_at timestamp
 * @returns {string} Base64-encoded cursor
 */
function encodeCursor({ id, updatedAt }) {
  const payload = JSON.stringify({ id, updatedAt: updatedAt.toISOString() });
  return Buffer.from(payload, 'utf-8').toString('base64url');
}

/**
 * Decode a cursor string back to { id, updatedAt }.
 * @param {string} cursor - Base64-encoded cursor
 * @returns {Object} { id: string, updatedAt: Date }
 * @throws {Error} If cursor is invalid
 */
function decodeCursor(cursor) {
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8');
    const { id, updatedAt } = JSON.parse(json);
    return { id, updatedAt: new Date(updatedAt) };
  } catch {
    throw new Error('Invalid cursor format');
  }
}

module.exports = { encodeCursor, decodeCursor };