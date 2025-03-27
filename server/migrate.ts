import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Function to run migrations
export default async function runMigration() {
  try {
    console.log("Running database migrations...");
    
    // Create users table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `);
    
    // Create sessions table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_phone TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT 'individual',
        message_delay INTEGER NOT NULL DEFAULT 1000,
        enable_retry BOOLEAN NOT NULL DEFAULT false,
        max_retries INTEGER NOT NULL DEFAULT 3,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
    
    console.log("Migration completed successfully");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
}