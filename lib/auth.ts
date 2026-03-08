import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const role = credentials.role as "student" | "admin" | undefined;

        if (role === "admin") {
          const admin = await prisma.adminUser.findUnique({
            where: { email: credentials.email, isActive: true },
          });
          if (!admin) return null;
          const ok = await compare(credentials.password, admin.passwordHash);
          if (!ok) return null;
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: "admin",
          };
        }

        const student = await prisma.student.findUnique({
          where: { email: credentials.email, isActive: true },
        });
        if (!student) return null;
        const ok = await compare(credentials.password, student.passwordHash);
        if (!ok) return null;
        return {
          id: student.id,
          email: student.email,
          name: student.fullName,
          role: "student",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
