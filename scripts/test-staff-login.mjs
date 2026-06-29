const loginRes = await fetch("http://localhost:3000/api/auth/staff-login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    email: "admin@clearchoicepharmacy.com",
    password: "Summer@2026",
  }),
})

const loginBody = await loginRes.json()
console.log("login:", loginRes.status, loginBody.sessionId ? "has session" : "no session")

if (!loginBody.sessionId) process.exit(1)

const meRes = await fetch("http://localhost:3000/api/admin/me", {
  headers: { Authorization: `Bearer ${loginBody.sessionId}` },
})
console.log("admin/me with bearer:", meRes.status, await meRes.json())
