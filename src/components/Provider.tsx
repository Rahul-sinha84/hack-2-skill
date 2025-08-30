// ! making this because SessionProvider is a client component
// ? we want to use this in layout.tsx which is a server component
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
