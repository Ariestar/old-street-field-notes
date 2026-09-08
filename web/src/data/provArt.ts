/**
 * 九省风物插画 —— 从《中国山河锦绣》参考图抠取的原画元素。
 * 锚定省域内坐标（避开街道节点簇，熊猫落川西山区、土楼落闽北），
 * 随地图平移缩放移动；全国视野显示，zoom > 5.2 淡出（与边框装饰同步）。
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
  { prov: '四川省', short: '四川', coord: [100.3, 29.6],   file: 'prov-sichuan.png', size: 54 },
  { prov: '云南省', short: '云南', coord: [99.0, 23.9],    file: 'prov-yunnan.png',  size: 56 },
  { prov: '北京市', short: '北京', coord: [116.41, 40.88], file: 'prov-beijing.png', size: 22 },
  { prov: '山西省', short: '山西', coord: [112.75, 39.0],  file: 'prov-shanxi.png',  size: 34 },
  { prov: '河南省', short: '河南', coord: [115.05, 32.1],  file: 'prov-henan.png',   size: 42 },
  { prov: '湖北省', short: '湖北', coord: [112.35, 31.5],  file: 'prov-hubei.png',   size: 26 },
  { prov: '江苏省', short: '江苏', coord: [118.7, 32.75],  file: 'prov-jiangsu.png', size: 52 },
  { prov: '安徽省', short: '安徽', coord: [117.25, 32.01], file: 'prov-anhui.png',   size: 44 },
  { prov: '福建省', short: '福建', coord: [116.95, 26.0],  file: 'prov-fujian.png',  size: 38 },
];
