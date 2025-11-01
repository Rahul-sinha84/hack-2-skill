"use client";

import React from "react";
import SmoothChatLayout from "./components/SmoothChatLayout";
import TopBar from "./components/TopBar";
import { useReloadWarning } from "@/hooks/useReloadWarning";

const ChatPage = () => {
  useReloadWarning();

  return (
    <>
      <TopBar />
      <section className="chat">
        <div className="chat__container">
          <header className="chat__header"></header>
          <main className="chat__main">
            <div className="welcome-message">
              <h2>
                Welcome to <span className="brand-text">TestAI</span>
              </h2>
              <p>
                Upload a PRD document and I'll help you generate comprehensive
                test cases.
              </p>
            </div>
          </main>
          <SmoothChatLayout />
          <footer className="chat__footer"></footer>
        </div>
      </section>
    </>
  );
};

export default ChatPage;
