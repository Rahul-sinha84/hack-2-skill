"use client";

import SignIn from "@/components/SignIn";
import React from "react";
import "./styles/_login.scss";

const LoginPage = () => {
  return (
    <div className="login">
      <div className="login__container">
        <div className="login__content">
          <div className="login__header">
            <div className="login__logo">
              <div className="logo-icon">🧪</div>
              <h1 className="logo-text">Test Case Generator</h1>
            </div>
            <p className="login__subtitle">
              Transform your PRD documents into comprehensive test cases with AI
            </p>
          </div>

          <div className="login__main">
            <div className="login__card">
              <h2 className="card__title">Welcome Back</h2>
              <p className="card__description">
                Sign in to continue generating test cases from your PRD documents
              </p>
              
              <div className="card__signin">
                <SignIn />
              </div>
            </div>
          </div>

          <div className="login__footer">
            <p className="footer__text">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
