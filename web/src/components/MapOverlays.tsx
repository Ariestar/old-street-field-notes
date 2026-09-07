import { motion } from 'framer-motion';
import { STREETS } from '../data/streets';
import { ROUTES } from '../data/routes';
import type { RouteId } from '../data/types';
import { photoUrl } from '../data/media';

/**
 * 悬停节点提示：跟随节点的迷你标签（由 App 控制位置与内容）。
 * 桌面端 hover 节点时显示街名 + 省份 + 缩略图。
 */
export function NodeTooltip({
  hoverId,
  screenPos,
}: {
  hoverId: string | null;
  screenPos: { x: number; y: number } | null;
}) {
  const s = hoverId ? STREETS.find((x) => x.id === hoverId) : null;
  return (
    <motion.div
      animate={{
        opacity: s && screenPos ? 1 : 0,
        x: screenPos ? screenPos.x : 0,
        y: screenPos ? screenPos.y : 0,
      }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="pointer-events-none absolute left-0 top-0 z-40 hidden md:block"
      style={{ translateX: '-50%', translateY: '-130%' }}
    >
      {s && (
        <div className="flex items-stretch border border-[#3A372F] bg-[#F3F0E8] shadow-[3px_3px_0_rgba(27,27,27,0.85)]">
          <img src={photoUrl(s.id, 0)} alt="" className="h-14 w-[52px] object-cover" />
          <div className="flex flex-col justify-center px-3 py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[9px] font-medium text-[#8B2F2F]">
                {String(s.order).padStart(2, '0')}
              </span>
              <span className="font-serif-sc text-[14px] font-bold leading-none">{s.name}</span>
            </div>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#77736A]">
              {s.province} · {s.city}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * 路线筛选条 —— 底部居中的克制线框分类。
 */
export function RouteFilter({
  active,
  onChange,
}: {
  active: RouteId | null;
  onChange: (r: RouteId | null) => void;
}) {
  const items: { id: RouteId | null; label: string; en: string; color?: string }[] = [
    { id: null, label: '全部', en: 'ALL' },
    ...ROUTES.map((r) => ({ id: r.id, label: r.name, en: r.en, color: r.color })),
  ];
  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border border-[#C4BCA8] bg-[#F3F0E8]/92 px-5 py-2.5 shadow-[2px_2px_0_rgba(27,27,27,0.08)] backdrop-blur-sm">
      {items.map((it) => {
        const on = it.id === active || (it.id === null && active === null);
        return (
          <button
            key={it.en}
            onClick={() => onChange(it.id)}
            className={`group relative pb-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              on ? 'text-[#1B1B1B]' : 'text-[#A8A296] hover:text-[#3A372F]'
            }`}
          >
            <span className="mr-1.5 inline-block h-[6px] w-[6px] rotate-45 align-[1px]" style={{ background: it.color ?? '#77736A' }} />
            {it.label}
            {/* 暗红下划线 */}
            <span
              className={`absolute bottom-0 left-0 h-[2px] bg-[#8B2F2F] transition-all duration-300 ${
                on ? 'w-full' : 'w-0 group-hover:w-1/2'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
