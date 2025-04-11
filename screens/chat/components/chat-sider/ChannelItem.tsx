import { Delete } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useHover from "@/hooks/useHover";
import { useViewWidth } from "@/hooks/useViewWidthHeight";
import { cn } from "@/lib/utils";
import { Thread, useChatStore } from "@/stores";
import { useLayoutStore } from "@/stores/layout-store";
import { MoreVertical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ChannelItem = ({ thread }: { thread: Thread }) => {
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get("threadId");
  const router = useRouter();
  const { deleteThread } = useChatStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { refWrapper, isHover } = useHover();
  const viewWidth = useViewWidth();
  const isTabletScreen = viewWidth < 1024;

  const { setIsSidebarOpen } = useLayoutStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await deleteThread(thread.id);
    } catch (error) {
      console.error("Error deleting thread:", error);
    } finally {
      setIsDeleting(false);
      router.push("/");
    }
  };

  return (
    <div
      className={cn(
        "hover:bg-muted relative rounded-lg cursor-pointer px-3 py-2 flex items-center justify-between group h-10 ",
        thread.id === selectedThreadId && "bg-muted"
      )}
      ref={refWrapper}
      onClick={() => {
        isTabletScreen && setIsSidebarOpen(false);
        const url = new URL(window.location.href);
        url.searchParams.set("threadId", thread.id);
        window.history.pushState({}, "", url.toString());
        router.replace(url.toString(), { scroll: false });
      }}
    >
      <div className="truncate text-body-small flex-1">{thread.title}</div>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          {(isHover || open || isTabletScreen) && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[148px] rounded-xl z-[100]"
          side="right"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-destructive hover:bg-muted h-10 rounded-lg px-2 py-2.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(e);
            }}
          >
            <Delete /> {isDeleting ? "Deleting..." : "Delete"}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChannelItem;
