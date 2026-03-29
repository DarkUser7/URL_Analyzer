import { db } from "./db";
import { users, type User, type InsertUser } from "@shared/schema";

export const storage = {
  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, id) });
  },
  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: (u, { eq }) => eq(u.username, username) });
  },
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  },
};
