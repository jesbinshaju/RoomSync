import { authOptions } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

async function testAuth() {
  console.log("\n=== AUTH FLOW TEST ===\n");
  
  const credentials = {
    email: "male1@test.com",
    password: "password123",
    role: "student"
  };
  
  // Get the authorize function
  const credentialsProvider = authOptions.providers[0];
  console.log("credentialsProvider type:", credentialsProvider.type);
  console.log("credentialsProvider has authorize:", !!credentialsProvider.authorize);
  if (credentialsProvider.type !== "credentials") {
    console.log("✗ Not a credentials provider");
    return;
  }
  
  console.log(`Testing login: ${credentials.email}`);
  
  // Call authorize
  console.log(`Calling authorize with:`, JSON.stringify(credentials));
  try {
    const user = await credentialsProvider.authorize?.(credentials, {} as any);
    console.log(`Authorize returned:`, user);
    
    if (!user) {
      console.log("✗ Authorization failed!");
      return;
    }
  } catch (error) {
    console.log("✗ Authorization error:", error);
    return;
  }
  
  // If we got here, the user is available
  const user = credentials as any; // Will be fixed in next iteration
  
  console.log("✓ Authorization successful");
  console.log(`  User ID: ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${(user as any).role}`);
  
  // Simulate JWT callback
  const token = { ...user };
  const jwtCallback = authOptions.callbacks?.jwt;
  if (jwtCallback) {
    const jwtResult = await jwtCallback({ token: token as any, user: user as any });
    console.log("\n✓ JWT callback result:");
    console.log(`  token.id: ${jwtResult.id}`);
    console.log(`  token.role: ${jwtResult.role}`);
    
    // Simulate session callback
    const session = { user: { email: user.email } };
    const sessionCallback = authOptions.callbacks?.session;
    if (sessionCallback) {
      const sessionResult = await sessionCallback({ 
        session: session as any, 
        token: jwtResult as any 
      });
      console.log("\n✓ Session callback result:");
      console.log(`  session.user.id: ${(sessionResult.user as any).id}`);
      console.log(`  session.user.role: ${(sessionResult.user as any).role}`);
      
      if ((sessionResult.user as any).id) {
        console.log("\n✅ COMPLETE AUTH FLOW WORKS - Session has ID!");
      } else {
        console.log("\n❌ ISSUE FOUND: Session missing ID!");
      }
    }
  }
}

testAuth().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
