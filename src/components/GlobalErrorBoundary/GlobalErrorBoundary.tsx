"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by GlobalErrorBoundary:", error, errorInfo);
    }
    // In production, you could log to an error reporting service
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorDisplay error={this.state.error || new Error("Unknown error")} />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
