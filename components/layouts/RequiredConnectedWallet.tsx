"use client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Loader } from "lucide-react";
import Onboarding from "../common/Onboarding";
function RequiredConnectedWallet({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="relative flex-1 h-screen w-screen">
        <div className="flex items-center justify-center h-full ">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  const isNotConnected = !isAuthenticated && !isLoading;

  if (isNotConnected) {
    return <Onboarding />;
  }

  return (
    <div
      className={cn("overflow-hidden flex-1 w-screen h-screen flex flex-col", {
        "filter blur-[2px] pointer-events-none": isNotConnected,
      })}
    >
      {children}
    </div>
  );
}

export default RequiredConnectedWallet;
