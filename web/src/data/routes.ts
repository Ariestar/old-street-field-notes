import type { Route, RouteId } from './types';

/**
 * 五条巡礼路线 —— 按地理分区组织的一次「中国古街大行走」。
 * 顺序即档案总表与图例中的陈列顺序。
 */
export const ROUTES: Route[] = [
  {
    id: 'bashu',
    name: '巴蜀线',
    en: 'BASHU LINE',
    color: '#8B2F2F',
    story: '从成都平原到川南盐都，七站纵穿蜀地：满城胡同、水码头、盐业会馆与未被打扰的茶馆老街。',
    streetIds: ['kuanzhai', 'jinli', 'huanglongxi', 'jiulong', 'heita', 'yanyun', 'xihutang'],
  },
  {
    id: 'dianyun',
    name: '滇云线',
    en: 'DIANYUN LINE',
    color: '#A8763E',
    story: '昆明三街，一部从唐代拓东城到法式街区、再到老字号门面的城市地层剖面。',
    streetIds: ['wenming', 'xunjin', 'tuodong'],
  },
  {
    id: 'zhongyuan',
    name: '中原线',
    en: 'CENTRAL PLAINS LINE',
    color: '#5B6B4A',
    story: '从元大都胡同到宋代书店街，六站贯穿中原：礼制、晋商、书院与县城牌楼。',
    streetIds: ['nlgx', 'guozijian', 'gujie', 'jinshang', 'shudian', 'gushizi'],
  },
  {
    id: 'jiangnan',
    name: '江南线',
    en: 'JIANGNAN LINE',
    color: '#41627E',
    story: '平江路与屯溪老街——宋代《平江图》的河街范式，与新安江码头的徽商长街。',
    streetIds: ['pingjiang', 'tunxi'],
  },
  {
    id: 'minchu',
    name: '闽楚线',
    en: 'MIN-CHU LINE',
    color: '#7D5A5A',
    story: '从三坊七巷的近代群像，到泉州海丝烟火、漳州侨乡，再到武汉武昌、两湖的明清长街与北伐名桥，六站收束全程。',
    streetIds: ['sanfang', 'xijie', 'dongmei', 'tanhualin', 'chengji', 'tingsiqiao'],
  },
];

export const routeById = (id: RouteId) => ROUTES.find((r) => r.id === id)!;
