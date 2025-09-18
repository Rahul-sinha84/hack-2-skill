"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const JiraConnectPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code");
  const userId = searchParams.get("state");

  useEffect(() => {
    const fetchAccessToken = async () => {
      const response = await fetch("/api/jira/get-access-token", {
        method: "POST",
        body: JSON.stringify({ code, userId }),
      });
      //   const data = await response.json();
      router.push("/a/chat");
    };
    fetchAccessToken();
  }, [code, userId]);
  return <div>JiraConnectPage</div>;
};

export default JiraConnectPage;
