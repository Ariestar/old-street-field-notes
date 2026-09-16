import { motion } from 'framer-motion';
import { ROUTES } from '../data/routes';
import { STREETS } from '../data/streets';
import type { RouteId } from '../data/types';
import { paperVars } from '../lib/paper';
import { contentIn, paperGroup } from '../lib/motion';
import { PaperSheet } from './Paper';

/**
 * 路线筛选 —— 地图左下角那张纸。
 *
 * 原本左下是只读图例、底部另有筛选条；两条都在表达同一件事（五条路线 + 站数），
 * 现在合成一张：点一行就把地图飞到那条线的包络视野，点「全部」回到全国，
 * 再点一次已选中的行也可以取消。
 */
export function MapLegend({
  activeRoute,
  onPick,
}: {
  activeRoute: RouteId | null;
  onPick: (r: RouteId | null) => void;
}) {
  // id 为 null 表示「全部」那一行
  const row = (
    id: RouteId | null,
    color: string,
    name: string,
    stops: number,
    picked: boolean,
    dim: boolean,
  ) => (
    <motion.button
      key={id ?? 'all'}
      onClick={() => onPick(picked ? null : id)}
      whileHover={{ y: -1.5 }}
      className={`group relative flex w-full items-center gap-2.5 pb-1 text-left transition-opacity ${
        dim ? 'opacity-35' : 'opacity-100'
      }`}
    >
      <span className="h-[6px] w-[6px] shrink-0 rotate-45" style={{ background: color }} />
      <span className="font-serif-sc text-[12.5px] font-medium text-[#1F1C18]">{name}</span>
      <span className="ml-auto font-mono text-[8px] tracking-[0.14em] text-[#A49D92]">{stops} STOPS</span>
      <span
        className={`absolute bottom-0 left-0 h-[2px] bg-[#8B2F2F] transition-all duration-300 ${
          picked ? 'w-full' : 'w-0 group-hover:w-1/2'
        }`}
      />
    </motion.button>
  );

  return (
    <motion.div
      className="paper pointer-events-auto absolute bottom-8 left-4 z-10 hidden px-4 py-3 md:block"
      style={paperVars('route-filter', { deckle: 'md' })}
      variants={paperGroup}
      initial="hidden"
      animate="shown"
    >
      <PaperSheet />
      <motion.div variants={contentIn}>
        <div className="kicker mb-2">路线筛选 / ROUTE FILTER</div>
        <div className="space-y-1.5">
          {row(null, '#6B655C', '全部', STREETS.length, activeRoute === null, false)}
          {ROUTES.map((r) =>
            row(
              r.id,
              r.color,
              r.name,
              r.streetIds.length,
              activeRoute === r.id,
              activeRoute !== null && activeRoute !== r.id,
            ),
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
