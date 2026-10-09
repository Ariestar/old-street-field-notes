import { motion } from 'framer-motion';
import type { RouteId } from '../data/types';
import { DUR, EASE_STANDARD } from '../lib/motion';

/**
 * HUD：地图四角的档案元信息（仅在地图阶段显示）。
 * 左上：项目元数据；图例/比例尺/归因各自占据其余角落。
 */
export function MapHUD({ activeRoute }: { activeRoute: RouteId | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, ease: EASE_STANDARD, delay: 0.3 }}
      className="pointer-events-none absolute left-4 top-[68px] font-mono text-[9px] leading-relaxed tracking-[0.18em] text-[#6B655C] uppercase mix-blend-multiply max-md:hidden"
    >
      {/* 朱红日轮 —— 致敬参考水彩地图的红色太阳 */}
      <div aria-hidden className="relative mb-2.5 h-6 w-6">
        <div className="absolute inset-[4px] rounded-full bg-[#8B2F2F]/90" />
        <div className="absolute inset-0 rounded-full border border-[#8B2F2F]/45" />
        <div className="absolute -top-[2px] left-1/2 h-[3px] w-[1px] -translate-x-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -bottom-[2px] left-1/2 h-[3px] w-[1px] -translate-x-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -left-[2px] top-1/2 h-[1px] w-[3px] -translate-y-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -right-[2px] top-1/2 h-[1px] w-[3px] -translate-y-1/2 bg-[#8B2F2F]/55" />
      </div>
      <div>古街实践档案 / OLD STREET FIELD NOTES</div>
      <div className="mt-1 h-[1px] w-24 bg-[#BCB3A0]" />
      <div className="mt-1">2026.07 — 2026.08 · 11 PROVINCES · 24 STREETS</div>
      {activeRoute && <div className="mt-0.5 text-[#8B2F2F]">ROUTE FOCUS / 路线聚焦</div>}
    </motion.div>
  );
}
