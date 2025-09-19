"use client";

import SignIn from "@/components/SignIn";
import React from "react";
import "./styles/_login.scss";

const LoginPage = () => {
  return (
    <div className="login">
      <div className="login__split">
        {/* Left hero panel with image and headline */}
        <aside
          className="login__left"
          style={{
            // backgroundImage: "url(/sign-in.png)",
          }}
        >
          <div className="login__left__overlay" />
          <div className="login__left__content">
            <div className="login__logo">
              <img
                className="logo-mark"
                src="/ai-logo.png"
                alt="App logo"
                width={94}
                height={94}
              />

            </div>
            <h2 className="left__headline">
              Ready to take your testing to the next level?
            </h2>
            <p className="left__subtext">
              Turn your PRD into structured, review-ready test suites in seconds.
            </p>
          </div>
        </aside>

        {/* Right auth panel with only Google sign in */}
        <main className="login__right">
          <div className="auth-card">
            <h2 className="auth-card__title">Sign In</h2>

            <div className="auth-card__actions">
              <SignIn />
            </div>
            {/* <p className="auth-card__footer">Secure authentication via Google</p> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
