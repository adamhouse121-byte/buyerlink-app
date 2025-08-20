// app/join/page.tsx
import { Suspense } from "react";
import JoinClient from "./JoinClient";

// Tell Next not to prerender/cache this page so we avoid CSR bailouts
export const dynamic = "force-dynamic";   // or: export const revalidate = 0;

export default function JoinPage() {
  return (
    <Suspense fallback={<div />}>
      <JoinClient />
    </Suspense>
  );
}
