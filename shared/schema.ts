import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Create schema for WhatsApp sessions
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userPhone: text("user_phone").notNull(),
  targetType: text("target_type").notNull().default("individual"),
  targetPhones: text("target_phones").notNull().default(""), // For storing multiple target phone numbers
  messageDelay: integer("message_delay").notNull().default(1000),
  enableRetry: boolean("enable_retry").notNull().default(false),
  maxRetries: integer("max_retries").notNull().default(3),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
