"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
            <Image
              className="profile__avatar"
              src={session.user.image}
              alt="Profile"
              width={40}
              height={40}
            />
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
          <span className="google-icon" aria-hidden="true">
            {/* Official Google 'G' mark */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.67 0 6.22 1.59 7.65 2.92l5.22-5.09C33.62 4.2 29.2 2 24 2 14.82 2 6.94 7.16 3.22 14.44l6.94 5.39C12 14.41 17.49 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24.5c0-1.64-.15-3.2-.43-4.7H24v9h12.7c-.55 2.98-2.22 5.5-4.73 7.2l7.24 5.61C43.76 38.16 46.5 31.9 46.5 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.16 28.83A14.47 14.47 0 0 1 9.5 24c0-1.67.29-3.28.81-4.78l-6.94-5.39A22.45 22.45 0 0 0 2 24c0 3.57.86 6.94 2.37 9.92l5.79-5.09z"
              />
              <path
                fill="#34A853"
                d="M24 46c5.84 0 10.74-1.92 14.32-5.2l-7.24-5.61C29.1 36.32 26.74 37 24 37c-6.51 0-12-4.91-13.84-11.28l-5.79 5.09C7.06 40.84 14.84 46 24 46z"
              />
              <path fill="none" d="M2 2h44v44H2z" />
            </svg>
          </span>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}
