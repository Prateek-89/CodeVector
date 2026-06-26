const { PrismaClient } = require('@prisma/client');

// Singleton PrismaClient instance
// In development, Node's hot-reload can create many instances.
// Storing on globalThis prevents this during --watch mode.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;