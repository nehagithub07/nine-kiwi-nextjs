// Soft Prisma client loader to avoid build-time failures when Prisma isn't installed
// or configured. If available, it exports a real PrismaClient; otherwise a stub
// that throws if used.
let prisma: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  const globalForPrisma = global as unknown as { prisma?: any };
  prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch {
  prisma = new Proxy(
    {},
    {
      get() {
        throw new Error("Prisma client not available. Remove Prisma routes or install @prisma/client.");
      },
    }
  );
}

export default prisma;
