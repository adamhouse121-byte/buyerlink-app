// app/join/JoinClient.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function JoinClient() {
  const params = useSearchParams();
  const code = params.get("code") ?? "";

  // 👇 Replace this placeholder with your real join UI whenever you want.
  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
      <h1>Join</h1>
      <p>Invite code: <code>{code || "(none)"}</code></p>
      {/* Your real join form/logic goes here */}
    </main>
  );
}
