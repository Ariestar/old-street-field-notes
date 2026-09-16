import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { plateVars } from '../lib/paper';
import { plateSettle } from '../lib/motion';

/**
 * 套印偏色标题 —— 一块印版没对准，真实的第二次压印：
 * 副版整体错位并微旋，主版压在上面。
 *
 * 两层共用同一个 box，断行才会完全一致；副版对读屏隐藏。
 * 副版挂 plateSettle：父级编排时从更远的错位「落版」回 CSS 给的落点。
 */
export function PlateText({ children, id }: { children: ReactNode; id: string }) {
  return (
    <span className="plate" style={plateVars(id)}>
      <motion.span className="plate__ghost" variants={plateSettle} aria-hidden>
        {children}
      </motion.span>
      <span className="plate__ink">{children}</span>
    </span>
  );
}
