import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./lib/db";

// Create the credentials provider inline to test the authorize function
const provider = CredentialsProvider({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
    role: { label: "Role", type: "text" },
  },
  async authorize(credentials) {
    console.log("[TEST LOG] authorize called");
    if (!credentials?.email || !credentials?.password) {
      console.log("[TEST LOG] Missing credentials");
      return null;
    }

    const role = credentials.role as "student" | "admin" | undefined;
    console.log(`[TEST LOG] Role: ${role}`);

    if (role === "admin") {
      console.log("[TEST LOG] Admin login");
      return null; // Skip admin for now
    }

    console.log("[TEST LOG] Student login attempt");
    const student = await prisma.student.findUnique({
      where: { email: credentials.email, isActive: true },
    });
    
    console.log(`[TEST LOG] Student found: ${!!student}`);
    if (!student) return null;

    const ok = await compare(credentials.password, student.passwordHash);
    console.log(`[TEST LOG] Password match: ${ok}`);
    if (!ok) return null;

    return {
      id: student.id,
      email: student.email,
      name: student.fullName,
      role: "student",
    };
  },
});

async function test() {
  console.log("Testing authorize function...\n");
  const result = await provider.authorize?.(
    { email: "male1@test.com", password: "password123", role: "student" },
    {} as any
  );
  console.log("\nResult:", result);
  process.exit(0);
}

test().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
