import { sessions, type Session, type InsertSession } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session management for WhatsApp
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getActiveSessions(): Promise<Session[]>;
  updateSessionStatus(id: string, status: "active" | "stopped" | "completed" | "failed"): Promise<Session | undefined>;
}

// Import the DB Storage implementation
import { DbStorage } from "./db-storage";

// Export an instance of the DB Storage
export const storage = new DbStorage();
