// Application configuration
// Centralizes all environment variables and app constants

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  pagination: {
    defaultLimit: 50,
    maxLimit: 100,
  },
};

module.exports = config;