export type Category = '建筑' | '人物' | '商业' | '文化' | '生活' | '历史';

export interface GeoPoint {
  /** [lng, lat] */
  coord: [number, number];
}

export interface Street {
  id: string;
  /** 街名, e.g. 宽窄巷子 */
  name: string;
  /** 完整行政地名 */
  fullName: string;
  city: string;
  province: string;
  /** [lng, lat] */
  coord: [number, number];
  /** 归属巡礼路线 */
  route: RouteId;
  /** 路线中的次序 (1-based) */
  order: number;
  categories: Category[];
  /** 一句话定位 */
  tagline: string;
  /** 编辑部导语（档案卡主文） */
  intro: string;
  /** 田野发现 */
  findings: string[];
  /** 采访摘录（如有真实口述则用真实内容） */
  interviews?: Interview[];
  /** 历史年代 */
  period: string;
  /** 照片目录 = /photos/<id>/NN.jpg, dims from media-manifest */
  photoCount: number;
  /** 关键词 */
  keywords: string[];
  /** 保护级别 */
  heritage?: string;
}

export interface Interview {
  person: string;
  age?: number;
  role: string;
  quote: string;
  context?: string;
  audio?: string;
  audioDuration?: string;
}

export type RouteId = 'bashu' | 'dianyun' | 'zhongyuan' | 'jiangnan' | 'minchu';

export interface Route {
  id: RouteId;
  name: string;
  en: string;
  color: string;
  /** 路线叙述 */
  story: string;
  streetIds: string[];
}
