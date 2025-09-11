"use client";

import React, { useState } from "react";
import {
  ChatResponse,
  TestCategory,
  TestCase,
  useChat,
} from "../context/ChatContext";
import "./_chat_responses.scss";
import Modal from "@/components/Modal";
import TestCategoryCards from "./TestCases/TestCategoryCards";
import TestCategoryCardsWrapper from "./TestCases/TestCategoryCardsWrapper";

interface ChatResponsesProps {
  responses: Array<
    ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  >;
  chatId?: string;
}

const ChatResponses: React.FC<ChatResponsesProps> = ({ responses, chatId }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTestCategory, setSelectedTestCategory] = useState<
    | (ChatResponse & {
        testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
      })
    | null
  >(null);

  const handleOpenModal = (
    testCategory: ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  ) => {
    setSelectedTestCategory(testCategory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestCategory(null);
  };

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
                    <div className="chat-container__item__test-cases">
                      {/* // todo complete the button, and modal from here! */}
                      <button onClick={() => handleOpenModal(response)}>
                        View Test cases
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </main>
        <footer className="chat__layout__messages__footer"></footer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Test cases"
        content={
          <TestCategoryCardsWrapper
            data={selectedTestCategory?.testCategories || []}
          />
        }
      />
    </section>
  );
};

export default ChatResponses;
