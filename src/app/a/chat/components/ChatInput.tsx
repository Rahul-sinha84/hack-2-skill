"use client";

import React, { useRef } from "react";
import "./_chat_input.scss";
import { IoIosAttach } from "react-icons/io";
import { showToastInfo } from "@/components/ReactToastify/ReactToastify";

interface ChatInputProps {
  onSubmit: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const message = formData.get("message") as string;

    if (!message.trim()) {
      showToastInfo("Please enter a message");
      return;
    }

    onSubmit(message);
    // Clear the form after submission
    (e.currentTarget as HTMLFormElement).reset();
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Trigger form submission
      const form = e.currentTarget.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
    // If Shift+Enter, let the default behavior happen (new line)
  };

  const handleInput = () => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <article className="chat__input">
      <div className="chat__input__container">
        <div className="prefix">
          <button type="button" className="attachment-icon">
            <i>
              <IoIosAttach />
            </i>
          </button>
        </div>
        <main className="main">
          <form onSubmit={handleSubmit} className="">
            <textarea
              ref={textareaRef}
              name="message"
              placeholder="Type your message..."
              className="chat__input__input"
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              rows={1}
              style={{ resize: "none", overflow: "hidden" }}
            />
          </form>
        </main>
        <div className="suffix"></div>
      </div>
    </article>
  );
};

export default ChatInput;
