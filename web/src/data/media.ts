/** media-manifest.json 的形状 */
export type MediaManifest = Record<string, { f: string; w: number; h: number }[]>;

import manifest from './media-manifest.json';
export const MEDIA = manifest as MediaManifest;

/** 取某条街第 i 张照片的 URL（0-based） */
export const photoUrl = (streetId: string, i: number) =>
  `/photos/${streetId}/${MEDIA[streetId][i % MEDIA[streetId].length].f}`;

/** 取某条街的照片列表 */
export const photosOf = (streetId: string) => MEDIA[streetId] ?? [];
