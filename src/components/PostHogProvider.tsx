"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";

interface PostHogProviderProps {
  children: React.ReactNode;
}

export default function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === "undefined") return;

    // Check if PostHog is already initialized
    if (posthog.__loaded) return;

    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      console.warn("PostHog environment variables are not set");
      return;
    }

    // Initialize PostHog
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2025-05-24",
    });
  }, []);

  // Capture pageviews on route changes
  useEffect(() => {
    if (typeof window === "undefined" || !posthog.__loaded) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", {
      $current_url: url,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

