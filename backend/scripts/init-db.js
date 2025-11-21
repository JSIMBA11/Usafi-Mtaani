// backend/scripts/init-db.js
require("dotenv").config();
const { Pool } = require("pg");

// Debug: show env variables loaded
console.log("Loaded env:", {
  PGUSER: process.env.PGUSER,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
});

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function init() {
  try {
    console.log("🚀 Starting PostgreSQL schema initialization...");

    // Force schema to public
    await pool.query(`SET search_path TO public;`);

    // Test connection
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected at:", res.rows[0].now);

    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        points INTEGER DEFAULT 0,
        bg_color VARCHAR(20) DEFAULT '#ffffff',
        tier VARCHAR(50) DEFAULT 'bronze',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // Loyalty transactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        points INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Login attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.login_attempts (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        attempts INTEGER DEFAULT 1,
        last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notification preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT TRUE,
        sms_enabled BOOLEAN DEFAULT FALSE,
        push_enabled BOOLEAN DEFAULT FALSE
      );
    `);

    console.log("✅ Schema initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing DB:", err);
  } finally {
    await pool.end();
    console.log("🔒 Connection closed");
  }
}

init();
