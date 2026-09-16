import type { CSSProperties } from 'react';

/**
 * 纸的性状 —— 同一片纸每次渲染都在同一处。
 *
 * 全部纸片共用一张无缝纤维纹理，靠 background-position 各取一处：
 * 同一张纸的不同位置，同源但不雷同。
 */
export const DECKLE_COUNT = 4;

/**
 * 毛边幅度按纸的大小分档 —— 位移量是绝对像素，
 * 28px 的按钮和 800px 的大纸不能用同一个 scale。
 */
export const DECKLE_SIZES = [
  { key: 'sm', scale: 3.5 },
  { key: 'md', scale: 8 },
  { key: 'lg', scale: 15 },
] as const;

export type DeckleSize = (typeof DECKLE_SIZES)[number]['key'];

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** 纹理 1024²，纸片远小于它，偏移落在一屏内即可 */
function paperOffset(id: string): { x: number; y: number } {
  const h = hash(id);
  return { x: -(h % 600), y: -((h >> 9) % 460) };
}

/** ±1.5°：像手放上去的，不是像被拉歪的 */
function paperTilt(id: string): number {
  return (hash(`${id}tilt`) % 300) / 100 - 1.5;
}

/** 这片纸用哪一条毛边滤镜 */
function deckleIndex(id: string, count = DECKLE_COUNT): number {
  return hash(`${id}deckle`) % count;
}

/**
 * 一片纸的全部性状。
 *
 * @param tone   换一档纸色；叠在别的纸上的纸必须换色，否则跟底下的纸同色、只剩一圈描边
 * @param deckle 毛边档位（sm/md/lg）；传 false 表示不咬边（只用于整幅铺满的背景面）
 * @param tilt   是否倾斜；贴边通栏的纸带不要倾斜
 */
export function paperVars(
  id: string,
  opts: { tone?: string; deckle?: DeckleSize | false; tilt?: boolean } = {},
): CSSProperties {
  const { tone, deckle = 'md', tilt = true } = opts;
  const { x, y } = paperOffset(id);
  const vars: Record<string, string> = {
    '--paper-x': `${x}px`,
    '--paper-y': `${y}px`,
    '--paper-tilt': tilt ? `${paperTilt(id).toFixed(2)}deg` : '0deg',
  };
  if (deckle) vars['--deckle'] = `url(#deckle-${deckle}-${deckleIndex(id)})`;
  if (tone) vars['--paper-tone'] = tone;
  return vars as CSSProperties;
}

/** 套印副版的错位量 */
export function plateVars(id: string): CSSProperties {
  const h = hash(`${id}plate`);
  return {
    '--plate-x': `${((h % 33) / 10 - 1.4).toFixed(2)}px`,
    '--plate-y': `${(((h >> 6) % 16) / 10 + 0.3).toFixed(2)}px`,
    '--plate-rot': `${(((h >> 12) % 45) / 100 - 0.22).toFixed(3)}deg`,
  } as CSSProperties;
}
