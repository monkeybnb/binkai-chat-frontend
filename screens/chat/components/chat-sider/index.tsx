"use client";
import SocialLink from "@/components/common/SocialLink";
import { Edit, Menu, Search } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ChannelList } from "./ChannelList";

const ChatSidebar = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col w-[300px] h-screen overflow-hidden border-r border-border transition-all duration-300",
        {
          "w-[0px]": !isSidebarOpen,
        }
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-11 h-11"
        >
          <Menu />
        </Button>

        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="w-11 h-11">
            <Search />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-11 h-11"
            onClick={() => router.push("/")}
          >
            <Edit />
          </Button>
        </div>
      </div>
      <ChannelList />
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-body-xsmall whitespace-nowrap">
          © 2025 BINK AI
        </span>
        <SocialLink />
      </div>
    </div>
  );
};

export default ChatSidebar;
