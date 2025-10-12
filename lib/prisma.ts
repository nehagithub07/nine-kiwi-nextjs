import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `prisma` in dev mode to prevent multiple instances
  var prisma: PrismaClient | undefined;
}
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional logging
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
