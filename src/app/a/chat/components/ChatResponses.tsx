"use client";

import React from "react";
import {
  ChatResponse,
  TestCategory,
  TestCase,
  useChat,
} from "../context/ChatContext";
import "./_chat_responses.scss";

interface ChatResponsesProps {
  responses: Array<
    ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  >;
  chatId?: string;
}

const ChatResponses: React.FC<ChatResponsesProps> = ({ responses, chatId }) => {
  return (
    <section className="chat__layout__responses">
      <div className="chat__layout__responses__container">
        <header className="chat__layout__responses__header"></header>
        <main className="chat__layout__responses__main">
          {/* {chatId && (
            <div className="mb-4 p-2 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600">Chat ID: {chatId}</p>
            </div>
          )} */}

          {responses.length !== 0 ? (
            <ul className="chat-container">
              {responses.map((response) => (
                <li key={response.id} className="chat-container__item">
                  <div className="chat-container__item__prompt">
                    <p className="chat-container__item__prompt__para">
                      {response.prompt}
                    </p>
                  </div>
                  <div className="chat-container__item__response">
                    <p className="chat-container__item__response__para">
                      {response.content}
                    </p>
                  </div>
                  {/* <p className="text-gray-800">{response.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {response.timestamp.toLocaleTimeString()}
                  </p> */}
                  {response.testCategories.length !== 0 ? (
                    // todo complete the button, and modal from here!
                    <button>Test cases</button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </main>
        <footer className="chat__layout__messages__footer"></footer>
      </div>
    </section>
  );
};

export default ChatResponses;
