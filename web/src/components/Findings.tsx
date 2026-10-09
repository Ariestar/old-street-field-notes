import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CORE_FINDINGS, STATS, PERIOD } from '../data/meta';
import { streetById } from '../data/streets';
import { photoUrl } from '../data/media';

/**
 * FIELD FINDINGS —— 实践发现区。
 * 大字号统计 + 五条核心发现（编辑部长文排印）。
 */
export function Findings({ onOpenStreet }: { onOpenStreet: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const headY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="findings" ref={ref} className="relative overflow-hidden bg-[#1B1B1B] text-[#F3F0E8]">
      {/* ── 统计大字 ── */}
      <div className="mx-auto max-w-[1280px] px-6 pb-10 pt-28 max-md:pt-20">
        <motion.div style={{ y: headY }}>
          <div className="kicker !text-[#A8A296]">FIELD FINDINGS / 我们发现了什么</div>
          <h2 className="mt-4 font-serif-sc text-[clamp(34px,5vw,58px)] font-black leading-[1.15]">
            一次行走之后，
            <br />
            我们如此理解古街。
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-y-10 border-y border-[#3A372F] py-12 md:grid-cols-6 md:gap-y-0">
          <Stat n={STATS.streets} label="观察地点" en="SITES OBSERVED" />
          <Stat n={STATS.provinces} label="省份跨越" en="PROVINCES" />
          <Stat n={STATS.photos} label="记录照片" en="PHOTOS ARCHIVED" />
          <Stat n={STATS.interviews} label="访谈对象" en="INTERVIEWEES" />
          <Stat n={STATS.audioMinutes} label="录音分钟" en="MINUTES OF AUDIO" />
          <Stat n={STATS.findings} label="核心发现" en="CORE FINDINGS" accent />
        </div>
      </div>

      {/* ── 五条核心发现 ── */}
      <div className="mx-auto max-w-[1280px] px-6 pb-28">
        {CORE_FINDINGS.map((f, i) => (
          <FindingBlock key={f.no} f={f} onOpenStreet={onOpenStreet} idx={i} />
        ))}
      </div>
    </section>
  );
}

function Stat({ n, label, en, accent }: { n: number; label: string; en: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-start px-2 ${accent ? 'text-[#B89B67]' : ''}`}>
      <span className="font-serif-sc text-[clamp(44px,5.4vw,72px)] font-black leading-none tracking-tight">
        {n}
      </span>
      <span className="mt-2.5 font-serif-sc text-[13px] text-[#F3F0E8]/85">{label}</span>
      <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-[#77736A]">{en}</span>
    </div>
  );
}

function FindingBlock({
  f,
  idx,
  onOpenStreet,
}: {
  f: (typeof CORE_FINDINGS)[number];
  idx: number;
  onOpenStreet: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] });
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.25], [50, 0]);
  void idx;

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="grid grid-cols-1 gap-8 border-b border-[#3A372F] py-16 md:grid-cols-[140px_1fr_320px] md:gap-12 max-md:py-10"
    >
      {/* 编号 */}
      <div className="flex md:flex-col md:items-start md:gap-3">
        <span className="font-serif-sc text-[clamp(56px,7vw,96px)] font-black leading-none text-transparent" style={{ WebkitTextStroke: '1px #B89B67' }}>
          {f.no}
        </span>
        <span className="mt-2 font-mono text-[8px] uppercase leading-relaxed tracking-[0.2em] text-[#77736A] md:mt-1">
          {f.en}
        </span>
      </div>

      {/* 正文 */}
      <div>
        <h3 className="font-serif-sc text-[clamp(24px,2.6vw,34px)] font-bold leading-snug">{f.title}</h3>
        <p className="mt-5 max-w-[620px] text-[14.5px] leading-[2.05] text-[#F3F0E8]/78">{f.body}</p>
      </div>

      {/* 佐证照片 */}
      <div className="relative hidden h-[300px] md:block">
        {f.streets.slice(0, 2).map((id, k) => {
          const s = streetById(id);
          return (
            <motion.button
              key={id}
              onClick={() => onOpenStreet(id)}
              whileHover={{ scale: 1.025, rotate: 0, zIndex: 5 }}
              initial={{ rotate: k === 0 ? -1.6 : 1.8 }}
              className={`absolute overflow-hidden border border-[#3A372F] bg-[#1B1B1B] shadow-[6px_8px_24px_rgba(0,0,0,0.45)] ${
                k === 0 ? 'left-0 top-2 w-[74%]' : 'bottom-0 right-0 w-[56%]'
              }`}
              style={{ aspectRatio: k === 0 ? '4/3' : '1/1' }}
            >
              <img src={photoUrl(id, k === 0 ? 0 : 1)} alt={s.name} loading="lazy" className="h-full w-full object-cover opacity-88" />
              <span className="absolute bottom-0 left-0 flex w-full items-center justify-between bg-gradient-to-t from-black/75 to-transparent px-2.5 pb-1.5 pt-5 font-mono text-[8px] uppercase tracking-[0.16em] text-[#F3F0E8]">
                <span>{s.name}</span>
                <span className="text-[#B89B67]">{PERIOD.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
