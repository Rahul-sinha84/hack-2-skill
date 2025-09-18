"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Auto redirect to chat when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/a/chat");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <button className="google-btn" disabled>
        <span className="spinner" />
        <span>Loading session...</span>
      </button>
    );
  }

  if (session) {
    return (
      <div className="signin__profile">
        <div className="profile__row">
          {session.user?.image && (
            <img className="profile__avatar" src={session.user.image} alt="Profile" />
          )}
          <div className="profile__details">
            <p className="profile__greeting">Welcome,</p>
            <p className="profile__name">{session.user?.name}</p>
          </div>
        </div>
        <button className="secondary-btn" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      className="google-btn"
      onClick={async () => {
        try {
          setIsSigningIn(true);
          await signIn("google", { callbackUrl: "/a/chat" });
        } finally {
          setIsSigningIn(false);
        }
      }}
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <>
          <span className="spinner" />
          <span>Signing you in...</span>
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20.5C16.6944 20.5 20.5 16.6944 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5C7.30558 3.5 3.5 7.30558 3.5 12" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M20.5 12C20.5 11.3371 20.4385 10.6879 20.3222 10.0581H12V13.9439H16.8761C16.6527 15.1721 15.9694 16.199 14.9426 16.8669V19.2432H18.0605C19.9372 17.5213 21 14.9905 21 12H20.5Z" fill="currentColor"/>
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}
