import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

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

      if (user.email) {
        try {
          const loginTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata", // Adjust to your timezone, e.g., IST
          });
          await sendEmail(
            user.email,
            "Nine Kiwi - Recent Login Notification",
            `Hello ${
              user.name || "User"
            },\n\nYou recently logged in to Nine Kiwi on ${loginTime}.\n\nIf this wasn't you, please secure your account immediately.\n\nBest,\nThe Nine Kiwi Team`,
            `
              <h2>Nine Kiwi Login Notification</h2>
              <p>Hello ${user.name || "User"},</p>
              <p>You recently logged in to your Nine Kiwi account on ${loginTime}.</p>
              <p>If this wasn't you, please secure your account immediately by resetting your password or contacting support.</p>
              <p>Best,<br>The Nine Kiwi Team</p>
            `
          );
          console.log(`Login email sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send login email to ${user.email}:`, error);
          // Don't block sign-in if email fails
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id || token.id;
        token.role = (user as any).role || token.role || "user";
        token.name = user.name || token.name;
        (token as any).image = (user as any).image || (token as any).image;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name as any;
        if ((session as any).image) (token as any).image = (session as any).image;
      }
      // Enrich token with latest DB fields on every call
      if (token.email) {
        await dbConnect();
        const found = await User.findOne({ email: token.email }).lean();
        if (found) {
          token.id = String(found._id);
          (token as any).role = (found as any).role || (token as any).role || "user";
          token.name = found.name || token.name;
          (token as any).image = (found as any).avatarUrl || (token as any).image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = (token as any).role || "user";
        session.user.name = token.name || session.user.name;
        (session.user as any).image = (token as any).image || (session.user as any).image;
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
