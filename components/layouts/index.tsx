"use client";

import { useEffect, useState } from "react";
import { Toaster } from "../ui/sonner";
import RequiredConnectedWallet from "./RequiredConnectedWallet";

const CustomLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RequiredConnectedWallet>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "16px",
            backgroundColor: "var(--shade-L90)",
            color: "var(--pallete-950)",
            height: "36px",
            width: "fit-content",
          },
        }}
      />
    </RequiredConnectedWallet>
  );
};

export default CustomLayout;
