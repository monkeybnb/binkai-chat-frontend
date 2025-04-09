"use client";
import { useSocket } from "@/hooks/useSocket";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatContainer from "./components/ChatContainer";
import { ChatHeader } from "./components/chat-header";
import ChatSidebar from "./components/chat-sider";
import RightSidebar from "./components/right-sider";
const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpenRightSider, setIsOpenRightSider] = useState(false);
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");

  useEffect(() => {
    const sidebarState = localStorage.getItem("sidebarState");
    if (sidebarState) {
      setIsSidebarOpen(JSON.parse(sidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarState", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  return (
    <div className="flex w-screen overflow-hidden h-screen">
      <ChatSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="relative flex h-screen overflow-hidden flex-col flex-1">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          setIsOpenRightSider={setIsOpenRightSider}
        />
        <main className="flex-1 flex flex-col overflow-hidden relative items-center pt-6">
          <ChatContainer />
        </main>
      </div>
      <RightSidebar
        isOpenRightSider={isOpenRightSider}
        setIsOpenRightSider={setIsOpenRightSider}
      />
    </div>
  );
};

export default Chat;
