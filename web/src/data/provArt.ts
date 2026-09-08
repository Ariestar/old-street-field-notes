/**
 * 九省风物插画 —— 从《中国山河锦绣》参考图抠取的原画元素。
 * 锚点经约束求解器定位：不压街道节点（≥10px）、避省名书法标签、
 * 不与已放插画重叠、深覆盖城市标签罚分。zoom > 5.2 淡出（与边框装饰同步）。
 */

export interface ProvArt {
  /** 省全称（DataV GeoJSON 命名） */
  prov: string;
  /** 短名（与 streets.ts 的 province 字段对应） */
  short: string;
  /** 锚点坐标 [lng, lat]（省域内，避开节点簇） */
  coord: [number, number];
  /** 插画文件名（public/decor/ 下） */
  file: string;
  /** 显示宽度 px（zoom 4.3 基准） */
  size: number;
}

export const PROV_ART: ProvArt[] = [
  { prov: '四川省', short: '四川', coord: [97.43, 33.87],   file: 'prov-sichuan.png', size: 96 },
  { prov: '云南省', short: '云南', coord: [97.61, 24.77],   file: 'prov-yunnan.png',  size: 100 },
  { prov: '北京市', short: '北京', coord: [116.44, 41.13],  file: 'prov-beijing.png', size: 40 },
  { prov: '山西省', short: '山西', coord: [112.45, 40.23],  file: 'prov-shanxi.png',  size: 60 },
  { prov: '河南省', short: '河南', coord: [112.59, 33.96],  file: 'prov-henan.png',   size: 78 },
  { prov: '湖北省', short: '湖北', coord: [108.67, 30.5],   file: 'prov-hubei.png',   size: 46 },
  { prov: '江苏省', short: '江苏', coord: [120.74, 33.3],   file: 'prov-jiangsu.png', size: 92 },
  { prov: '安徽省', short: '安徽', coord: [117.34, 32.28],  file: 'prov-anhui.png',   size: 80 },
  { prov: '福建省', short: '福建', coord: [116.54, 26.76],  file: 'prov-fujian.png',  size: 70 },
];
