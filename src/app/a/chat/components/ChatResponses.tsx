"use client";

import React, { useState, useEffect } from "react";
import {
  ChatResponse,
  TestCategory,
  TestCase,
  MessageType,
} from "../context/ChatContext";
import "./_chat_responses.scss";
import Modal from "@/components/Modal";
import TestCaseWorkflow from "./TestCaseWorkflow/TestCaseWorkflow";
import DocumentAnalysisTags from "./MetricsDashboard";

interface ChatResponsesProps {
  responses: Array<
    ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  >;
  chatId?: string;
}

const TypingIndicator: React.FC = () => (
  <div className="typing-indicator">
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
);

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({
  text,
  speed = 30,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
};

const FileAttachment: React.FC<{
  file: { name: string; type: string; size: number };
}> = ({ file }) => (
  <div className="file-attachment">
    <div className="file-icon">📄</div>
    <div className="file-info">
      <span className="file-name">{file.name}</span>
      <span className="file-size">{Math.round(file.size / 1024)} KB</span>
    </div>
  </div>
);

// Define a single, shared color palette of vibrant, high-contrast colors
const HIGH_CONTRAST_PALETTE = [
  "#db2777", // Vibrant Pink
  "#0ea5e9", // Bright Sky Blue
  "#10b981", // Emerald Green
  "#f59e0b", // Amber Yellow
  "#7c3aed", // Rich Violet
  "#f97316", // Bright Orange
  "#ef4444", // Strong Red
];

const CategoryPieChart: React.FC<{
  categories: Array<TestCategory & { testCases: Array<TestCase> }>;
}> = ({ categories }) => {
  const data = categories.map((c) => ({
    label: c.label,
    count: c.testCases.length,
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const palette = HIGH_CONTRAST_PALETTE;

  const width = 200;
  const height = 200;
  const cx = width / 2;
  const cy = height / 2;
  const thickness = 40; // The width of the donut ring
  const radius = cx - thickness / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;

  const arcs = data.map((d, idx) => {
    const fraction = total === 0 ? 0 : d.count / total;
    const arcLength = fraction * circumference;

    const arcData = {
      key: `${d.label}-${idx}`,
      color: palette[idx % palette.length],
      dashArray: `${arcLength} ${circumference}`,
      offset: -cumulative,
    };

    // For the label positioning
    const midAngle =
      ((cumulative + arcLength / 2) / circumference) * Math.PI * 2 -
      Math.PI / 2;
    const labelR = radius;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);
    const percent = Math.round(fraction * 100);

    cumulative += arcLength;

    return {
      ...arcData,
      label: `${percent}%`,
      lx,
      ly,
      percent,
    };
  });

  return (
    <div className="category-pie">
      <div className="category-pie__chart">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Category distribution pie chart"
        >
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {/* Background track */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={thickness}
            />
            {arcs.map((a, idx) => (
              <circle
                key={a.key}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={a.color}
                strokeWidth={thickness}
                strokeDasharray={a.dashArray}
                strokeDashoffset={a.offset}
                className="category-pie__slice"
                style={{ animationDelay: `${idx * 100}ms` }}
              />
            ))}
          </g>
          {/* Text labels fade in after the chart draws */}
          {arcs.map(
            (a) =>
              a.percent > 5 && (
                <text
                  key={`${a.key}-label`}
                  x={a.lx}
                  y={a.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="category-pie__slice-label"
                  style={{ animationDelay: "1s" }} // Delay fade-in
                >
                  {a.label}
                </text>
              )
          )}
          {/* Total count in the center */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="category-pie__total-value"
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="category-pie__total-label"
          >
            Total Cases
          </text>
        </svg>
      </div>
    </div>
  );
};

const CategoryLegend: React.FC<{
  categories: Array<TestCategory & { testCases: Array<TestCase> }>;
}> = ({ categories }) => {
  const data = categories.map((c) => ({
    label: c.label,
    count: c.testCases.length,
  }));
  // Use the shared high-contrast palette
  const palette = HIGH_CONTRAST_PALETTE;

  return (
    <div className="category-legend">
      {data.map((d, idx) => (
        <div className="category-legend__chip" key={`${d.label}-chip-${idx}`}>
          <span
            className="category-legend__dot"
            style={{ backgroundColor: palette[idx % palette.length] }}
          />
          <span className="category-legend__label" title={d.label}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const ResponseActions: React.FC<{ text: string }> = ({ text }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  return (
    <div className="response-actions" aria-label="message actions">
      <button
        className={`response-action ${liked ? "active" : ""}`}
        onClick={() => {
          setLiked(!liked);
          if (!liked) setDisliked(false);
        }}
        title="Like"
        aria-label="Like"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 10h4v10H2V10Zm7 10h6.14c.8 0 1.52-.47 1.83-1.2l2.63-5.9c.65-1.47-.41-3.1-2.03-3.1h-4.5l.7-3.3.02-.22c0-.41-.17-.8-.44-1.07L12.17 4 7.59 8.59C7.22 8.95 7 9.45 7 10v8c0 1.1.9 2 2 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      <button
        className={`response-action ${disliked ? "active" : ""}`}
        onClick={() => {
          setDisliked(!disliked);
          if (!disliked) setLiked(false);
        }}
        title="Dislike"
        aria-label="Dislike"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 14h-4V4h4v10ZM15 4H8.86c-.8 0-1.52.47-1.83 1.2L4.4 11.1C3.74 12.57 4.8 14.2 6.42 14.2h4.5l-.7 3.3-.02.22c0 .41.17.8.44 1.07L11.83 20l4.58-4.59c.37-.36.59-.86.59-1.41V6c0-1.1-.9-2-2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  );
};

const MessageBubble: React.FC<{
  response: ChatResponse & {
    testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
  };
  onOpenModal: (
    response: ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  ) => void;
  showLoadingRing?: boolean;
}> = ({ response, onOpenModal, showLoadingRing = false }) => {
  const isUser = response.messageType === MessageType.USER;
  const isProcessing = response.messageType === MessageType.PROCESSING;
  const isAssistant = response.messageType === MessageType.ASSISTANT;

  // Extract latency line (e.g., "Generated in 8.4 seconds.") from assistant content
  // Make emoji optional and support "second"/"seconds" with optional dot
  let mainText = response.content;
  let latencyLine: string | null = null;
  if (isAssistant && typeof response.content === "string") {
    const match = response.content.match(
      /(?:^|\s)\s*(?:✨\s*)?Generated in\s*[\d.]+\s*seconds?\.?/i
    );
    if (match) {
      const matchedText = match[0].trim();
      latencyLine = matchedText.startsWith("✨")
        ? matchedText
        : `✨ ${matchedText.replace(/^✨\s*/, "")}`;
      mainText = response.content.replace(match[0], "").trim();
    }
  }

  const totalTestCases = isAssistant
    ? response.testCategories.reduce((sum, c) => sum + c.testCases.length, 0)
    : 0;

  return (
    <div
      className={`message-bubble ${isUser ? "user" : "assistant"} ${
        isProcessing ? "processing" : ""
      }`}
    >
      {!isUser && (
        <div className="avatar">
          <img
            src="/ai-orb.png"
            alt="AI"
            width={28}
            height={28}
            onError={(e) => {
              // Fallback to a simple sparkle emoji if image missing
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) parent.textContent = "✨";
            }}
          />
        </div>
      )}

      <div className="message-content">
        {isUser && response.attachedFile && (
          <FileAttachment file={response.attachedFile} />
        )}

        {/* Conditional rendering for new assistant layout vs. standard text */}
        {isAssistant && response.testCategories.length > 0 ? (
          <div className="assistant-layout">
            <div className="assistant-layout__left">
              <h3 className="description-title">Description</h3>
              <div className="message-text">
                <TypewriterText text={mainText} speed={25} />
              </div>
              <div className="test-cases-action">
                <button
                  onClick={() => onOpenModal(response)}
                  className="view-test-cases-btn"
                >
                  View Test Cases
                </button>
              </div>
            </div>
            <div className="assistant-layout__right">
              <div className="chart-dashboard">
                <h3 className="chart-title">Test Case Categories</h3>
                <div className="chart-container">
                  <CategoryPieChart categories={response.testCategories} />
                  <CategoryLegend categories={response.testCategories} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`message-text ${(() => {
              const t =
                typeof mainText === "string" ? mainText.toLowerCase() : "";
              const isInfo =
                isAssistant &&
                (t.includes("response to a message without a file") ||
                  t.includes(
                    "failed to process document and generate test cases"
                  ));
              return isInfo ? "message-text--no-file" : "";
            })()}`}
          >
            {isProcessing ? (
              <>
                <span className="processing-text">{response.content}</span>
                <TypingIndicator />
              </>
            ) : (
              mainText
            )}
          </div>
        )}

        {isAssistant && (
          <div className="message-footer">
            <div className="message-footer__left">
              {latencyLine && (
                <div className="message-meta">
                  <em>{latencyLine}</em>
                </div>
              )}
              {response.enhancedMetadata && (
                <DocumentAnalysisTags
                  totalPages={response.enhancedMetadata.totalPages}
                  requirementsCount={response.enhancedMetadata.requirementsCount}
                  pagesWithCompliance={response.enhancedMetadata.pagesWithCompliance}
                  pagesWithPII={response.enhancedMetadata.pagesWithPII}
                />
              )}
            </div>
            <ResponseActions
              text={typeof mainText === "string" ? mainText : ""}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div
          className={`avatar user-avatar ${showLoadingRing ? "loading" : ""}`}
        >
          {(() => {
            console.log("Rendering user avatar, user data:", response.user);
            console.log("Has image?", !!response.user?.image);
            console.log("Image URL:", response.user?.image);

            if (response.user?.image) {
              return (
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(
                    response.user.image
                  )}`}
                  alt={response.user.name || "User Avatar"}
                  onError={(e) => {
                    console.error(
                      "❌ Image failed to load:",
                      response.user?.image
                    );
                    console.error("Error event:", e);
                    // Hide the broken image and show fallback
                    (e.target as HTMLImageElement).style.display = "none";
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement("span");
                      fallback.className = "avatar-initials";
                      fallback.textContent =
                        response.user?.name?.charAt(0)?.toUpperCase() || "👤";
                      parent.appendChild(fallback);
                    }
                  }}
                  onLoad={() => {
                    console.log(
                      "✅ Image loaded successfully:",
                      response.user?.image
                    );
                  }}
                />
              );
            } else {
              console.log(
                "No image available, showing initials for:",
                response.user?.name
              );
              return (
                <span className="avatar-initials">
                  {response.user?.name?.charAt(0)?.toUpperCase() || "👤"}
                </span>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

// Removed RotatingText - now showing actual processing stages from updateProcessingMessage

const ResponseSkeleton: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="message-bubble assistant skeleton-bubble">
      <div className="avatar">
        <img
          src="/ai-orb.png"
          alt="AI"
          width={28}
          height={28}
          onError={(e) => {
            // Fallback to a simple sparkle emoji if image missing
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) parent.textContent = "✨";
          }}
        />
      </div>
      <div className="message-content">
        <div className="processing-header">
          <div className="processing-estimate">
            <span className="estimate-text">This usually takes 2 minutes</span>
          </div>
          <div className="processing-rotating-text">
            <span className="rotating-text">{content}</span>
          </div>
          <TypingIndicator />
        </div>
      </div>
    </div>
  );
};

const ChatResponses: React.FC<ChatResponsesProps> = ({ responses, chatId }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTestCategory, setSelectedTestCategory] = useState<
    | (ChatResponse & {
        testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
      })
    | null
  >(null);

  const isProcessing =
    responses.length > 0 &&
    responses[responses.length - 1].messageType === MessageType.PROCESSING;
  const processingMessage = isProcessing
    ? responses[responses.length - 1]
    : null;

  const handleOpenModal = (
    testCategory: ChatResponse & {
      testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
    }
  ) => {
    setSelectedTestCategory(testCategory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestCategory(null);
  };

  return (
    <section className="chat__layout__responses">
      <div className="chat__layout__responses__container">
        <header className="chat__layout__responses__header"></header>
        <main className="chat__layout__responses__main">
          {responses.length !== 0 ? (
            <div className="messages-container">
              {responses.map((response, idx) => {
                // Hide the original, simple processing bubble
                if (response.messageType === MessageType.PROCESSING) {
                  return null;
                }
                const showLoadingRing =
                  responses.length >= 2 &&
                  idx === responses.length - 2 &&
                  responses[responses.length - 1].messageType ===
                    MessageType.PROCESSING &&
                  response.messageType === MessageType.USER;
                return (
                  <MessageBubble
                    key={response.id}
                    response={response}
                    onOpenModal={handleOpenModal}
                    showLoadingRing={showLoadingRing}
                  />
                );
              })}
              {/* Render the combined skeleton bubble instead */}
              {isProcessing && processingMessage && (
                <ResponseSkeleton content={processingMessage.content} />
              )}
            </div>
          ) : (
            <div className="empty-chat">
              <div className="welcome-message">
                <h2>Welcome to <span className="brand-text">TestAI</span></h2>
                <p>
                  Upload a PRD document and I'll help you generate comprehensive
                  test cases.
                </p>
              </div>
            </div>
          )}
        </main>
        <footer className="chat__layout__messages__footer"></footer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Test Categories"
        // className="no-scroll-modal"
        content={
          <TestCaseWorkflow data={selectedTestCategory?.testCategories || []} />
        }
      />
    </section>
  );
};

export default ChatResponses;
