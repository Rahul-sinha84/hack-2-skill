"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const TopBar: React.FC = () => {
  const { data: session } = useSession();
  const [avatarError, setAvatarError] = useState<boolean>(false);

  const initial = (session?.user?.name?.charAt(0) || "U").toUpperCase();

  return (
    <div className="chat__topbar">
      <div className="chat__topbar__inner">
        <div className="topbar__left">
          <img className="app__logo" src="/globe.svg" alt="App logo" />
        </div>
        <div className="topbar__right">
          <div className="topbar__avatar">
            {session?.user?.image && !avatarError ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <button
            className="topbar__logout"
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


