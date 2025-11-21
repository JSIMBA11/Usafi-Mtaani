// backend/db.js
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

// Configure connection
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
    : {
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        database: process.env.PGDATABASE,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      }
);

// Test connection
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch((err) => console.error("❌ DB connection error:", err.message));

module.exports = pool;
