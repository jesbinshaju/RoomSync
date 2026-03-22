import { fetchWithTimeout } from "./lib/utils";

async function testSigninEndpoint() {
  console.log("Testing NextAuth signin endpoint...\n");

  try {
    // Test the credentials callback endpoint
    const response = await fetch("http://localhost:3000/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "male1@test.com",
        password: "password123",
        role: "student",
      }),
    });

    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers.get("content-type"));
    
    const text = await response.text();
    console.log("Response body (first 500 chars):", text.slice(0, 500));
    
    if (response.status === 200) {
      console.log("\n✓ Endpoint returned 200 OK");
    } else {
      console.log(`\n✗ Endpoint returned ${response.status}`);
    }
  } catch (error: any) {
    console.error("Error:", error.message);
  }

  process.exit(0);
}

testSigninEndpoint();
