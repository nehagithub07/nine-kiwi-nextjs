// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!process.env.MONGODB_URI) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, (user as any).password);
        if (!ok) return null;
        return {
          id: String((user as any)._id),
          name: (user as any).name,
          email: (user as any).email,
          role: (user as any).role || "user",
        } as any;
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider !== "credentials") {
        if (!process.env.MONGODB_URI) return true;
        await dbConnect();
        const found = await User.findOne({ email: user?.email }).lean();
        if (!found) {
          const isAdmin = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .includes(String(user?.email || "").toLowerCase());
          await User.create({
            name: user?.name || (profile as any)?.name || "User",
            email: String(user?.email),
            password: await (await import("bcryptjs")).hash("oauth-login", 10),
            role: isAdmin ? "admin" : "user",
          });
        }
      }
      if (user.email) {
        try {
          const loginTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await sendEmail(
            user.email,
            "Nine Kiwi - Recent Login Notification",
            `Hello ${user.name || "User"},\n\nYou recently logged in to Nine Kiwi on ${loginTime}.`,
            `<h2>Nine Kiwi Login Notification</h2><p>Hello ${user.name || "User"},</p><p>You recently logged in on ${loginTime}.</p>`
          );
        } catch {}
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        (token as any).id = (user as any).id || (token as any).id;
        (token as any).role = (user as any).role || (token as any).role || "user";
        token.name = user.name || token.name;
        (token as any).image = (user as any).image || (token as any).image;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name as any;
        if ((session as any).image) (token as any).image = (session as any).image;
      }
      if (token.email) {
        if (!process.env.MONGODB_URI) return token;
        await dbConnect();
        const found = await User.findOne({ email: token.email }).lean();
        if (found) {
          (token as any).id = String((found as any)._id);
          (token as any).role = (found as any).role || (token as any).role || "user";
          token.name = (found as any).name || token.name;
          (token as any).image = (found as any).avatarUrl || (token as any).image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role || "user";
        session.user.name = token.name || session.user.name;
        (session.user as any).image = (token as any).image || (session.user as any).image;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
