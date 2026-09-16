import type { Variants } from 'framer-motion';

/**
 * 全站动效的唯一定义处。
 *
 * 之前每个组件各写各的：同一个贝塞尔在 ArchiveCard、ScrollCover 里各定义一遍，
 * TopNav 里内联一遍，MapOverlays 又用了另一条 easeOut；时长也是 0.18~1.05 散落。
 * 这里收敛成一套刻度，index.css 的 --duration-* / --ease-* 与之一一对应，
 * 让 CSS 过渡和 framer 动画共用同一把尺。
 */

/** 时长（秒，framer 用） */
export const DUR = {
  /** 悬停反馈 */
  instant: 0.18,
  /** 就地切换（照片翻页、帧号） */
  quick: 0.34,
  /** 入场揭示 */
  base: 0.55,
  /** 纸片落定 */
  settle: 0.72,
  /** 大件（画卷、档案卡抽屉） */
  slow: 0.95,
  /** 首屏开卷仪式 */
  hold: 1.1,
} as const;

/** 缓动只有两条：进场、退场 */
export const EASE_STANDARD: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
export const EASE_EXIT: [number, number, number, number] = [0.4, 0, 1, 1];
export const EASE = { standard: EASE_STANDARD, exit: EASE_EXIT } as const;

/** 错落间隔 */
export const STAGGER = { tight: 0.05, base: 0.08, loose: 0.12 } as const;

/**
 * 纸张落定的编排容器：只负责编排，自身没有视觉效果。
 * 子元素（纸层、内容）各自声明变体，由它统一推进。
 */
export const paperGroup: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.04 } },
};

/** 嵌套编排用：列表很长（如总表 24 行）时收紧间隔，避免尾巴拖太久 */
export const paperGroupTight: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: STAGGER.tight, delayChildren: 0.02 } },
};

/**
 * 纸层落定：从斜上方落下 → 倾斜回正 → 阴影随纸一起沉底。
 *
 * 这里的 rotate 归零不等于「不倾斜」：纸的静息倾斜是 CSS 独立的
 * `rotate: var(--paper-tilt)`，framer 写的是 transform，两者叠加。
 * 所以 rotate 3.4 → 0 = 回正到那一片纸固有的 ±1.5°。
 */
export const sheetSettle: Variants = {
  hidden: { y: -16, rotate: 3.4, opacity: 0 },
  shown: { y: 0, rotate: 0, opacity: 1, transition: { duration: DUR.settle, ease: EASE_STANDARD } },
};

/** 纸上的内容：比纸晚一步浮现，不做位移炫耀 */
export const contentIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_STANDARD } },
};

/** 纯淡入：大段文字、图例行 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: DUR.base, ease: EASE_STANDARD } },
};

/** 斜上方落入的一般元素：标题、统计格、列表项 */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_STANDARD } },
};

/** 套印副版落版：从更远的错位回到落点（落点由 CSS 的 --plate-* 给） */
export const plateSettle: Variants = {
  hidden: { x: 7, y: -5, rotate: 1.1, opacity: 0 },
  shown: { x: 0, y: 0, rotate: 0, opacity: 1, transition: { duration: DUR.settle, ease: EASE_STANDARD } },
};

/** 进入视口即播放一次的标准参数（克制：不进视口不算，跑完不再算） */
export const revealViewport = { once: true, amount: 0.25 } as const;

/** 纸片被拈起一点（悬停只动 transform，不动阴影避免逐帧重绘） */
export const hoverLift = { y: -1.5 } as const;
export const hoverLiftTight = { y: -1 } as const;

/** 照片左右切换：方向感与原先一致，刻度收回令牌 */
export function slideSwap(dir: number) {
  return {
    initial: { opacity: 0, x: dir * 36 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -dir * 36 },
    transition: { duration: DUR.quick, ease: EASE_STANDARD },
  };
}
