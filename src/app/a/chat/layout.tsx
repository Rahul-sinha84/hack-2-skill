import React from "react";
import { ChatProvider } from "./context/ChatContext";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return <ChatProvider>{children}</ChatProvider>;
};

export default ChatLayout;
