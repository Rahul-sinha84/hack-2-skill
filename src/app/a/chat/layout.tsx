import React from "react";
import { ChatProvider } from "./context/ChatContext";
import "@/app/a/chat/styles/_chat.scss";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return <ChatProvider>{children}</ChatProvider>;
};

export default ChatLayout;
