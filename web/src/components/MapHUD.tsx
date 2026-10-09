import type { RouteId } from '../data/types';

/**
 * HUD：地图四角的档案元信息（仅在地图阶段显示）。
 * 左上：项目元数据；图例/比例尺/归因各自占据其余角落。
 */
export function MapHUD({ activeRoute }: { activeRoute: RouteId | null }) {
  return (
    <div className="pointer-events-none absolute left-4 top-[68px] max-w-[270px] border border-[#C4BCA8]/80 bg-[#F3F0E8]/78 px-3.5 py-3 font-mono text-[9px] leading-relaxed tracking-[0.16em] text-[#77736A] uppercase shadow-[2px_2px_0_rgba(27,27,27,0.06)] backdrop-blur-[2px] max-md:left-3 max-md:top-[62px] max-md:max-w-[210px] max-md:px-3 max-md:py-2.5">
      {/* 朱红日轮 —— 致敬参考水彩地图的红色太阳 */}
      <div className="mb-2 flex items-center gap-2.5">
        <div aria-hidden className="relative h-6 w-6 shrink-0">
        <div className="absolute inset-[4px] rounded-full bg-[#8B2F2F]/90" />
        <div className="absolute inset-0 rounded-full border border-[#8B2F2F]/45" />
        <div className="absolute -top-[2px] left-1/2 h-[3px] w-[1px] -translate-x-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -bottom-[2px] left-1/2 h-[3px] w-[1px] -translate-x-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -left-[2px] top-1/2 h-[1px] w-[3px] -translate-y-1/2 bg-[#8B2F2F]/55" />
        <div className="absolute -right-[2px] top-1/2 h-[1px] w-[3px] -translate-y-1/2 bg-[#8B2F2F]/55" />
        </div>
        <span className="text-[8px] tracking-[0.22em] text-[#8B2F2F]">FIELD MAP / 田野地图</span>
      </div>
      <div>古街实践档案 / OLD STREET FIELD NOTES</div>
      <div className="mt-2 h-px w-full bg-[#C4BCA8]/80" />
      <div className="mt-2 text-[8px] tracking-[0.13em]">2026.07 — 2026.08 · 11 PROVINCES · 24 STREETS</div>
      {activeRoute && <div className="mt-1.5 inline-flex border border-[#8B2F2F]/35 bg-[#8B2F2F]/8 px-1.5 py-0.5 text-[8px] text-[#8B2F2F]">ROUTE FOCUS / 路线聚焦</div>}
    </div>
  );
}
