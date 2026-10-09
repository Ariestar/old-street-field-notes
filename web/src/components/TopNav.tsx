import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import type { Map as MLMap } from 'maplibre-gl';
import { paperVars } from '../lib/paper';
import { DUR, EASE_STANDARD } from '../lib/motion';
import { MapControls } from './MapControls';
import { PaperSheet } from './Paper';

const LINKS = [
  { id: 'top', label: '项目介绍', en: 'ABOUT' },
  { id: 'archive', label: '地点档案', en: 'ARCHIVE' },
  { id: 'findings', label: '观察记录', en: 'FINDINGS' },
  { id: 'closing', label: '关于我们', en: 'ABOUT US' },
];

/**
 * 顶部导航：一条横贯屏幕的纸。地图延伸其下，滚过首屏后纸才显形。
 *
 * 不倾斜 —— 它是一条贴边通栏的纸带，转一点就会跟视口边缘脱开。
 * 地图工具（缩放 / 回到全图）挂在它右侧，成为统一的工具栏。
 */
export function TopNav({
  onNavigate,
  map,
  onReset,
}: {
  onNavigate: (id: string) => void;
  map: MLMap | null;
  onReset: () => void;
}) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 60));

  const navigate = (id: string) => {
    onNavigate(id === 'top' ? 'map' : id);
    setMobileOpen(false);
  };

  return (
    <motion.header
      onKeyDown={(event) => {
        if (event.key === 'Escape') setMobileOpen(false);
      }}
      style={paperVars('topnav', { deckle: false, tilt: false })}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        solid || mobileOpen ? 'paper border-b border-[#CBC3B4]' : ''
      }`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: DUR.slow, delay: 0.15, ease: EASE_STANDARD }}
    >
      {(solid || mobileOpen) && <PaperSheet />}
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-5">
        <button onClick={() => navigate('top')} className="flex items-baseline gap-3">
          <span className="font-serif-sc text-[17px] font-bold tracking-[0.08em]">古街实践档案</span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.26em] text-[#8B2F2F] sm:block">
            OLD STREET / FIELD NOTES
          </span>
        </button>

        <nav className="ml-auto flex items-center gap-6 max-md:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => navigate(l.id)}
              className="group relative py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6B655C] transition-colors hover:text-[#1F1C18]"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#8B2F2F] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* 右侧：地图工具 +（移动端）菜单 */}
        <div className="ml-auto flex items-center gap-3 md:ml-6">
          {map && <MapControls map={map} onReset={onReset} />}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
            aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <span className="h-[1.5px] w-5 bg-[#1F1C18]" />
            <span className="h-[1.5px] w-5 bg-[#1F1C18]" />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <motion.nav
          id="mobile-navigation"
          aria-label="移动端导航"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.quick, ease: EASE_STANDARD }}
          className="border-t border-[#CBC3B4] px-5 py-2 md:hidden"
        >
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => navigate(link.id)}
              className="flex w-full items-center justify-between border-b border-[#CBC3B4] py-3 text-left text-[13px] text-[#4A453C] last:border-b-0"
            >
              <span>{link.label}</span>
              <span className="font-mono text-[9px] tracking-[0.18em]">{link.en}</span>
            </button>
          ))}
        </motion.nav>
      )}
    </motion.header>
  );
}
