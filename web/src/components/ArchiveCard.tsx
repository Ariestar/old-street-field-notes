import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Street, Story } from '../data/types';
import { ORAL_STORIES } from '../data/stories';
import { photosOf, photoUrl } from '../data/media';
import { paperVars } from '../lib/paper';
import { DUR, EASE_STANDARD, contentIn, paperGroup, slideSwap } from '../lib/motion';
import { PaperSheet } from './Paper';
import { PlateText } from './PlateText';

const pad = (n: number) => String(n).padStart(2, '0');

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
  photoIndex,
  onPhotoIndex,
}: {
  street: Street | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
  photoIndex: number;
  onPhotoIndex: (i: number) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {street && (
        <motion.aside
          key={street.id}
          initial={{ x: '102%', opacity: 0.4 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '102%', opacity: 0.4 }}
          transition={{ duration: DUR.slow, ease: EASE_STANDARD }}
          className="paper fixed bottom-4 right-4 top-[72px] z-30 flex w-full max-w-[520px] flex-col max-md:bottom-2 max-md:left-2 max-md:right-2 max-md:top-auto max-md:max-h-[72dvh] max-md:max-w-none"
          style={paperVars(`card-${street.id}`, { deckle: 'lg' })}
        >
          {/* 抽屉滑进来之后，纸层与卡内各段依次落定 */}
          <motion.div
            className="flex h-full flex-col"
            variants={paperGroup}
            initial="hidden"
            animate="shown"
          >
            <PaperSheet />
            <CardInner
              street={street}
              onClose={onClose}
              onPrev={onPrev}
              onNext={onNext}
              index={index}
              total={total}
              photoIndex={photoIndex}
              onPhotoIndex={onPhotoIndex}
            />
          </motion.div>
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
  photoIndex,
  onPhotoIndex,
}: {
  street: Street;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  total: number;
  photoIndex: number;
  onPhotoIndex: (i: number) => void;
}) {
  const photos = photosOf(street.id);
  const n = photos.length;
  const i = n ? Math.min(photoIndex, n - 1) : 0;

  // 切换方向：由下标的前后关系推得，键盘与按钮走同一条路
  const prevIdx = useRef(i);
  const step = (i - prevIdx.current + n) % n;
  const dir = step === 0 || step <= n / 2 ? 1 : -1;
  useEffect(() => {
    prevIdx.current = i;
  }, [i]);

  // 预取左右相邻一张，切换时不空窗
  useEffect(() => {
    if (n < 2) return;
    [1, -1].forEach((d) => {
      const img = new Image();
      img.src = photoUrl(street.id, (i + d + n) % n);
    });
  }, [i, n, street.id]);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* ── 头部：编号 + 标题 ── */}
      <motion.header
        variants={contentIn}
        className="relative shrink-0 border-b border-[#CBC3B4] px-7 pb-5 pt-6 max-md:px-5 max-md:pt-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-serif-sc text-[44px] font-black leading-none text-[#8B2F2F] max-md:text-[36px]">
              {pad(street.order)}
            </span>
            <div>
              <h2 className="font-serif-sc text-[28px] font-bold leading-tight text-[#1F1C18] max-md:text-[24px]">
                <PlateText id={`card-title-${street.id}`}>{street.name}</PlateText>
              </h2>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#6B655C]">
                {street.fullName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="pointer-events-auto -mr-2 -mt-1 p-2 text-[#6B655C] transition-colors hover:text-[#8B2F2F]"
            aria-label="关闭档案"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M2 2 L16 16 M16 2 L2 16" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[#A49D92]">
          <span>FIELD NOTE {pad(street.order)} / {pad(total)}</span>
          <span className="text-[#BCB3A0]">·</span>
          <span>{street.period}</span>
          {street.heritage && (
            <>
              <span className="text-[#BCB3A0]">·</span>
              <span className="text-[#B89B67]">{street.heritage}</span>
            </>
          )}
        </div>
        {/* 暗红下划标 */}
        <div className="absolute bottom-0 left-7 h-[2px] w-14 bg-[#8B2F2F] max-md:left-5" />
      </motion.header>

      {/* ── 主体 ── */}
      <div className="flex-1 overflow-y-auto px-7 pb-6 max-md:px-5">
        {/* 定位句 */}
        <motion.p
          variants={contentIn}
          className="mt-5 font-serif-sc text-[17px] font-medium leading-relaxed text-[#4A453C]"
        >
          「{street.tagline}」
        </motion.p>

        {/* 图片取景框：一次一张，左右切换 */}
        <motion.div variants={contentIn} className="mt-6">
          {/* 相框：一张纸托着照片，纸边参差、照片自己是方的 */}
          <div className="paper p-3" style={paperVars(`card-photo-${street.id}`, { deckle: 'md' })}>
            <PaperSheet />
            <div className="relative h-[300px] overflow-hidden bg-[#E9E3D5] max-md:h-[240px]">
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={i}
                src={photoUrl(street.id, i)}
                alt={`${street.name} 照片 ${i + 1}`}
                loading="lazy"
                {...slideSwap(dir)}
                className="photo-archival absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            </div>
          </div>

          {/* 底片帧号 + 进度刻度 + 翻页：翻页放在相框下方，不压住照片本身 */}
          <div className="mt-2.5 flex items-center gap-3">
            {n > 1 && (
              <button
                onClick={() => onPhotoIndex((i - 1 + n) % n)}
                aria-label="上一张照片"
                className="paper flex h-7 w-7 shrink-0 items-center justify-center font-serif-sc text-[15px] leading-none text-[#4A453C] transition-colors hover:text-[#8B2F2F]"
                style={paperVars(`card-prev-${street.id}`, { deckle: 'sm' })}
              >
                <PaperSheet />
                ‹
              </button>
            )}
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#6B655C]" aria-live="polite">
              FILM {pad(i + 1)} / {pad(n)} · 2026.07—08
            </span>
            <div className="ml-auto flex items-center gap-[5px]">
              {n > 1 &&
                photos.map((p, k) => (
                  <button
                    key={p.f}
                    onClick={() => onPhotoIndex(k)}
                    aria-label={`第 ${k + 1} 张照片`}
                    className={`h-[5px] w-[5px] rotate-45 transition-colors ${
                      k === i ? 'bg-[#8B2F2F]' : 'bg-[#BCB3A0] hover:bg-[#A49D92]'
                    }`}
                  />
                ))}
            </div>
            {n > 1 && (
              <button
                onClick={() => onPhotoIndex((i + 1) % n)}
                aria-label="下一张照片"
                className="paper flex h-7 w-7 shrink-0 items-center justify-center font-serif-sc text-[15px] leading-none text-[#4A453C] transition-colors hover:text-[#8B2F2F]"
                style={paperVars(`card-next-${street.id}`, { deckle: 'sm' })}
              >
                <PaperSheet />
                ›
              </button>
            )}
          </div>
        </motion.div>

        {/* 编辑部导语 */}
        <div className="mt-7">
          <div className="kicker">观察记录 / OBSERVATION</div>
          <p className="mt-2.5 font-serif-sc text-[14px] leading-reading text-[#4A453C]">{street.intro}</p>
          {street.introEn && (
            <div className="mt-4 border-t border-dashed border-[#BCB3A0] pt-3.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#A49D92]">English</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.85] text-[#5C574C]">{street.introEn}</p>
            </div>
          )}
        </div>

        {/* 口述故事 */}
        {(ORAL_STORIES[street.id]?.length ?? 0) > 0 && (
          <div className="mt-8">
            <div className="kicker">口述故事 / ORAL STORIES</div>
            <div className="mt-3 space-y-4">
              {ORAL_STORIES[street.id].map((st, k) => (
                <StoryBlock key={k} story={st} no={k + 1} id={`${street.id}-story-${k + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* 采访摘录：第二张纸（便签）压在档案卡上，唯一的手写墨色 */}
        {street.interviews?.map((iv, k) => (
          <motion.div
            key={k}
            variants={contentIn}
            className="paper mt-7 px-5 py-4"
            style={paperVars(`iv-${street.id}-${k}`, { tone: '#E3D6BB', deckle: 'md' })}
          >
            <PaperSheet />
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#3F4A6B]">
              采访摘录 / INTERVIEW {iv.audio ? '· 含录音' : ''}
            </div>
            <blockquote className="mt-2 font-kai text-[15px] leading-[1.75] text-[#3F4A6B]">
              「{iv.quote}」
            </blockquote>
            <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#6B655C]">
              —— {iv.person}{iv.age ? `，${iv.age} 岁` : ''}，{iv.role}
            </div>
            {iv.audio && (
              <audio controls preload="none" src={iv.audio} className="mt-3 h-8 w-full max-w-[320px] [&::-webkit-media-controls-panel]:bg-[#E9E3D5]" />
            )}
          </motion.div>
        ))}

        {/* 田野发现：同样是叠在卡上的一小张纸 */}
        <motion.div
          variants={contentIn}
          className="paper mt-7 px-5 py-4"
          style={paperVars(`${street.id}-findings`, { tone: '#E9E3D5', deckle: 'md' })}
        >
          <PaperSheet />
          <div className="kicker">田野发现 / FIELD FINDINGS</div>
          <ul className="mt-2.5 space-y-2">
            {street.findings.map((f, k) => (
              <li key={k} className="flex gap-2.5 text-[13px] leading-reading text-[#4A453C]">
                <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rotate-45 bg-[#B89B67]" />
                {f}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 关键词：贴上去的一枚枚小纸标签 */}
        <div className="mt-7 flex flex-wrap gap-2">
          {street.keywords.map((k) => (
            <motion.span
              key={k}
              variants={contentIn}
              whileHover={{ y: -1.5 }}
              className="paper px-2.5 py-1 text-[11px] text-[#4A453C]"
              style={paperVars(`kw-${street.id}-${k}`, { tone: '#E3D6BB', deckle: 'sm' })}
            >
              <PaperSheet />
              {k}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ── 底部：前后导航 ── */}
      <footer className="sticky bottom-0 flex shrink-0 items-center justify-between border-t border-[#CBC3B4] bg-[#F4EFE4] px-7 py-3 max-md:px-5">
        <button
          onClick={onPrev}
          className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B655C] transition-colors hover:text-[#8B2F2F]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          上一地点
        </button>
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#A49D92]">
          {pad(index)} / {pad(total)}
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

/** 单则双语口述故事：裁下来的一小张纸，中文为主，英文折叠 */
function StoryBlock({ story, no, id }: { story: Story; no: number; id: string }) {
  const [openEn, setOpenEn] = useState(false);
  return (
    <motion.article
      variants={contentIn}
      className="paper px-5 py-4"
      style={paperVars(id, { tone: '#E9E3D5', deckle: 'md' })}
    >
      <PaperSheet />
      <h3 className="font-serif-sc text-[15px] font-bold leading-snug text-[#1F1C18]">
        <span className="mr-2 font-mono text-[10px] font-normal tracking-[0.14em] text-[#B89B67]">
          {pad(no)}
        </span>
        {story.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-reading text-[#4A453C]">{story.text}</p>

      <button
        onClick={() => setOpenEn((v) => !v)}
        className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#A49D92] transition-colors hover:text-[#8B2F2F]"
        aria-expanded={openEn}
      >
        {openEn ? '− Hide English' : '+ English'}
      </button>
      {openEn && (
        <div className="mt-1.5">
          <div className="font-serif-sc text-[13.5px] font-bold text-[#4A453C]">{story.titleEn}</div>
          <p className="mt-1 text-[12px] leading-[1.8] text-[#5C574C]">{story.textEn}</p>
        </div>
      )}
    </motion.article>
  );
}
