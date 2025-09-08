import React from "react";
import SmoothChatLayout from "./components/SmoothChatLayout";

const ChatPage = () => {
  return (
    <section className="chat">
      <div className="chat__container">
        <header className="chat__header"></header>
        <main className="chat__main">
          <h2 className="chat__main__title">What's on your mind today?</h2>
          <p className="chat__main__description">
            Use me for medical test cases generations
          </p>
          <SmoothChatLayout />
        </main>
        <footer className="chat__footer"></footer>
      </div>
    </section>
  );
};

export default ChatPage;
