import React from 'react';
import Link from 'next/link';
const Logo = () => (
  <Link href="/">
    <div className="h-16 flex flex-col items-center justify-center text-white">
      {/* 상단 텍스트 */}
      <div
        className="text-3xl font-bold tracking-widest"
        style={{
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.3em',
          textShadow: '0 0 4px black', // 윤곽선 추가
          marginTop: '4px', // 아래로 내림
        }}
      >
        FREE SIZE
      </div>
      {/* 하단 텍스트 */}
      <div
        className="text-[10px] font-light tracking-[0.15em] "
        style={{
          fontFamily: 'Arial, sans-serif',
          color: '#FF6B3D',
          textShadow: '0 0 1px black', // 윤곽선 추가
        }}
      >
        IMAGE PREPROCESSING
      </div>
    </div>
  </Link>
);

export default Logo;
