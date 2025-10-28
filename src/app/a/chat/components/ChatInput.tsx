"use client";

import React, { useRef, useState } from "react";
import "./_chat_input.scss";
import { IoIosAttach } from "react-icons/io";
import { BiSolidSend } from "react-icons/bi";
import {
  showToastInfo,
  showToastError,
  showToastSuccess,
} from "@/components/ReactToastify/ReactToastify";

interface ChatInputProps {
  onSubmit: (message: string, file?: File, gdprMode?: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [gdprMode, setGdprMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const message = formData.get("message") as string;

    if (!message.trim() && !selectedFile) {
      showToastInfo("Please enter a message or upload a file");
      return;
    }

    onSubmit(message, selectedFile || undefined, gdprMode);
    // Clear the form after submission
    setMessage("");
    setSelectedFile(null);
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToastError("Please upload a PDF, TXT, or DOCX file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToastError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    showToastSuccess(`File "${file.name}" selected`);
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Manually trigger form submission if there's content
      if (message.trim() || selectedFile) {
        const form = e.currentTarget.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }
    }
    // If Shift+Enter, let the default behavior happen (new line)
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setMessage(e.currentTarget.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <article className="chat__input">
      <div className={`chat__input__container ${gdprMode ? 'gdpr-active' : ''}`}>
        <div className="prefix">
          <button
            type="button"
            className="attachment-icon"
            onClick={handleAttachmentClick}
            title="Upload file"
          >
            <i>
              <IoIosAttach />
            </i>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
        <main className="main">
          <div
            className={`drag-drop-area ${isDragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedFile && (
              <div className="selected-file">
                <span>{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="remove-file"
                >
                  ×
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="" id="chat-form">
              <div className="input-wrapper">
                <textarea
                  ref={textareaRef}
                  name="message"
                  value={message}
                  placeholder={
                    selectedFile
                      ? "Add a message about your file..."
                      : "Upload PRD document"
                  }
                  className="chat-input__textarea"
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  rows={1}
                />
              </div>
            </form>
          </div>
        </main>
        <div className="suffix">
          <div className="gdpr-toggle">
            <label className="gdpr-toggle__label" title={gdprMode ? "GDPR Mode: ON - Sensitive data protection enabled" : "GDPR Mode: OFF"}>
              <input
                type="checkbox"
                checked={gdprMode}
                onChange={(e) => setGdprMode(e.target.checked)}
                className="gdpr-toggle__input"
              />
              <span className="gdpr-toggle__switch">
                <span className="gdpr-toggle__slider"></span>
              </span>
              <span className="gdpr-toggle__text">
                <img
                  src={gdprMode ? "/shield.png" : "/shield-off.png"}
                  alt="Privacy Shield"
                  className="gdpr-toggle__icon"
                />
                <span className="gdpr-toggle__label-text">GDPR</span>
              </span>
            </label>
          </div>
          <button
            type="submit"
            className="send-button"
            title="Send message"
            disabled={!message.trim() && !selectedFile}
            form="chat-form" // Associate button with the form
          >
            <BiSolidSend />
          </button>
        </div>
      </div>
      {gdprMode && (
        <div className="gdpr-info">
          <span>All uploaded documents are processed securely and anonymized in compliance with GDPR</span>
        </div>
      )}
    </article>
  );
};

export default ChatInput;
