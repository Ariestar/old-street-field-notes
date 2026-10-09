import { motion } from 'framer-motion';
import { STREETS } from '../data/streets';
import { photoUrl } from '../data/media';
import { paperVars } from '../lib/paper';
import { DUR, EASE_STANDARD } from '../lib/motion';
import { PaperSheet } from './Paper';

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
      transition={{ duration: DUR.instant, ease: EASE_STANDARD }}
      className="pointer-events-none absolute left-0 top-0 z-40 hidden md:block"
      style={{ translateX: '-50%', translateY: '-130%' }}
    >
      {s && (
        <div
          className="paper flex items-stretch"
          style={paperVars(`tooltip-${s.id}`, { deckle: 'sm' })}
        >
          <PaperSheet />
          <img src={photoUrl(s.id, 0)} alt="" className="h-14 w-[52px] shrink-0 object-cover" />
          <div className="flex flex-col justify-center px-3 py-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[9px] font-medium text-[#8B2F2F]">
                {String(s.order).padStart(2, '0')}
              </span>
              <span className="font-serif-sc text-[14px] font-bold leading-none">{s.name}</span>
            </div>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#6B655C]">
              {s.province} · {s.city}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
