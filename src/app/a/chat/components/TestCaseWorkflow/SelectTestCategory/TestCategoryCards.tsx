"use client";

import React from "react";
import "./_test_category_cards.scss";
import {
  TestCategory,
  TestCase,
  TestCaseStatus,
  useChat,
} from "../../../context/ChatContext";

interface TestCategoryCardsProps {
  data: TestCategory & { testCases: Array<TestCase> };
  onSelect: (
    testCategory: TestCategory & { testCases: Array<TestCase> }
  ) => void;
}

const TestCategoryCards: React.FC<TestCategoryCardsProps> = ({
  data,
  onSelect,
}) => {
  const { getTestCasesByTestCategoryId } = useChat();
  const testCases = getTestCasesByTestCategoryId(data.id);

  const calculateProgress = (testCases: Array<TestCase>) => {
    const total = testCases.length;
    const approved = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.APPROVED
    ).length;
    const rejected = testCases.filter(
      (testCase) => testCase.status === TestCaseStatus.REJECTED
    ).length;
    const pending = total - approved - rejected;
    return { approved, rejected, pending, total };
  };
  const { approved, rejected, pending, total } = calculateProgress(testCases);

  const getCategoryBorderColor = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('functional')) return 'functional';
    if (lowerLabel.includes('performance')) return 'performance';
    if (lowerLabel.includes('security')) return 'security';
    if (lowerLabel.includes('ui') || lowerLabel.includes('ux')) return 'ui-ux';
    if (lowerLabel.includes('integration')) return 'integration';
    if (lowerLabel.includes('api')) return 'api';
    if (lowerLabel.includes('compliance')) return 'compliance';
    return 'default';
  };

  const generateMiniChart = (category: string) => {
    // Generate realistic performance data based on category type
    const points = [];
    const width = 100;
    const height = 60;
    const dataPoints = 15;
    
    // Different patterns for different categories
    const getYValue = (index: number, category: string): number => {
      const lowerCategory = category.toLowerCase();
      const x = index / (dataPoints - 1); // Normalize x to 0-1
      
      if (lowerCategory.includes('performance')) {
        // Performance: Show optimization curve (improving over time)
        return height - 15 - (Math.sin(x * Math.PI) * 15 + x * 20);
      } else if (lowerCategory.includes('security')) {
        // Security: Show vulnerability detection (spikes)
        return height - 20 - Math.sin(x * Math.PI * 3) * 10 - Math.random() * 8;
      } else if (lowerCategory.includes('functional')) {
        // Functional: Show test coverage growth
        return height - 15 - (x * 25 + Math.sin(x * Math.PI * 2) * 5);
      } else if (lowerCategory.includes('ui') || lowerCategory.includes('ux')) {
        // UI/UX: Show user satisfaction curve
        return height - 20 - (Math.pow(x, 0.7) * 20 + Math.sin(x * Math.PI * 4) * 3);
      } else {
        // Default: Steady progress with minor fluctuations
        return height - 18 - (x * 15 + Math.sin(x * Math.PI * 2) * 7);
      }
    };
    
    for (let i = 0; i < dataPoints; i++) {
      const x = (i * width) / (dataPoints - 1);
      const y = Math.max(5, Math.min(height - 5, getYValue(i, category)));
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    
    return points.join(' ');
  };

  return (
    <button
      onClick={() => onSelect({ ...data, testCases })}
      key={data.id}
      className={`test-category-card test-category-card--${getCategoryBorderColor(data.label)}`}
    >
      <div className="test-category-card__header">
        <div className="test-category-card__title-container">
          <span className="test-category-card__title-badge">{data.label}</span>
        </div>
        <div className="test-category-card__count-badge">
          {total}
        </div>
      </div>

      <div className="test-category-card__description">
        {data.description}
      </div>

      <div className="test-category-card__chart">
        <svg width="100%" height="60" viewBox="0 0 100 60">
          <defs>
            <linearGradient id={`gradient-${data.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={generateMiniChart(data.label)}
          />
          <polyline
            fill={`url(#gradient-${data.id})`}
            stroke="none"
            points={`0,60 ${generateMiniChart(data.label)} 100,60`}
          />
        </svg>
      </div>

      <div className="test-category-card__footer">
        <div className="test-category-card__status">
          <span className="test-category-card__status-text">
            {approved} of {total} approved
          </span>
        </div>
        <div className="test-category-card__progress-bar">
          <div 
            className="test-category-card__progress-fill"
            style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default TestCategoryCards;
