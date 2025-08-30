"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.name}!</p>
        <img src={session.user?.image ?? ""} alt="Profile" />
        <button onClick={() => signOut()}>LogOut</button>
      </div>
    );
  }

  return <button onClick={() => signIn("google")}>Continue with Google</button>;
}
