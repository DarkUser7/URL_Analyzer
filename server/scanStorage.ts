import { db } from "./db";
import { scanResults, type InsertScanResult, type ScanResult } from "@shared/schema";

export const scanStorage = {
  async createScanResult(data: InsertScanResult): Promise<ScanResult> {
    const [result] = await db.insert(scanResults).values(data).returning();
    return result;
  },
  async getUserScanResults(userId: string): Promise<ScanResult[]> {
    return db.query.scanResults.findMany({ where: (r, { eq }) => eq(r.userId, userId) });
  },
  async getAllScanResults(): Promise<ScanResult[]> {
    return db.query.scanResults.findMany();
  },
};
