"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HiExclamationCircle } from "react-icons/hi2";
import "./_error_display.scss";

interface ErrorDisplayProps {
  error: Error & { digest?: string };
  reset?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, reset }) => {
  const router = useRouter();

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="error-display">
      <div className="error-display__container">
        <div className="error-display__icon">
          <HiExclamationCircle />
        </div>

        <h1 className="error-display__title">Something went wrong</h1>

        <p className="error-display__subtext">
          Try reloading the page or go back to the home page.
        </p>

        <div className="error-display__actions">
          <button
            className="error-display__button error-display__button--primary"
            onClick={handleReload}
            type="button"
          >
            Reload
          </button>

          <button
            className="error-display__button error-display__button--secondary"
            onClick={handleGoHome}
            type="button"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
