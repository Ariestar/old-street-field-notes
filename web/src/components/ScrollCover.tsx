import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { paperVars } from '../lib/paper';
import { DUR, EASE_STANDARD } from '../lib/motion';
import { PaperSheet } from './Paper';
import { PlateText } from './PlateText';

const HOLD_MS = 650;

/**
 * 卷首开卷 —— 画卷自中央向两侧展开。
 * 地图自始至终可见、可拖拽；标题只作为被展开的画布：
 * 展毕稍驻，随即合卷归轴，整幅让位于地图。
 *
 * 注：不做 prefers-reduced-motion 短路 —— 系统关闭动画时仍照常开卷，
 * 这是站点刻意的开场仪式（站主明确要求）。
 */
export function ScrollCover() {
  const [max] = useState(() =>
    typeof window !== 'undefined' ? Math.min(880, Math.round(window.innerWidth * 0.86)) : 880,
  );
  const [phase, setPhase] = useState<'open' | 'close'>('open');
  const [gone, setGone] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  if (gone) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden>
      {/* 展开中的画卷：宽度自中线生长，画布居中裁切，两轴随画缘外移 */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: phase === 'open' ? max : 0 }}
        transition={{ duration: phase === 'open' ? DUR.hold : DUR.slow, ease: EASE_STANDARD }}
        onAnimationComplete={() => {
          if (phase === 'open') {
            timers.current.push(window.setTimeout(() => setPhase('close'), HOLD_MS));
          } else {
            setGone(true);
          }
        }}
        className="absolute left-1/2 top-1/2 flex justify-center overflow-hidden py-6 -translate-x-1/2 -translate-y-1/2"
      >
        {/* 画布（固定宽度，居中裁切）。父层留出 py-6，毛边才有地方咬。
            左右两边被卷轴木杆压住，参差只在上下缘露出来 */}
        <div
          className="paper w-[880px] max-w-[92vw] shrink-0 px-10 py-9 text-center max-md:px-5 max-md:py-6"
          style={paperVars('scroll-cover', { deckle: 'lg' })}
        >
          <PaperSheet />
          <div className="kicker">A DIGITAL FIELD ATLAS OF CHINA'S OLD STREETS</div>
          <h1 className="mt-3 font-serif-sc text-[clamp(40px,5.6vw,68px)] font-black leading-[1.06] tracking-[0.12em] text-[#1F1C18]">
            <PlateText id="scroll-cover">古街实践档案</PlateText>
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.34em] text-[#8B2F2F]">
            <span className="h-[1px] w-10 bg-[#8B2F2F]" />
            OLD STREET · FIELD NOTES
            <span className="h-[1px] w-10 bg-[#8B2F2F]" />
          </div>
          <p className="mx-auto mt-4 max-w-[560px] font-serif-sc text-[13px] leading-[1.9] text-[#4A453C] max-md:hidden">
            我们用二十一天，走过十一省二十四条古街——记录行走、观察、采访与拍摄。
            这不是一张旅游地图，而是一次田野实践的数字档案。
          </p>
        </div>

        {/* 两根卷轴：钉在画卷两缘，随展开/合拢同步移动 */}
        <Roller side="left" />
        <Roller side="right" />
      </motion.div>
    </div>
  );
}

/** 卷轴木杆（竖杆 + 上下轴头） */
function Roller({ side }: { side: 'left' | 'right' }) {
  const isL = side === 'left';
  return (
    <div className={`absolute top-1/2 z-10 h-[calc(100%+64px)] w-[13px] -translate-y-1/2 ${isL ? '-left-[7px]' : '-right-[7px]'}`}>
      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#3E3225] via-[#8A7458] to-[#3E3225] shadow-[0_8px_22px_rgba(27,27,27,0.38)]" />
      <div className="absolute -left-[3px] -top-[8px] h-[10px] w-[19px] rounded-[3px] bg-gradient-to-b from-[#4E4030] to-[#2E261C] shadow-[1px_1px_2px_rgba(27,27,27,0.35)]" />
      <div className="absolute -bottom-[8px] -left-[3px] h-[10px] w-[19px] rounded-[3px] bg-gradient-to-b from-[#4E4030] to-[#2E261C] shadow-[1px_1px_2px_rgba(27,27,27,0.35)]" />
    </div>
  );
}
