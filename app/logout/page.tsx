"use client";

import { useNetworkConnect } from "@/hooks/useNetworkConnect";
import { useEffect } from "react";
const LogoutPage = () => {
  const { handleDisconnectAll } = useNetworkConnect();

  const handleLogout = async () => {
    console.log("logout");
    await handleDisconnectAll();
  };

  useEffect(() => {
    setTimeout(() => {
      handleLogout();
    }, 1000);
  }, []);
  return null;
};

export default LogoutPage;
