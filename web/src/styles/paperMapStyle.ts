import type { StyleSpecification } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import provinces from '../data/provinces.json';
import chinaMask from '../data/china-mask.json';

/**
 * 纸感水彩底图 —— 参考《中国山河锦绣》水彩地图设计。
 * 米白纸底 / 九省淡彩晕染 / 朱红日轮 / 淡墨山雾，隐藏大部分 POI 噪音，
 * 保留水系、道路骨架、建筑体量与少量城市标注。
 * 境外以「世界矩形挖去中国」的纸底遮罩省略——整幅地图只剩纸上的中国。
 */

// 水彩淡彩 —— 每省一色，低饱和、半透明叠在纸底上
// key 为 DataV GeoJSON 中的省全称
const PROV_WASH: Record<string, string> = {
  四川省: '#C9A9A6', // 陶红
  云南省: '#C9B48A', // 赭黄
  北京市: '#A8B5C2', // 灰蓝
  山西省: '#B5A8A0', // 藕灰
  河南省: '#B9B48E', // 苔黄
  江苏省: '#9DB4B0', // 青碧
  安徽省: '#B0A0B4', // 紫灰
  福建省: '#9FAEB4', // 黛蓝
  湖北省: '#B4A58C', // 秋香
};

const provExpr = ['match', ['get', 'name']] as unknown[];
for (const [k, v] of Object.entries(PROV_WASH)) provExpr.push(k, v);
provExpr.push('transparent');

export const PAPER_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'old-street-paper',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
    provinces: {
      type: 'geojson',
      data: provinces as FeatureCollection,
    },
    chinamask: {
      type: 'geojson',
      data: chinaMask as FeatureCollection,
    },
  },
  layers: [
    // ---- 纸底 ----
    {
      id: 'bg',
      type: 'background',
      paint: { 'background-color': '#F4EFE4' },
    },
    // ---- 九省水彩晕染（参考手绘地图的淡彩铺色；街道级逐渐淡出） ----
    {
      id: 'province-wash',
      type: 'fill',
      source: 'provinces',
      paint: {
        'fill-color': provExpr as never,
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.34, 7, 0.28, 9.5, 0.1],
      },
    },
    // ---- 省界描边（淡墨） ----
    {
      id: 'province-wash-line',
      type: 'line',
      source: 'provinces',
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': '#8A7A66',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 8, 1.4],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.55, 8, 0.22],
      },
    },
    // ---- 省名书法标注（仅低倍缩放显示，参考图中竖排省名） ----
    {
      id: 'province-wash-label',
      type: 'symbol',
      source: 'provinces',
      maxzoom: 6.8,
      layout: {
        'symbol-placement': 'point',
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 15,
        'text-letter-spacing': 0.32,
      },
      paint: {
        'text-color': '#6E5F4E',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.6,
        'text-opacity': 0.9,
      },
    },
    // ---- 土地利用 ----
    {
      id: 'landuse-residential',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'residential'],
      paint: { 'fill-color': '#EBE6D8', 'fill-opacity': 0.7 },
    },
    {
      id: 'landcover-grass',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: { 'fill-color': '#DFE0CB', 'fill-opacity': 0.65 },
    },
    {
      id: 'landcover-wood',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'forest']]],
      paint: { 'fill-color': '#D8DCC5', 'fill-opacity': 0.6 },
    },
    // ---- 水系 ----
    {
      id: 'water',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      paint: { 'fill-color': '#B9C4C6', 'fill-opacity': 0.85 },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'waterway',
      paint: {
        'line-color': '#B9C4C6',
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.6, 14, 2.5, 18, 8],
      },
    },
    // ---- 建筑体量 ----
    {
      id: 'building',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'building',
      minzoom: 12,
      paint: {
        'fill-color': '#DDD5C2',
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.35, 15, 0.85],
        'fill-outline-color': '#CDC3AC',
      },
    },
    // ---- 道路 ----
    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service', 'track']]],
      minzoom: 13,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#D9D2BF',
        'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1.5, 18, 12],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service', 'track']]],
      minzoom: 13,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#EFEAD9',
        'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 18, 9],
      },
    },
    {
      id: 'road-major-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#C9C0A8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.8, 12, 3, 18, 18],
      },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#F5F1E4',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 12, 1.8, 18, 14],
      },
    },
    {
      id: 'road-highway-casing',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#C2B79E',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 12, 3.6, 18, 20],
      },
    },
    {
      id: 'road-highway',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'motorway'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#E4DCC4',
        'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 12, 2.2, 18, 15],
      },
    },
    {
      id: 'road-path',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['path', 'pedestrian', 'footway']]],
      minzoom: 14,
      paint: {
        'line-color': '#C9C0A8',
        'line-dasharray': [2, 2],
        'line-width': 1,
      },
    },
    // ---- 行政界 ----
    {
      id: 'boundary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['>=', ['get', 'admin_level'], 4],
      paint: {
        'line-color': '#CBC2AC',
        'line-dasharray': [3, 2],
        'line-width': 0.8,
      },
    },
    // ---- 标注 ----
    {
      id: 'label-water',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Italic'],
        'text-size': 11,
        'text-letter-spacing': 0.1,
      },
      paint: { 'text-color': '#8A9A9E' },
    },
    {
      id: 'label-road',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 14,
      layout: {
        'symbol-placement': 'line',
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
      },
      paint: {
        'text-color': '#8A8272',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.2,
      },
    },
    {
      id: 'label-place-small',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'village']]],
      minzoom: 10,
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 16, 13],
        'text-letter-spacing': 0.08,
        'text-transform': 'uppercase',
      },
      paint: {
        'text-color': '#9A9282',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.4,
      },
    },
    {
      id: 'label-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 15],
        'text-letter-spacing': 0.12,
      },
      paint: {
        'text-color': '#6B655A',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.6,
      },
    },
    {
      id: 'label-province',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'state'],
      minzoom: 6.8,
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 13,
        'text-letter-spacing': 0.3,
      },
      paint: {
        'text-color': '#B0A892',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.4,
      },
    },
    {
      id: 'label-country',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 14,
        'text-letter-spacing': 0.35,
        'text-transform': 'uppercase',
      },
      paint: {
        'text-color': '#A8A08C',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.4,
      },
    },
    // ---- 境外遮罩：世界矩形挖去中国，把国外一切瓦片内容盖成纸底 ----
    {
      id: 'china-mask-fill',
      type: 'fill',
      source: 'chinamask',
      filter: ['==', ['get', 'part'], 'mask'],
      paint: {
        'fill-color': '#F4EFE4',
        'fill-opacity': 1,
      },
    },
    // ---- 境内暖染：让中国本土读作画纸上的水彩主体 ----
    {
      id: 'china-warm',
      type: 'fill',
      source: 'chinamask',
      filter: ['==', ['get', 'part'], 'warm'],
      paint: {
        'fill-color': '#EFE6D2',
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 7, 0.3, 9.5, 0],
      },
    },
    // ---- 海域名：画在遮罩之上（黄海/东海/南海在纸底上仍可见） ----
    {
      id: 'label-sea',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'water_name',
      filter: ['in', ['get', 'class'], ['literal', ['ocean', 'sea']]],
      maxzoom: 6.5,
      layout: {
        'text-field': ['coalesce', ['get', 'name:zh-Hans'], ['get', 'name:zh'], ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Italic'],
        'text-size': 12,
        'text-letter-spacing': 0.4,
      },
      paint: {
        'text-color': '#7E949B',
        'text-halo-color': '#F4EFE4',
        'text-halo-width': 1.4,
      },
    },
    // ---- 国界线描（参考图手绘朱墨描边） ----
    {
      id: 'china-outline-line',
      type: 'line',
      source: 'chinamask',
      filter: ['==', ['get', 'part'], 'warm'],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': '#A85F4A',
        'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1, 6, 1.8, 9, 2.6],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.85, 8, 0.5],
      },
    },
  ],
};
