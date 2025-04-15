"use client";

import { Thread, useThreads } from "@/stores";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import ChannelGroup from "./ChannelGroup";

const ChannelListSkeleton = () => (
  <div className="flex flex-col gap-2 flex-1 overflow-y-auto p-4">
    <div className="animate-pulse h-9 bg-muted rounded-md" />
    <div className="animate-pulse h-9 bg-muted rounded-md" />
    <div className="animate-pulse h-9 bg-muted rounded-md" />
  </div>
);

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
  const searchParams = useSearchParams();
  const threadId = searchParams.get("threadId");
  const { threads, isLoading, hasMore, fetchMoreThreads } = useThreads(
    threadId as string
  );
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
