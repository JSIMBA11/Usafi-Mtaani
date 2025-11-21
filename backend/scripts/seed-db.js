// backend/scripts/seed-db.js
require("dotenv").config();
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function seed() {
  try {
    console.log("🌱 Starting PostgreSQL seeding...");

    // Force schema to public
    await pool.query(`SET search_path TO public;`);

    // Test connection
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected at:", res.rows[0].now);

    // Insert test user
    const userRes = await pool.query(
      `INSERT INTO public.users (name, phone, email, password_hash, points, tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id;`,
      ["Test User", "0712345678", "test@example.com", "hashedpassword123", 100, "silver"]
    );
    const userId = userRes.rows[0].id;
    console.log(`✅ User inserted with id: ${userId}`);

    // Loyalty transaction
    await pool.query(
      `INSERT INTO public.loyalty_transactions (user_id, type, points, description)
       VALUES ($1, $2, $3, $4);`,
      [userId, "earn", 50, "Signup bonus"]
    );
    console.log("✅ Loyalty transaction inserted");

    // Notification
    await pool.query(
      `INSERT INTO public.notifications (user_id, type, message)
       VALUES ($1, $2, $3);`,
      [userId, "welcome", "Welcome to Usafi-Mtaani loyalty program!"]
    );
    console.log("✅ Notification inserted");

    // Notification preferences
    await pool.query(
      `INSERT INTO public.notification_preferences (user_id, email_enabled, sms_enabled, push_enabled)
       VALUES ($1, $2, $3, $4);`,
      [userId, true, false, true]
    );
    console.log("✅ Notification preferences inserted");

    console.log("🌱 Seeding completed successfully");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await pool.end();
    console.log("🔒 Connection closed");
  }
}

seed();
