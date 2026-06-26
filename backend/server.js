require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = require('./app');
const config = require('./src/config');
const prisma = require('./src/utils/prisma');

async function main() {
  // Verify database connection before starting the server
  try {
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL successfully');
  } catch (err) {
    console.error('[DB] Failed to connect to PostgreSQL:', err.message);
    console.error('[DB] Make sure PostgreSQL is running and DATABASE_URL is correct');
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log(`[Server] Health check: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('[Server] Closed gracefully');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();