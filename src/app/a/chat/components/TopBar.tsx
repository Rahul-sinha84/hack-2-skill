"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { IoSunny, IoMoon } from "react-icons/io5";

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // You can add theme switching logic here later
  };

  const initial = session?.user?.isGuest
    ? "G"
    : (session?.user?.name?.charAt(0) || "U").toUpperCase();

  // Create proxy URL for Google profile images
  const getProxyImageUrl = (originalUrl: string) => {
    if (!originalUrl) return null;
    return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
  };

  return (
    <div className="chat__topbar">
      <div className="chat__topbar__inner">
        <div className="topbar__left">
          <img className="app__logo" src="/ai-logo.png" alt="App logo" />
        </div>
        <div className="topbar__right">
          <button
            className="topbar__theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <IoSunny /> : <IoMoon />}
          </button>
          <div className="topbar__avatar">
            {session?.user?.image && !session?.user?.isGuest && !avatarError ? (
              <img
                src={getProxyImageUrl(session.user.image) || session.user.image}
                alt={session.user.name || "User"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span className={session?.user?.isGuest ? "guest-avatar" : ""}>
                {initial}
              </span>
            )}
          </div>
          <button
            className="topbar__logout topbar__logout--gradient"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
