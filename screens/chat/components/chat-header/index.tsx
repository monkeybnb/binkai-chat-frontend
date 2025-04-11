"use client";

import { Edit, LogoText, Menu } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useViewWidth } from "@/hooks/useViewWidthHeight";
import { useRouter } from "next/navigation";
import UserBtn from "./UserBtn";

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  isOpenRightSider: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  setIsOpenRightSider: (value: boolean) => void;
}

export function ChatHeader({
  isSidebarOpen,
  isOpenRightSider,
  setIsSidebarOpen,
  setIsOpenRightSider,
}: ChatHeaderProps) {
  const router = useRouter();
  const viewWidth = useViewWidth();
  const isMobile = viewWidth < 768;

  return (
    <header className="flex w-full items-center justify-between px-6 gap-4 h-[76px]">
      <div className="flex items-center gap-4">
        {!isSidebarOpen ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-11 h-11 rounded-xl"
            >
              <Menu />
            </Button>
            {!isMobile && (
              <Button
                variant="outline"
                size="icon"
                className="w-11 h-11 rounded-xl"
                onClick={() => router.push("/")}
              >
                <Edit />
              </Button>
            )}
          </div>
        ) : null}

        <LogoText className="text-sm md:text-base" />
      </div>

      <div className="flex items-center gap-4">
        <UserBtn onClick={() => setIsOpenRightSider(!isOpenRightSider)} />
      </div>
    </header>
  );
}
