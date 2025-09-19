"use client";

import React, { useState, useEffect } from "react";
import { ChatResponse, TestCategory, TestCase, MessageType } from "../context/ChatContext";
import "./_chat_responses.scss";
import Modal from "@/components/Modal";
import TestCaseWorkflow from "./TestCaseWorkflow/TestCaseWorkflow";

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

const TypewriterText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <span>{displayedText}</span>;
};

const FileAttachment: React.FC<{ file: { name: string; type: string; size: number } }> = ({ file }) => (
  <div className="file-attachment">
    <div className="file-icon">
      📄
    </div>
    <div className="file-info">
      <span className="file-name">{file.name}</span>
      <span className="file-size">{Math.round(file.size / 1024)} KB</span>
    </div>
  </div>
);

// Define a single, shared color palette of vibrant, high-contrast colors
const HIGH_CONTRAST_PALETTE = [
  '#db2777', // Vibrant Pink
  '#0ea5e9', // Bright Sky Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber Yellow
  '#7c3aed', // Rich Violet
  '#f97316', // Bright Orange
  '#ef4444',  // Strong Red
];

const CategoryPieChart: React.FC<{ categories: Array<TestCategory & { testCases: Array<TestCase> }> }> = ({ categories }) => {
  const data = categories.map((c) => ({ label: c.label, count: c.testCases.length }));
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
    const midAngle = (cumulative + arcLength / 2) / circumference * Math.PI * 2 - Math.PI / 2;
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
    }
  });

  return (
    <div className="category-pie">
      <div className="category-pie__chart">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Category distribution pie chart">
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
          {arcs.map(a => 
            a.percent > 5 && (
              <text
                key={`${a.key}-label`}
                x={a.lx}
                y={a.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="category-pie__slice-label"
                style={{ animationDelay: '1s' }} // Delay fade-in
              >
                {a.label}
              </text>
            )
          )}
          {/* Total count in the center */}
          <text x={cx} y={cy - 8} textAnchor="middle" className="category-pie__total-value">{total}</text>
          <text x={cx} y={cy + 18} textAnchor="middle" className="category-pie__total-label">Total Cases</text>
        </svg>
      </div>
    </div>
  );
};

const CategoryLegend: React.FC<{ categories: Array<TestCategory & { testCases: Array<TestCase> }> }> = ({ categories }) => {
  const data = categories.map((c) => ({ label: c.label, count: c.testCases.length }));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  // Use the shared high-contrast palette
  const palette = HIGH_CONTRAST_PALETTE;

  return (
    <div className="category-legend">
      {data.map((d, idx) => {
        const percent = total === 0 ? 0 : Math.round((d.count / total) * 100);
        return (
          <div className="category-legend__chip" key={`${d.label}-chip-${idx}`}>
            <span className="category-legend__dot" style={{ backgroundColor: palette[idx % palette.length] }} />
            <span className="category-legend__label" title={d.label}>{d.label}</span>
            <span className="category-legend__percent">{percent}%</span>
          </div>
        );
      })}
    </div>
  );
};


const MessageBubble: React.FC<{
  response: ChatResponse & {
    testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
  };
  onOpenModal: (response: ChatResponse & {
    testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
  }) => void;
}> = ({ response, onOpenModal }) => {
  const isUser = response.messageType === MessageType.USER;
  const isProcessing = response.messageType === MessageType.PROCESSING;
  const isAssistant = response.messageType === MessageType.ASSISTANT;

  // Extract latency line (e.g., "✨ Generated in 8.4 seconds.") from assistant content
  let mainText = response.content;
  let latencyLine: string | null = null;
  if (isAssistant && typeof response.content === 'string') {
    const match = response.content.match(/✨\s*Generated in\s*[\d.]+\s*seconds\.?/i);
    if (match) {
      latencyLine = match[0];
      mainText = response.content.replace(match[0], '').trim();
    }
  }

  const totalTestCases = isAssistant
    ? response.testCategories.reduce((sum, c) => sum + c.testCases.length, 0)
    : 0;

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'} ${isProcessing ? 'processing' : ''}`}>
      {!isUser && (
        <div className="avatar">
          {isProcessing ? '⚡' : '🤖'}
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
                 <button onClick={() => onOpenModal(response)} className="view-test-cases-btn">
                   View Test Cases
                 </button>
               </div>
             </div>
             <div className="assistant-layout__right">
               <h3 className="chart-title">Test Case Categories</h3>
               <CategoryPieChart categories={response.testCategories} />
               <CategoryLegend categories={response.testCategories} />
             </div>
           </div>
        ) : (
          <div className="message-text">
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

        {isAssistant && latencyLine && (
          <div className="message-meta">
            <em>{latencyLine}</em>
          </div>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          {(() => {
            console.log('Rendering user avatar, user data:', response.user);
            console.log('Has image?', !!response.user?.image);
            console.log('Image URL:', response.user?.image);
            
            if (response.user?.image) {
              return (
                <img 
                  src={response.user.image} 
                  alt={response.user.name || 'User Avatar'}
                  onError={(e) => {
                    console.error('❌ Image failed to load:', response.user?.image);
                    console.error('Error event:', e);
                    // Hide the broken image and show fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const fallback = document.createElement('span');
                      fallback.className = 'avatar-initials';
                      fallback.textContent = response.user?.name?.charAt(0)?.toUpperCase() || '👤';
                      parent.appendChild(fallback);
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully:', response.user?.image);
                  }}
                />
              );
            } else {
              console.log('No image available, showing initials for:', response.user?.name);
              return (
                <span className="avatar-initials">
                  {response.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                </span>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

const ResponseSkeleton: React.FC<{ content: string }> = ({ content }) => (
  <div className="message-bubble assistant skeleton-bubble">
    <div className="avatar">🤖</div>
    <div className="message-content">
      <div className="processing-header">
        <span className="processing-text">{content}</span>
        <TypingIndicator />
      </div>
      <div className="skeleton skeleton-line" />
    </div>
  </div>
);

const ChatResponses: React.FC<ChatResponsesProps> = ({ responses, chatId }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTestCategory, setSelectedTestCategory] = useState<
    | (ChatResponse & {
        testCategories: Array<TestCategory & { testCases: Array<TestCase> }>;
      })
    | null
  >(null);

  const isProcessing = responses.length > 0 && responses[responses.length - 1].messageType === MessageType.PROCESSING;
  const processingMessage = isProcessing ? responses[responses.length - 1] : null;

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
              {responses.map((response) => {
                // Hide the original, simple processing bubble
                if (response.messageType === MessageType.PROCESSING) {
                  return null;
                }
                return (
                  <MessageBubble
                    key={response.id}
                    response={response}
                    onOpenModal={handleOpenModal}
                  />
                );
              })}
              {/* Render the combined skeleton bubble instead */}
              {isProcessing && processingMessage && <ResponseSkeleton content={processingMessage.content} />}
            </div>
          ) : (
            <div className="empty-chat">
              <div className="welcome-message">
                <h2>Welcome to Test Case Generator</h2>
                <p>Upload a PRD document and I'll help you generate comprehensive test cases.</p>
              </div>
            </div>
          )}
        </main>
        <footer className="chat__layout__messages__footer"></footer>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Test cases"
        content={
          <TestCaseWorkflow data={selectedTestCategory?.testCategories || []} />
        }
      />
    </section>
  );
};

export default ChatResponses;

