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
  const [mobileOpen, setMobileOpen] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 60));

  const navigate = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

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
        <button onClick={() => navigate('top')} className="flex items-baseline gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B2F2F]">
          <span className="font-serif-sc text-[17px] font-bold tracking-[0.08em]">古街实践档案</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.26em] text-[#8B2F2F] sm:block">
            OLD STREET / FIELD NOTES
          </span>
        </button>

        <nav className="flex items-center gap-6 max-md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(l.id === 'top' ? 'map' : l.id)}
              className="group relative py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#77736A] transition-colors hover:text-[#1B1B1B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B2F2F]"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#8B2F2F] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* 移动端：只留一个菜单点 */}
        <button
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B2F2F]"
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={mobileOpen}
        >
          <span className={`h-[1.5px] w-5 bg-[#1B1B1B] transition-transform duration-300 ${mobileOpen ? 'translate-y-[3.25px] rotate-45' : ''}`} />
          <span className={`h-[1.5px] w-5 bg-[#1B1B1B] transition-transform duration-300 ${mobileOpen ? '-translate-y-[3.25px] -rotate-45' : ''}`} />
        </button>
      </div>

      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-[#D8D2C4]/80 bg-[#F3F0E8]/95 px-5 pb-4 pt-2 shadow-[0_8px_24px_rgba(27,27,27,0.08)] backdrop-blur-md md:hidden"
          aria-label="移动端导航"
        >
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(l.id === 'top' ? 'map' : l.id)}
              className="flex w-full items-baseline justify-between border-b border-[#D8D2C4]/70 py-3 text-left font-mono text-[10px] tracking-[0.18em] text-[#3A372F] last:border-b-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B2F2F]"
            >
              <span>{l.label}</span>
              <span className="text-[8px] tracking-[0.24em] text-[#A8A296]">{l.en}</span>
            </button>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}
