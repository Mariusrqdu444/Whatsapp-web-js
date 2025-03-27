import { users, type User, type InsertUser, sessions, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
    return session;
  }

  async getActiveSessions(): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.status, "active"));
  }

  async updateSessionStatus(
    id: string,
    status: "active" | "stopped" | "completed" | "failed"
  ): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set({ status })
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }
}