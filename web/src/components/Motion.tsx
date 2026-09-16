import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { DUR, EASE_STANDARD, paperGroup, revealViewport, riseIn } from '../lib/motion';

/**
 * 动效编排原语。三个都只动 transform / opacity（合成器友好），
 * 且都是「进视口跑一次」，不进视口不计算。
 */

/** 首次进入视口时播放一次入场 */
export function Reveal({
  children,
  variants = riseIn,
  className,
  amount = revealViewport.amount,
}: {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 只做编排的容器：自己不产生视觉效果，靠 staggerChildren 把子元素依次推进。
 * 子元素各自声明变体（`sheetSettle` / `contentIn` / `riseIn` / `fadeIn`）。
 */
export function Stagger({
  children,
  className,
  variants = paperGroup,
  amount = revealViewport.amount,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 进视口后从 0 滚到目标值。
 *
 * 走 React state 而不是把 MotionValue 直接当子节点渲染：
 * 后者的文本更新依赖 framer 对子节点的订阅，实测不刷新（一直停在 0）。
 *
 * tabular-nums 是必须的：否则数字宽度变化会把后面的字推来推去。
 */
export function CountUp({
  to,
  duration = 1.4,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE_STANDARD,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {shown}
    </span>
  );
}

/** 悬停微交互用的通用过渡：只动 transform */
export const liftTransition = { duration: DUR.instant, ease: EASE_STANDARD } as const;
