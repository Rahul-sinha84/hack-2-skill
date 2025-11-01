"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useReloadWarning = (enabled: boolean = true) => {
  const pathname = usePathname();

  useEffect(() => {
    // Check if current path should show reload warning
    const shouldShowWarning =
      enabled &&
      (pathname === "/a/chat" || pathname?.startsWith("/a/chat/"));

    if (!shouldShowWarning) return;

    // Handle browser refresh/close - shows native browser alert
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages, but returnValue is required
      // This will show the browser's native confirmation dialog
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, enabled]);
};

