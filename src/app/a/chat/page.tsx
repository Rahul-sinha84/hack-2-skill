import React from "react";
import SmoothChatLayout from "./components/SmoothChatLayout";
import TopBar from "./components/TopBar";

const ChatPage = () => {
  return (
    <>
    <TopBar />
    <section className="chat">
      <div className="chat__container">
        <header className="chat__header"></header>
        <main className="chat__main">
          <h2 className="chat__main__title">What's on your mind today?</h2>
          <p className="chat__main__description">
            Use me for medical test cases generations
          </p>
        </main>
        <SmoothChatLayout />
        <footer className="chat__footer"></footer>
      </div>
    </section>
    </>
  );
};

export default ChatPage;
