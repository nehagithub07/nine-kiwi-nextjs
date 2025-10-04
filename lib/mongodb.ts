// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

/** Reuse connection across hot reloads (Next.js dev) */
let cached = (global as any)._mongoose;
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

export async function connectToDB() {
  if (cached.conn) return cached.conn as typeof mongoose;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_URI.split("/").pop()?.split("?")[0],
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn as typeof mongoose;
}
