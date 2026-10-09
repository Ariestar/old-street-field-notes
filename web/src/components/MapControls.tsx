import type { Map as MLMap } from 'maplibre-gl';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { paperVars } from '../lib/paper';
import { paperGroup, riseIn } from '../lib/motion';
import { PaperSheet } from './Paper';

/**
 * 地图工具条：缩小 / 放大 / 回到全图。
 * 位置由 TopNav 决定（header 右侧）；这里只管三枚纸片按钮。
 * 不用 maplibre 自带 NavigationControl —— 它的 DOM 折不进纸片体系。
 */
export function MapControls({ map, onReset }: { map: MLMap; onReset: () => void }) {
  return (
    <motion.div
      className="flex items-center gap-1.5"
      variants={paperGroup}
      initial="hidden"
      animate="shown"
    >
      <PaperButton id="zoom-out" onClick={() => map.zoomOut()} label="缩小">
        −
      </PaperButton>
      <PaperButton id="zoom-in" onClick={() => map.zoomIn()} label="放大">
        +
      </PaperButton>
      <PaperButton id="reset" onClick={onReset} label="回到实践路线全图">
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" className="transition-transform duration-500 group-hover:-rotate-180">
          <path d="M6 1 A5 5 0 1 1 1.2 4.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M1 1 L1.2 4.5 L4.5 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </PaperButton>
    </motion.div>
  );
}

function PaperButton({
  id,
  onClick,
  label,
  children,
}: {
  id: string;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      title={label}
      aria-label={label}
      variants={riseIn}
      whileHover={{ y: -1.5 }}
      className="paper group flex h-8 w-8 items-center justify-center font-mono text-[13px] leading-none text-[#4A453C] transition-colors hover:text-[#8B2F2F]"
      style={paperVars(id, { deckle: 'sm' })}
    >
      <PaperSheet />
      {children}
    </motion.button>
  );
}
