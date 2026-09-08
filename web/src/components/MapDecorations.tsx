/**
 * 地图边缘的水彩装饰插画 —— 致敬《中国山河锦绣》参考图。
 * 元素：墨线飞鸟 / 朱红日轮 / 祥云纹 / 远山雾霭 / 海上帆船 / 朱印。
 * 仅在全国视野（低 zoom）出现，放大细看街道时整体淡出，不干扰档案阅读。
 */
import { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';

/** 手绘感飞鸟：两笔弧线 */
function Bird({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 34 12" className={className} style={style} fill="none" aria-hidden>
      <path d="M1 9 Q 8 1, 16 7 Q 17 8, 18 7 Q 26 1, 33 9" stroke="#4A4438" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 祥云纹：三卷螺旋 + 尾线 */
function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 96 30" className={className} style={style} fill="none" aria-hidden>
      <path
        d="M8 22 a7 7 0 1 1 7-9 a8 8 0 1 1 14 3 a6 6 0 1 1 8 6 Z M44 22 h34"
        stroke="#9A9282"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 远山雾霭：两叠淡墨山影 */
function MistMountains({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 260 90" className={className} style={style} fill="none" aria-hidden>
      <path d="M6 78 L52 30 L86 62 L118 22 L156 66 L188 44 L228 78" stroke="#8A8272" strokeWidth="1.6" strokeLinejoin="round" opacity="0.55" />
      <path d="M40 86 L96 52 L132 74 L170 48 L216 84" stroke="#A89F8C" strokeWidth="1.3" strokeLinejoin="round" opacity="0.4" />
      <path d="M0 88 H260" stroke="#B0A892" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

/** 海上帆船：一主帆一辅帆 + 水线 */
function Sailboat({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 74 66" className={className} style={style} fill="none" aria-hidden>
      {/* 船身 */}
      <path d="M10 46 H64 L56 56 H20 Z" fill="#8B5A4A" opacity="0.8" />
      {/* 主桅 + 帆 */}
      <path d="M36 46 V10" stroke="#4A4438" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M36 12 Q 56 18, 54 40 H36 Z" fill="#C96F4A" opacity="0.55" stroke="#8B5A4A" strokeWidth="1.2" />
      {/* 前帆 */}
      <path d="M22 44 V20" stroke="#4A4438" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 22 Q 33 27, 32 42 H22 Z" fill="#D9A766" opacity="0.5" stroke="#8B5A4A" strokeWidth="1.1" />
      {/* 水线 */}
      <path d="M4 60 Q 14 56, 24 60 T 44 60 T 64 60 T 84 60" stroke="#7E949B" strokeWidth="1.2" opacity="0.55" />
      <path d="M12 65 Q 22 61, 32 65 T 52 65" stroke="#7E949B" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

/** 朱印：方形印章「街」 */
function SealStamp({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style} aria-hidden>
      <div className="flex h-8 w-8 items-center justify-center border-[1.5px] border-[#8B2F2F]/70 font-serif-sc text-[15px] font-bold leading-none text-[#8B2F2F]/85">
        街
      </div>
    </div>
  );
}

export function MapDecorations({ map }: { map: MLMap | null }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (!map) return;
    const sync = () => setFade(map.getZoom() > 5.2);
    sync();
    map.on('zoom', sync);
    return () => {
      map.off('zoom', sync);
    };
  }, [map]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 右上海域：帆船 + 波线 */}
      <Sailboat className="absolute right-[9%] top-[30%] w-[74px] opacity-80 max-md:hidden" />
      <svg viewBox="0 0 120 14" className="absolute right-[6%] top-[42%] w-24 opacity-50 max-md:hidden" fill="none">
        <path d="M2 8 Q 12 4, 22 8 T 42 8 T 62 8 T 82 8 T 102 8" stroke="#7E949B" strokeWidth="1.2" />
        <path d="M14 12 Q 24 9, 34 12 T 54 12 T 74 12" stroke="#8FA3A8" strokeWidth="1" />
      </svg>

      {/* 左上：飞鸟（日轮由 MapHUD 承担） */}
      <Bird className="absolute left-[22%] top-[12%] w-9 opacity-85 max-md:hidden" style={{ transform: 'scaleX(-1)' }} />
      <Bird className="absolute left-[25%] top-[9%] w-7 opacity-70" />
      <Bird className="absolute left-[19.5%] top-[8%] w-6 opacity-60" />

      {/* 右上：祥云纹 + 朱印 */}
      <Cloud className="absolute right-[4%] top-[9%] w-24 opacity-60 max-md:hidden" />
      <SealStamp className="absolute right-[13%] top-[15%] opacity-75 max-md:hidden" />

      {/* 左下：远山雾霭（避开左下角图例） */}
      <MistMountains className="absolute bottom-[24%] left-[13%] w-56 opacity-70 max-lg:hidden" />
    </div>
  );
}
