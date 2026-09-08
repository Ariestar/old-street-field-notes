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
  { prov: '四川省', short: '四川', coord: [101.86, 30.21],  file: 'prov-sichuan.png', size: 130 },
  { prov: '云南省', short: '云南', coord: [101.06, 24.32],  file: 'prov-yunnan.png',  size: 143 },
  { prov: '北京市', short: '北京', coord: [116.46, 40.18],  file: 'prov-beijing.png', size: 64 },
  { prov: '山西省', short: '山西', coord: [112.01, 36.74],  file: 'prov-shanxi.png',  size: 84 },
  { prov: '河南省', short: '河南', coord: [113.65, 33.95],  file: 'prov-henan.png',   size: 106 },
  { prov: '湖北省', short: '湖北', coord: [112.61, 31.06],  file: 'prov-hubei.png',   size: 114 },
  { prov: '江苏省', short: '江苏', coord: [120.1, 32.09],   file: 'prov-jiangsu.png', size: 110 },
  { prov: '安徽省', short: '安徽', coord: [117.32, 31.22],  file: 'prov-anhui.png',   size: 92 },
  { prov: '福建省', short: '福建', coord: [118.19, 26.37],  file: 'prov-fujian.png',  size: 102 },
];
