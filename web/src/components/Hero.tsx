import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

/**
 * 卷首刊头 —— 手卷展开开场。
 * 上杆固定于导航下方，纸面向下展开、下杆随纸缘下探；
 * 展开后是一条紧凑标题带，地图在其下方即刻可见、可交互。
 */
export function Hero({
  innerRef,
  onUnrolled,
}: {
  innerRef?: React.RefObject<HTMLElement | null>;
  onUnrolled?: () => void;
}) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onUnrolled?.();
  };

  useEffect(() => {
    if (reduced) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={innerRef} className="relative z-20 pt-14">
      {/* 上杆（固定） */}
      <Rod className="top-14" />

      {/* 纸面：向下展开，下杆随行 */}
      <motion.div
        initial={reduced ? false : { height: 0 }}
        animate={{ height: 'auto' }}
        transition={{ duration: 1.5, ease: EASE }}
        onAnimationComplete={finish}
        className="relative"
      >
        {/* 纸底 */}
        <div className="absolute inset-0 border-b border-[#C4BCA8] bg-[#F3F0E8]/97 shadow-[0_14px_36px_rgba(27,27,27,0.12)] backdrop-blur-[2px]">
          <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/[0.05] to-transparent" />
        </div>

        {/* 刊头内容 */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
          className="relative mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-6 max-md:py-5 md:flex-row md:items-center md:gap-12"
        >
          <div className="shrink-0">
            <div className="kicker">A DIGITAL FIELD ATLAS OF CHINA'S OLD STREETS</div>
            <h1 className="mt-2 font-serif-sc text-[clamp(34px,4.6vw,56px)] font-black leading-[1.08] tracking-[0.05em] text-[#1B1B1B]">
              古街实践档案
            </h1>
            <div className="mt-2.5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#8B2F2F]">
              <span className="h-[1px] w-8 bg-[#8B2F2F]" />
              OLD STREET · FIELD NOTES
            </div>
          </div>

          <div className="hidden w-px self-stretch bg-[#C4BCA8] md:block" />

          <div className="min-w-0 flex-1 md:max-w-[470px]">
            <p className="font-serif-sc text-[13.5px] leading-[1.95] text-[#3A372F]">
              我们用二十一天，走过十一省二十三条古街——记录行走、观察、采访与拍摄。
              这不是一张旅游地图，而是一次田野实践的数字档案。
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#77736A]">
              <span>23 STREETS</span><Dot />
              <span>11 PROVINCES</span><Dot />
              <span>119 PHOTOS</span><Dot />
              <span>6 INTERVIEWS</span><Dot />
              <span>21 DAYS</span>
            </div>
            <div className="mt-2.5 font-mono text-[9px] tracking-[0.22em] text-[#A8A296]">
              ▼ SCROLL · 拖动地图，顺着路线走进古街
            </div>
          </div>
        </motion.div>

        {/* 下杆（随纸缘下探） */}
        <Rod className="-bottom-[5px]" />
      </motion.div>
    </section>
  );
}

function Dot() {
  return <span className="text-[#C4BCA8]">·</span>;
}

/** 卷轴木杆：杆身 + 两端轴头 */
function Rod({ className }: { className: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 z-10 ${className}`}>
      <div className="absolute inset-x-[-8px] top-0 h-[10px] rounded-full bg-gradient-to-b from-[#8A7458] via-[#6E5A42] to-[#52432F] shadow-[0_2px_6px_rgba(27,27,27,0.3)]" />
      <div className="absolute -left-[13px] top-[5px] h-[18px] w-[9px] -translate-y-1/2 rounded-[3px] bg-gradient-to-b from-[#4E4030] to-[#2E261C] shadow-[1px_1px_2px_rgba(27,27,27,0.35)]" />
      <div className="absolute -right-[13px] top-[5px] h-[18px] w-[9px] -translate-y-1/2 rounded-[3px] bg-gradient-to-b from-[#4E4030] to-[#2E261C] shadow-[1px_1px_2px_rgba(27,27,27,0.35)]" />
    </div>
  );
}
