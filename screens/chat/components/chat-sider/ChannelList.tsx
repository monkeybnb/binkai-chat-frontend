"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Thread, useThreads } from "@/stores";
import { MoreVertical } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const ChannelListSkeleton = () => (
  <div className="flex flex-col gap-2 flex-1 overflow-y-auto p-4">
    <div className="animate-pulse h-9 bg-muted rounded-md" />
    <div className="animate-pulse h-9 bg-muted rounded-md" />
    <div className="animate-pulse h-9 bg-muted rounded-md" />
  </div>
);

const ChannelItem = ({ thread }: { thread: Thread }) => {
  const searchParams = useSearchParams();
  const selectedThreadId = searchParams.get("threadId");
  const router = useRouter();

  return (
    <div
      className={cn(
        "hover:bg-muted rounded-lg cursor-pointer px-3 py-2 flex items-center justify-between group h-10",
        thread.id === selectedThreadId && "bg-muted"
      )}
      onClick={() => {
        const url = new URL(window.location.href);
        url.searchParams.set("threadId", thread.id);
        window.history.pushState({}, "", url.toString());
        router.replace(url.toString(), { scroll: false });
      }}
    >
      <div className="truncate text-body-small flex-1">{thread.title}</div>
      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7 hidden group-hover:block"
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
    </div>
  );
};

const LABEL = {
  today: "Today",
  yesterday: "Yesterday",
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  pinned: "Pinned",
};

const ChannelGroup = ({
  labelKey,
  values,
}: {
  labelKey: string;
  values: Thread[];
}) => {
  if (!values?.length) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="text-label-small text-muted-foreground px-3">
        {LABEL[labelKey as keyof typeof LABEL]}
      </div>
      <div className="flex flex-col gap-1">
        {values.map((value) => (
          <ChannelItem key={value.id} thread={value} />
        ))}
      </div>
    </div>
  );
};

const groupByTimeframe = (threads: Thread[]) => {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = todayStart - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = todayStart - 30 * 24 * 60 * 60 * 1000;

  const grouped = {
    today: [] as Thread[],
    yesterday: [] as Thread[],
    last_7_days: [] as Thread[],
    last_30_days: [] as Thread[],
  };

  threads.forEach((thread) => {
    const updatedAt = new Date(thread.updated_at).getTime();
    if (updatedAt >= todayStart) {
      grouped.today.push(thread);
    } else if (updatedAt >= yesterdayStart && updatedAt < todayStart) {
      grouped.yesterday.push(thread);
    } else if (updatedAt >= sevenDaysAgo && updatedAt < yesterdayStart) {
      grouped.last_7_days.push(thread);
    } else if (updatedAt >= thirtyDaysAgo && updatedAt < sevenDaysAgo) {
      grouped.last_30_days.push(thread);
    }
  });

  return {
    ...grouped,
    shouldRefetch: Object.keys(grouped)
      .reverse()
      .find((key) => grouped[key as keyof typeof grouped].length > 0),
  };
};

export const ChannelList = () => {
  const { threads, isLoading, hasMore, fetchMoreThreads } = useThreads();
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          fetchMoreThreads();
        }
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, fetchMoreThreads]);

  if (isLoading && !threads.length) {
    return <ChannelListSkeleton />;
  }

  const groupedThreads = groupByTimeframe(threads);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {Object.entries(groupedThreads).map(([key, values]) => {
        if (key === "shouldRefetch") return null;
        return (
          <ChannelGroup key={key} labelKey={key} values={values as Thread[]} />
        );
      })}

      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isLoading && <ChannelListSkeleton />}
        </div>
      )}
    </div>
  );
};
