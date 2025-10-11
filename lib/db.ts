import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not set in env");


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
g._mongooseConn!.promise = mongoose
.connect(MONGODB_URI, {
dbName: MONGODB_URI.split("/").pop()?.split("?")[0],
})
.then((m) => {
console.log("[DB] Connected to MongoDB");
return m;
})
.catch((err) => {
console.error("[DB] Mongo connection error:", err);
throw err;
});
}
g._mongooseConn!.conn = await g._mongooseConn!.promise;
return g._mongooseConn!.conn;
}