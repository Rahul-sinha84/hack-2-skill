"use client";

import React from "react";
import SmoothChatLayout from "../components/SmoothChatLayout";
import TopBar from "../components/TopBar";
import { useReloadWarning } from "@/hooks/useReloadWarning";
import "./styles/_chat_id.scss";

interface ChatIDPageProps {
  params: {
    id: string;
  };
}

const ChatIDPage: React.FC<ChatIDPageProps> = ({ params }) => {
  useReloadWarning();

  return (
    <>
      <TopBar />
      <section className="chat-id">
        <div className="chat-id__container">
          <header className="chat-id__header"></header>
          <main className="chat-id__main">
            <SmoothChatLayout />
          </main>
          <footer className="chat-id__footer"></footer>
        </div>
      </section>
    </>
  );
};

export default ChatIDPage;
