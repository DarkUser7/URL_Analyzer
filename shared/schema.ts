import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  name: text("name"),
  password: text("password").notNull(),
  email: text("email"),
  info: text("info"),
});


export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  password: true,
  email: true,
  info: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scan Results Table
export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  timestamp: text("timestamp").notNull(), // ISO string
  classification: text("classification").notNull(),
  confidence: text("confidence").notNull(),
  source: text("source").notNull(), // e.g. "ai" or "manual"
  userId: varchar("user_id").references(() => users.id),
});

export const insertScanResultSchema = createInsertSchema(scanResults).pick({
  url: true,
  timestamp: true,
  classification: true,
  confidence: true,
  source: true,
  userId: true,
});

export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;
