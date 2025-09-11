import React from "react";
import SmoothChatLayout from "../components/SmoothChatLayout";
import "./styles/_chat_id.scss";

interface ChatIDPageProps {
  params: {
    id: string;
  };
}

const ChatIDPage: React.FC<ChatIDPageProps> = async ({ params }) => {
  return (
    <section className="chat-id">
      <div className="chat-id__container">
        <header className="chat-id__header"></header>
        <main className="chat-id__main">
          <SmoothChatLayout />
        </main>
        <footer className="chat-id__footer"></footer>
      </div>
    </section>
  );
};

export default ChatIDPage;
