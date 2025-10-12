import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in env");

const DEFAULT_DB = process.env.MONGODB_DB || process.env.MONGODB_DATABASE || "nine-kiwi";

function resolveDbName(uri: string): string {
  try {
    const u = new URL(uri);
    const name = u.pathname.replace(/^\//, "");
    return name || DEFAULT_DB;
  } catch {
    const last = uri.split("/").pop()?.split("?")[0];
    return last || DEFAULT_DB;
  }
}

type TGlobal = typeof globalThis & {
  _mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const g: TGlobal = global as TGlobal;

if (!g._mongooseConn) {
  g._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (g._mongooseConn!.conn) return g._mongooseConn!.conn;
  if (!g._mongooseConn!.promise) {
    const primaryDbName = resolveDbName(MONGODB_URI);
    const fallbackUriRaw = process.env.MONGODB_FALLBACK_URI || (process.env.ALLOW_LOCAL_DB_FALLBACK ? `mongodb://127.0.0.1:27017/${DEFAULT_DB}` : undefined);
    // If fallback matches primary (or is empty), ignore it to avoid duplicate attempts/logs
    const fallbackUri = fallbackUriRaw && fallbackUriRaw.trim().length > 0 && fallbackUriRaw !== MONGODB_URI ? fallbackUriRaw : undefined;
    // Only prefer fallback when explicitly requested; merely allowing local fallback should not change order
    const preferFallback = process.env.MONGODB_PREFER_FALLBACK === "1";

    const tryConnect = async (uri: string, label: string) => {
      const name = resolveDbName(uri);
      const m = await mongoose.connect(uri, { dbName: name });
      console.log(`[DB] Connected to ${label} MongoDB (db: ${name})`);
      return m;
    };

    g._mongooseConn!.promise = (async () => {
      if (preferFallback && fallbackUri) {
        try {
          return await tryConnect(fallbackUri, "fallback");
        } catch (errFallback) {
          console.error("[DB] Fallback Mongo connection error:", errFallback);
          // When preferring fallback, do not attempt primary; surface local error immediately
          throw errFallback;
        }
      } else {
        try {
          const m = await tryConnect(MONGODB_URI, "primary");
          return m;
        } catch (errPrimary) {
          console.error("[DB] Primary Mongo connection error:", errPrimary);
          if (!fallbackUri) throw errPrimary;
          try {
            return await tryConnect(fallbackUri, "fallback");
          } catch (errFallback) {
            console.error("[DB] Fallback Mongo connection error:", errFallback);
            throw errPrimary;
          }
        }
      }
    })();
  }
  try {
    g._mongooseConn!.conn = await g._mongooseConn!.promise;
    return g._mongooseConn!.conn;
  } catch (e) {
    // Clear cached failed promise so future calls can retry with new env/DB
    g._mongooseConn!.promise = null as any;
    g._mongooseConn!.conn = null as any;
    throw e;
  }
}

export default connectDB;
