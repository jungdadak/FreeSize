// components/Transform/ProcessingSummary/QueueOverlay.tsx
import { Loader2 } from 'lucide-react';

/**
 * 특정 구역만 오버레이로 덮는 용도
 * parent container는 반드시 "position: relative"여야 함.
 */
export function QueueOverlay() {
  return (
    <div
      className="
        absolute inset-0 z-10 
        flex items-center justify-center
        bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600
        bg-opacity-30 backdrop-blur-sm
      "
    >
      {/* 스트라이프 효과를 쓰고 싶다면 아래 div 추가 */}
      {/* <div className="stripes-bg absolute inset-0 opacity-10"></div> */}

      <div className="relative flex flex-col items-center">
        {/* 커스텀 스피너(회전) */}
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="mt-2 text-white font-semibold text-sm">처리중...</p>
      </div>
    </div>
  );
}
