"use client";

import React, { useState } from "react";
import { ChatResponse, TestCategory, TestCase, MessageType } from "../context/ChatContext";
import "./_chat_responses.scss";
import Modal from "@/components/Modal";
import TestCaseWorkflow from "./TestCaseWorkflow/TestCaseWorkflow";

interface ChatResponsesProps {
  responses: Array<
    ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  >;
  chatId?: string;
}

const TypingIndicator: React.FC = () => (
  <div className="typing-indicator">
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

const FileAttachment: React.FC<{ file: { name: string; type: string; size: number } }> = ({ file }) => (
  <div className="file-attachment">
    <div className="file-icon">
      📄
    </div>
    <div className="file-info">
      <span className="file-name">{file.name}</span>
      <span className="file-size">{Math.round(file.size / 1024)} KB</span>
    </div>
  </div>
);

const MessageBubble: React.FC<{
  response: ChatResponse & {
    testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
  };
  onOpenModal: (response: ChatResponse & {
    testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
  }) => void;
}> = ({ response, onOpenModal }) => {
  const isUser = response.messageType === MessageType.USER;
  const isProcessing = response.messageType === MessageType.PROCESSING;
  const isAssistant = response.messageType === MessageType.ASSISTANT;

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isProcessing ? 'processing' : ''}`}>
      {!isUser && (
        <div className="avatar">
          {isProcessing ? '⚡' : '🤖'}
        </div>
      )}
      
      <div className="message-content">
        {isUser && response.attachedFile && (
          <FileAttachment file={response.attachedFile} />
        )}
        
        <div className="message-text">
          {isProcessing ? (
            <>
              <span className="processing-text">{response.content}</span>
              <TypingIndicator />
            </>
          ) : (
            response.content
          )}
        </div>

        {isAssistant && response.testCategories.length > 0 && (
          <div className="test-cases-action">
            <button onClick={() => onOpenModal(response)} className="view-test-cases-btn">
              View Test Cases ({response.testCategories.length} categories)
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          {response.user?.image ? (
            <img src={response.user.image} alt={response.user.name || 'User Avatar'} />
          ) : (
            '👤'
          )}
        </div>
      )}
    </div>
  );
};

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
          {responses.length !== 0 ? (
            <div className="messages-container">
              {responses.map((response) => (
                <MessageBubble
                  key={response.id}
                  response={response}
                  onOpenModal={handleOpenModal}
                />
              ))}
            </div>
          ) : (
            <div className="empty-chat">
              <div className="welcome-message">
                <h2>Welcome to Test Case Generator</h2>
                <p>Upload a PRD document and I'll help you generate comprehensive test cases.</p>
              </div>
            </div>
          )}
        </main>
        <footer className="chat__layout__messages__footer"></footer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Test cases"
        content={
          <TestCaseWorkflow data={selectedTestCategory?.testCategories || []} />
        }
      />
    </section>
  );
};

export default ChatResponses;
