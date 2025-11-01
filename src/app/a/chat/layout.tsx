import React from "react";
import { ChatProvider } from "./context/ChatContext";
import PostHogProvider from "@/components/PostHogProvider";
import "@/app/a/chat/styles/_chat.scss";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <PostHogProvider>
      <ChatProvider>{children}</ChatProvider>
    </PostHogProvider>
  );
};

export default ChatLayout;
