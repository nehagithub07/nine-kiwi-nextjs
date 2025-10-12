import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
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
      // When using OAuth (e.g., Google), ensure user exists in DB and set role
      if (account && account.provider !== "credentials") {
        await dbConnect();
        const found = await User.findOne({ email: user?.email }).lean();
        if (!found) {
          const isAdmin = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean)
            .includes(String(user?.email || "").toLowerCase());
          // For OAuth-created users, store a placeholder password
          await User.create({
            name: user?.name || (profile as any)?.name || "User",
            email: String(user?.email),
            password: await (await import("bcryptjs")).hash("oauth-login", 10),
            role: isAdmin ? "admin" : "user",
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id || token.id;
        token.role = (user as any).role || token.role || "user";
      }
      // Enrich token with DB role on subsequent calls
      if (!token.role && token.email) {
        await dbConnect();
        const found = await User.findOne({ email: token.email }).lean();
        if (found) {
          token.id = String(found._id);
          (token as any).role = (found as any).role || "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token as any).role || "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
