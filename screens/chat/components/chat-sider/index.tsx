"use client";
import SocialLink from "@/components/common/SocialLink";
import { Edit, Menu } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useViewWidth } from "@/hooks/useViewWidthHeight";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { BlurMaskOverlay } from "./BlurMaskOverlay";
import { ChannelList } from "./ChannelList";

interface ChatSiderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

const ChatSidebar = ({ isSidebarOpen, setIsSidebarOpen }: ChatSiderProps) => {
  const router = useRouter();
  const viewWidth = useViewWidth();
  const isTabletScreen = viewWidth < 1024;

  return (
    <>
      {isTabletScreen && (
        <BlurMaskOverlay
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          "flex flex-col w-[300px] h-screen overflow-hidden border-r border-border transition-all duration-300",
          {
            "w-[0px]": !isSidebarOpen,
            "absolute left-0 z-[51] bg-background": isTabletScreen,
          }
        )}
        onClick={(e) => e.stopPropagation()}
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
            {/* <Button variant="ghost" size="icon" className="w-11 h-11">
              <Search />
            </Button> */}

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
    </>
  );
};

export default ChatSidebar;
