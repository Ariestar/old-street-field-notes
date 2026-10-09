import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Street, Story } from '../data/types';
import { ORAL_STORIES } from '../data/stories';
import { photosOf, photoUrl } from '../data/media';

/**
 * 档案卡 —— 点击地图节点后出现的编辑部风格内容面板。
 * 纸质卡片：编号 + 宋体标题 + 田野笔记 + 照片 + 采访摘录 + 关键词。
 */
export function ArchiveCard({
  street,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  street: Street | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  return (
    <AnimatePresence mode="wait">
      {street && (
        <motion.aside
          key={street.id}
          initial={{ x: '102%', opacity: 0.4 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '102%', opacity: 0.4 }}
          transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-y-0 right-0 top-14 z-30 flex w-full max-w-[520px] flex-col border-l border-[#C4BCA8] bg-[#F3F0E8] shadow-[-16px_0_48px_rgba(27,27,27,0.14)] max-md:top-auto max-md:max-w-none max-md:max-h-[72dvh] max-md:border-t max-md:border-l-0 max-md:shadow-[0_-16px_48px_rgba(27,27,27,0.18)]"
        >
          <CardInner street={street} onClose={onClose} onPrev={onPrev} onNext={onNext} index={index} total={total} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function CardInner({
  street,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  street: Street;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
}) {
  const photos = photosOf(street.id);
  const coverB = photos[1 % photos.length];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ── 头部：编号 + 标题 ── */}
      <header className="relative shrink-0 border-b border-[#D8D2C4] px-7 pb-5 pt-6 max-md:px-5 max-md:pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-serif-sc text-[44px] font-black leading-none text-[#8B2F2F] max-md:text-[36px]">
              {String(street.order).padStart(2, '0')}
            </span>
            <div>
              <h2 className="font-serif-sc text-[28px] font-bold leading-tight text-[#1B1B1B] max-md:text-[24px]">
                {street.name}
              </h2>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#77736A]">
                {street.fullName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto -mr-2 -mt-1 p-2 text-[#77736A] transition-colors hover:text-[#8B2F2F]"
            aria-label="关闭档案"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M2 2 L16 16 M16 2 L2 16" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#A8A296]">
          <span>FIELD NOTE {String(street.order).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          <span className="text-[#C4BCA8]">·</span>
          <span>{street.period}</span>
          {street.heritage && (
            <>
              <span className="text-[#C4BCA8]">·</span>
              <span className="text-[#B89B67]">{street.heritage}</span>
            </>
          )}
        </div>
        {/* 暗红下划标 */}
        <div className="absolute bottom-0 left-7 h-[2px] w-14 bg-[#8B2F2F] max-md:left-5" />
      </header>

      {/* ── 主体 ── */}
      <div className="flex-1 overflow-y-auto px-7 pb-6 max-md:px-5">
        {/* 定位句 */}
        <p className="mt-5 font-serif-sc text-[17px] font-medium leading-relaxed text-[#3A372F]">
          「{street.tagline}」
        </p>

        {/* 照片组：错落叠放（A 大图 + B 窄幅斜叠右下，整体收进容器） */}
        <div className="relative mt-6 h-[360px] max-md:h-[300px]">
          <motion.figure
            initial={{ opacity: 0, y: 14, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute left-0 top-0 w-[62%] overflow-hidden bg-[#EAE5D8] shadow-[4px_6px_20px_rgba(27,27,27,0.22)]"
          >
            <img
              src={photoUrl(street.id, 0)}
              alt={street.name}
              loading="lazy"
              className="photo-archival aspect-[4/3] w-full object-cover"
            />
            <figcaption className="flex items-center justify-between px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[#77736A]">
              <span>FIELD PHOTO</span>
              <span>2026.07—08</span>
            </figcaption>
          </motion.figure>
          {coverB && (
            <motion.figure
              initial={{ opacity: 0, y: 18, rotate: 1.6 }}
              animate={{ opacity: 1, y: 0, rotate: 1.6 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-[34%] z-10 w-[38%] overflow-hidden bg-[#EAE5D8] shadow-[4px_6px_20px_rgba(27,27,27,0.25)]"
            >
              <img
                src={photoUrl(street.id, 1)}
                alt=""
                loading="lazy"
                className="photo-archival aspect-[3/4] w-full object-cover"
              />
            </motion.figure>
          )}
        </div>

        {/* 编辑部导语 */}
        <div className="mt-7">
          <div className="kicker">观察记录 / OBSERVATION</div>
          <p className="mt-2.5 font-serif-sc text-[14px] leading-[1.95] text-[#3A372F]">{street.intro}</p>
          {street.introEn && (
            <div className="mt-4 border-t border-dashed border-[#C4BCA8] pt-3.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#A8A296]">English</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.85] text-[#5C574C]">{street.introEn}</p>
            </div>
          )}
        </div>

        {/* 口述故事 */}
        {(ORAL_STORIES[street.id]?.length ?? 0) > 0 && (
          <div className="mt-8">
            <div className="kicker">口述故事 / ORAL STORIES</div>
            <div className="mt-3 space-y-4">
              {ORAL_STORIES[street.id].map((st, i) => (
                <StoryBlock key={i} story={st} no={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* 采访摘录 */}
        {street.interviews?.map((iv, i) => (
          <div key={i} className="mt-7 border-l-2 border-[#8B2F2F] bg-[#EFE9DC] px-5 py-4">
            <div className="kicker text-[#8B2F2F]">采访摘录 / INTERVIEW {iv.audio ? '· 含录音' : ''}</div>
            <blockquote className="mt-2 font-serif-sc text-[14.5px] leading-[1.9] text-[#1B1B1B]">
              「{iv.quote}」
            </blockquote>
            <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#77736A]">
              —— {iv.person}{iv.age ? `，${iv.age} 岁` : ''}，{iv.role}
            </div>
            {iv.audio && (
              <audio controls preload="none" src={iv.audio} className="mt-3 h-8 w-full max-w-[320px] [&::-webkit-media-controls-panel]:bg-[#EAE5D8]" />
            )}
          </div>
        ))}

        {/* 田野发现 */}
        <div className="mt-7">
          <div className="kicker">田野发现 / FIELD FINDINGS</div>
          <ul className="mt-2.5 space-y-2">
            {street.findings.map((f, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-[1.8] text-[#3A372F]">
                <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rotate-45 bg-[#B89B67]" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* 关键词 */}
        <div className="mt-7 flex flex-wrap gap-2">
          {street.keywords.map((k) => (
            <span key={k} className="border border-[#C4BCA8] px-2.5 py-1 text-[11px] text-[#77736A]">
              {k}
            </span>
          ))}
        </div>

        {/* 底部照片条 */}
        {photos.length > 2 && (
          <div className="mt-7">
            <div className="kicker">底片联络表 / CONTACT SHEET</div>
            <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
              {photos.slice(2, 10).map((p, i) => (
                <img
                  key={p.f}
                  src={photoUrl(street.id, i + 2)}
                  alt=""
                  loading="lazy"
                  className="photo-archival h-16 w-20 shrink-0 cursor-pointer object-cover grayscale-[35%] transition-all duration-500 hover:scale-[1.04] hover:grayscale-0"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 底部：前后导航 ── */}
      <footer className="sticky bottom-0 flex shrink-0 items-center justify-between border-t border-[#D8D2C4] bg-[#F3F0E8]/95 px-7 py-3 backdrop-blur-sm max-md:px-5">
        <button
          onClick={onPrev}
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#77736A] transition-colors hover:text-[#8B2F2F]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          上一地点
        </button>
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#A8A296]">
          {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button
          onClick={onNext}
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8B2F2F] transition-colors hover:text-[#6E2323]"
        >
          下一地点
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </footer>
    </div>
  );
}

/** 单则双语口述故事：中文为主，英文折叠 */
function StoryBlock({ story, no }: { story: Story; no: number }) {
  const [openEn, setOpenEn] = useState(false);
  return (
    <article className="border-l-2 border-[#B89B67] bg-[#EFE9DC]/70 px-5 py-4">
      <h3 className="font-serif-sc text-[15px] font-bold leading-snug text-[#1B1B1B]">
        <span className="mr-2 font-mono text-[10px] font-normal tracking-[0.14em] text-[#B89B67]">
          {String(no).padStart(2, '0')}
        </span>
        {story.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-[1.9] text-[#3A372F]">{story.text}</p>

      <button
        onClick={() => setOpenEn((v) => !v)}
        className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#A8A296] transition-colors hover:text-[#8B2F2F]"
        aria-expanded={openEn}
      >
        {openEn ? '− Hide English' : '+ English'}
      </button>
      {openEn && (
        <div className="mt-1.5">
          <div className="font-serif-sc text-[13.5px] font-bold text-[#3A372F]">{story.titleEn}</div>
          <p className="mt-1 text-[12px] leading-[1.8] text-[#5C574C]">{story.textEn}</p>
        </div>
      )}
    </article>
  );
}
