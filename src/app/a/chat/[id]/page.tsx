import React from "react";
import SmoothChatLayout from "../components/SmoothChatLayout";

interface ChatIDPageProps {
  params: {
    id: string;
  };
}

const ChatIDPage: React.FC<ChatIDPageProps> = async ({ params }) => {
  const { id } = await params;
  return <SmoothChatLayout />;
};

export default ChatIDPage;
