/** media-manifest.json 的形状 */
export type MediaManifest = Record<string, { f: string; w: number; h: number }[]>;

import manifest from './media-manifest.json';
export const MEDIA = manifest as MediaManifest;

/** 取某条街第 i 张照片的 URL（0-based）；BASE_URL 兼容子路径部署（GitHub Pages 等） */
export const photoUrl = (streetId: string, i: number) =>
  `${import.meta.env.BASE_URL}photos/${streetId}/${MEDIA[streetId][i % MEDIA[streetId].length].f}`;

/** 取某条街的照片列表 */
export const photosOf = (streetId: string) => MEDIA[streetId] ?? [];
