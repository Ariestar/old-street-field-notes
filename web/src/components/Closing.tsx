import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COLLECTIVE, PERIOD, STATS } from '../data/meta';
import { ROUTES } from '../data/routes';
import { STREETS } from '../data/streets';

/**
 * 收束段 —— 关于我们 + 回到地图。
 * 深色纸感的终章，像展览出口的墙。
 */
export function Closing({ onBackToMap }: { onBackToMap: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section id="closing" ref={ref} className="relative overflow-hidden bg-[#141310] text-[#F3F0E8]">
      <motion.div
        style={{ y: bgY }}
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
      >
        {/* 巨型「街」字水印 */}
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 select-none font-serif-sc text-[560px] font-black leading-none text-[#F3F0E8] max-md:text-[300px]">
          街
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-[1280px] px-6 pb-16 pt-28 max-md:pt-20">
        {/* 结语 */}
        <div className="max-w-[760px]">
          <div className="kicker !text-[#77736A]">EPILOGUE / 结语</div>
          <p className="mt-8 font-serif-sc text-[clamp(22px,3vw,34px)] font-medium leading-[1.9]">
            古街不是标本。
            <br />
            它是仍在呼吸的城市地层——
            <br />
            有人继续生活，记忆才不会断。
          </p>
          <p className="mt-8 max-w-[560px] text-[14px] leading-[2.1] text-[#F3F0E8]/60">
            {PERIOD.start} — {PERIOD.end}，我们分五条线路，走完 {STATS.streets} 条街、
            拍下 {STATS.photos} 张照片、录下 {STATS.audioMinutes} 分钟方言与口述。
            这份档案属于每一条街上愿意跟我们说话的人。
          </p>
        </div>

        {/* 路线收官列表 */}
        <div className="mt-20 grid grid-cols-1 gap-px border border-[#2E2B24] bg-[#2E2B24] md:grid-cols-5">
          {ROUTES.map((r) => (
            <div key={r.id} className="bg-[#141310] p-5">
              <div className="flex items-center gap-2">
                <span className="h-[2px] w-6" style={{ background: r.color }} />
                <span className="font-serif-sc text-[15px] font-bold">{r.name}</span>
              </div>
              <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.2em] text-[#77736A]">{r.en}</div>
              <ul className="mt-4 space-y-1.5">
                {r.streetIds.map((id) => {
                  const s = STREETS.find((x) => x.id === id)!;
                  return (
                    <li key={id} className="flex items-baseline gap-2 text-[12px] text-[#F3F0E8]/70">
                      <span className="font-mono text-[9px] text-[#B89B67]">{String(s.order).padStart(2, '0')}</span>
                      {s.name}
                      <span className="ml-auto font-mono text-[8px] uppercase text-[#55524A]">{s.province}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* 署名 + 回到地图 */}
        <div className="mt-20 flex flex-col items-center gap-8 border-t border-[#2E2B24] pt-12">
          <button
            onClick={onBackToMap}
            className="group relative overflow-hidden border border-[#B89B67] px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-[#B89B67] transition-colors duration-500 hover:text-[#141310]"
          >
            <span className="absolute inset-0 -translate-x-full bg-[#B89B67] transition-transform duration-500 ease-out group-hover:translate-x-0" />
            <span className="relative">回到实践路线 · BACK TO THE WALK</span>
          </button>

          <div className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-serif-sc text-[16px] font-bold tracking-[0.1em]">{COLLECTIVE.name}</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#77736A]">{COLLECTIVE.en}</span>
            <span className="mt-2 font-mono text-[9px] tracking-[0.2em] text-[#55524A]">
              {COLLECTIVE.org} · {COLLECTIVE.members} MEMBERS · {PERIOD.label}
            </span>
          </div>
        </div>
      </div>

      {/* 底部细线版权 */}
      <div className="relative border-t border-[#2E2B24] py-4 text-center font-mono text-[8px] uppercase tracking-[0.26em] text-[#55524A]">
        OLD STREET FIELD NOTES — A DIGITAL FIELD ATLAS · MAP © OPENFREEMAP / OPENMAPTILES · {new Date().getFullYear()}
      </div>
    </section>
  );
}
