// components/SummaryCards.tsx
import React from 'react';

interface SummaryCardsProps {
  totalCount: number;
  successCount: number;
  failureCount: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCount,
  successCount,
  failureCount,
}) => {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-[#333333]/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
        <div className="text-3xl font-bold mb-1">{totalCount}</div>
        <div className="text-sm text-gray-400 font-medium">전체 요청</div>
      </div>

      <div className="bg-emerald-900/10 rounded-lg p-6 backdrop-blur-sm border border-emerald-800/30">
        <div className="text-3xl font-bold text-emerald-400 mb-1">
          {successCount}
        </div>
        <div className="text-sm text-gray-400 font-medium">성공</div>
      </div>

      <div className="bg-red-900/10 rounded-lg p-6 backdrop-blur-sm border border-red-800/30">
        <div className="text-3xl font-bold text-red-400 mb-1">
          {failureCount}
        </div>
        <div className="text-sm text-gray-400 font-medium">실패</div>
      </div>
    </div>
  );
};

export default SummaryCards;
