"use client";
import { useLayoutStore } from "@/stores/layout-store";
import ChatContainer from "./components/ChatContainer";
import { ChatHeader } from "./components/chat-header";
import ChatSider from "./components/chat-sider";
import RightSider from "./components/right-sider";

export default function ChatScreen() {
  const {
    isSidebarOpen,
    isOpenRightSider,
    setIsSidebarOpen,
    setIsOpenRightSider,
  } = useLayoutStore();

  return (
    <div className="flex h-screen">
      <ChatSider
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col relative">
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          isOpenRightSider={isOpenRightSider}
          setIsSidebarOpen={setIsSidebarOpen}
          setIsOpenRightSider={setIsOpenRightSider}
        />
        <ChatContainer />
      </div>
      <RightSider
        isOpenRightSider={isOpenRightSider}
        setIsOpenRightSider={setIsOpenRightSider}
      />
    </div>
  );
}
