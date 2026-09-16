import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COLLECTIVE, PERIOD, STATS } from '../data/meta';
import { ROUTES } from '../data/routes';
import { STREETS } from '../data/streets';
import { paperVars } from '../lib/paper';
import { contentIn, paperGroup, riseIn } from '../lib/motion';
import { PaperSheet } from './Paper';
import { PlateText } from './PlateText';

/**
 * 收束段 —— 关于我们 + 回到地图。
 * 同一套纸语言里的另一种纸：深色卡纸，像展览出口的墙。
 */
export function Closing({ onBackToMap }: { onBackToMap: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section
      id="closing"
      ref={ref}
      className="paper-kraft pointer-events-auto relative overflow-hidden text-[#F4EFE4]"
      style={paperVars('closing')}
    >
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
      >
        {/* 巨型「街」字水印 */}
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 select-none font-serif-sc text-[560px] font-black leading-none text-[#F4EFE4] max-md:text-[300px]">
          街
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-[1280px] px-6 pb-16 pt-28 max-md:pt-20">
        {/* 结语 */}
        <motion.div
          className="max-w-[760px]"
          variants={paperGroup}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="kicker !text-[#9A9282]">EPILOGUE / 结语</div>
          <p className="mt-8 font-serif-sc text-[clamp(22px,3vw,34px)] font-medium leading-[1.9]">
            <PlateText id="closing">
              古街不是标本。
              <br />
              它是仍在呼吸的城市地层——
              <br />
              有人继续生活，记忆才不会断。
            </PlateText>
          </p>
          <motion.p
            variants={contentIn}
            className="mt-8 max-w-[560px] text-[14px] leading-reading text-[#F4EFE4]/60"
          >
            {PERIOD.start} — {PERIOD.end}，我们分五条线路，走完 {STATS.streets} 条街、
            拍下 {STATS.photos} 张照片、录下 {STATS.audioMinutes} 分钟方言与口述。
            这份档案属于每一条街上愿意跟我们说话的人。
          </motion.p>
        </motion.div>

        {/* 路线收官：直接排在卡纸上，不套框 */}
        <motion.div
          className="mt-20 grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-5"
          variants={paperGroup}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.2 }}
        >
          {ROUTES.map((r) => (
            <motion.div key={r.id} variants={riseIn}>
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6" style={{ background: r.color }} />
                <span className="font-serif-sc text-[15px] font-bold">{r.name}</span>
              </div>
              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#9A9282]">{r.en}</div>
              <ul className="mt-4 space-y-1.5">
                {r.streetIds.map((id) => {
                  const s = STREETS.find((x) => x.id === id)!;
                  return (
                    <li key={id} className="flex items-baseline gap-2 text-[12px] text-[#F4EFE4]/70">
                      <span className="font-mono text-[9px] text-[#B89B67]">{String(s.order).padStart(2, '0')}</span>
                      {s.name}
                      <span className="ml-auto font-mono text-[8px] uppercase text-[#8A8272]">{s.province}</span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* 署名 + 回到地图 */}
        <div className="mt-20 flex flex-col items-center gap-8 border-t border-[#3A332A] pt-12">
          <button
            onClick={onBackToMap}
            className="paper paper--dark group flex items-center gap-3 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[#B89B67] transition-colors hover:text-[#F4EFE4]"
            style={paperVars('back-to-walk', { tone: '#0E0C09', deckle: 'sm' })}
          >
            <PaperSheet />
            <span className="relative">回到实践路线 · BACK TO THE WALK</span>
            <span className="text-[#B89B67] transition-transform duration-500 group-hover:-translate-x-1">←</span>
          </button>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-serif-sc text-[16px] font-bold tracking-[0.1em]">{COLLECTIVE.name}</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#9A9282]">{COLLECTIVE.en}</span>
            <span className="mt-2 font-mono text-[9px] tracking-[0.2em] text-[#8A8272]">
              {COLLECTIVE.org} · {COLLECTIVE.members} MEMBERS · {PERIOD.label}
            </span>
          </div>
        </div>
      </div>

      {/* 底部细线版权 */}
      <div className="relative border-t border-[#3A332A] py-4 text-center font-mono text-[8px] uppercase tracking-[0.26em] text-[#8A8272]">
        OLD STREET FIELD NOTES — A DIGITAL FIELD ATLAS · MAP © OPENFREEMAP / OPENMAPTILES · {new Date().getFullYear()}
      </div>
    </section>
  );
}
