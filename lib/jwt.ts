import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";

export function signToken(payload: object, expiresIn = "7d") {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
export function verifyToken<T = any>(token: string): T {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, JWT_SECRET) as T;
}
