import { motion } from 'framer-motion';
import { DECKLE_COUNT, DECKLE_SIZES } from '../lib/paper';
import { sheetSettle } from '../lib/motion';

/**
 * 毛边滤镜定义 —— 只让纸的边参差，不动纸上的字。
 *
 * 用位移滤镜而不是图片蒙版：纸的高度随内容变化，位图蒙版会被拉伸，
 * 一拉伸纤维的尺度就变了。
 *
 * 三档幅度共用同一条噪声，只是位移量不同：小按钮和大纸各自咬得动。
 */
export function DeckleDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
      <defs>
        {DECKLE_SIZES.flatMap(({ key, scale }) =>
          Array.from({ length: DECKLE_COUNT }, (_, i) => (
            <filter
              key={`${key}-${i}`}
              id={`deckle-${key}-${i}`}
              x="-14%"
              y="-14%"
              width="128%"
              height="128%"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.014 0.045"
                numOctaves={3}
                seed={i * 37 + 5}
                result="fibre"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="fibre"
                scale={scale}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )),
        )}
      </defs>
    </svg>
  );
}

/**
 * 纸层：色 + 纤维 + 毛边 + 阴影都长在它身上，内容待在它上面。
 *
 * 挂了 sheetSettle 变体，父级用 `paperGroup` 编排时它会自己落定。
 * 父级不驱动时 framer 不施加变体初始值 —— 静态渲染，所以老用法零改动。
 */
export function PaperSheet() {
  return <motion.span className="paper__sheet" variants={sheetSettle} aria-hidden />;
}
