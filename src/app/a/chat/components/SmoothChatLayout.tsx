"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import ChatInput from "./ChatInput";
import ChatResponses from "./ChatResponses";
import {
  ChatResponse,
  TestCase,
  TestCategory,
  useChat,
} from "../context/ChatContext";
import "./_chat_layout.scss";

const SmoothChatLayout: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    addChatResponse,
    getChatResponsesByChatId,
    getTestCategoriesByChatResponseId,
    getTestCasesByTestCategoryId,
  } = useChat();

  // Extract chatId from pathname
  const chatId = pathname === "/a/chat" ? undefined : pathname.split("/").pop();

  const [curChatResponses, setCurChatResponses] = useState<
    Array<
      ChatResponse & {
        testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
      }
    >
  >([]);

  const [loadChatsFlag, setLoadChatsFlag] = useState<boolean>(false);

  const handleMessageSubmit = (message: string) => {
    if (chatId) {
      // If we're already in a chat, just add the message
      addChatResponse(chatId, message);
      setLoadChatsFlag((prev) => !prev);
    } else {
      // If we're on the main chat page, create a new chat
      const newChatId = Date.now().toString();

      // Add the message to the new chat
      addChatResponse(newChatId, message);

      router.push(`/a/chat/${newChatId}`);
    }
  };

  useEffect(() => {
    if (chatId) {
      const chatResponses = getChatResponsesByChatId(chatId);

      const requiredData = chatResponses.map((chatResponse) => {
        const { id, chatId } = chatResponse;
        const testCategories = getTestCategoriesByChatResponseId(id);

        const testCategoriesWithTestCases = testCategories.map(
          (testCategory) => {
            const { id } = testCategory;

            const testCases = getTestCasesByTestCategoryId(id);

            return {
              ...testCategory,
              testCases,
            };
          }
        );

        return {
          ...chatResponse,
          testCategories: testCategoriesWithTestCases,
        };
      });

      setCurChatResponses(requiredData);
    }
  }, [chatId, loadChatsFlag]);

  return (
    <section className="chat__layout">
      <div className="chat__layout__container">
        <header className="chat__layout__header"></header>
        <main className="chat__layout__main">
          {chatId ? (
            <div className="chat__layout__chats">
              <ChatResponses responses={curChatResponses} chatId={chatId} />
            </div>
          ) : null}

          <div
            className={`${
              chatId ? "chat__layout__input" : "chat__layout__input-new-chat"
            }`}
          >
            <ChatInput onSubmit={handleMessageSubmit} />
          </div>
        </main>
        <footer className="chat__layout__footer"></footer>
      </div>
    </section>
  );
};

export default SmoothChatLayout;
