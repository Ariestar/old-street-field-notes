import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const LINKS = [
  { id: 'top', label: '项目介绍', en: 'ABOUT' },
  { id: 'archive', label: '地点档案', en: 'ARCHIVE' },
  { id: 'findings', label: '观察记录', en: 'FINDINGS' },
  { id: 'closing', label: '关于我们', en: 'ABOUT US' },
];

/**
 * 顶部克制的导航：半透明，地图延伸其下。
 */
export function TopNav({ onNavigate }: { onNavigate: (id: string) => void }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 60));

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid ? 'border-b border-[#D8D2C4]/80 bg-[#F3F0E8]/88 backdrop-blur-md' : 'bg-transparent'
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5">
        <button onClick={() => onNavigate('top')} className="flex items-baseline gap-3">
          <span className="font-serif-sc text-[17px] font-bold tracking-[0.08em]">古街实践档案</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.26em] text-[#8B2F2F] sm:block">
            OLD STREET / FIELD NOTES
          </span>
        </button>

        <nav className="flex items-center gap-6 max-md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id === 'top' ? 'map' : l.id)}
              className="group relative py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#77736A] transition-colors hover:text-[#1B1B1B]"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#8B2F2F] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* 移动端：只留一个菜单点 */}
        <button className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden" aria-label="菜单">
          <span className="h-[1.5px] w-5 bg-[#1B1B1B]" />
          <span className="h-[1.5px] w-5 bg-[#1B1B1B]" />
        </button>
      </div>
    </motion.header>
  );
}
