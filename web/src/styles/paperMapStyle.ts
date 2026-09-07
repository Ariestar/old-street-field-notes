import type { StyleSpecification } from 'maplibre-gl';

/**
 * 纸感低饱和底图 —— 基于 OpenFreeMap Liberty 样式的二次设计。
 * 米白纸底 / 灰褐道路 / 淡墨水域，隐藏大部分 POI 噪音，
 * 保留水系、道路骨架、建筑体量与少量城市标注。
 */
export const PAPER_MAP_STYLE: StyleSpecification = {
  version: 8,
  name: 'old-street-paper',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  layers: [
    // ---- 纸底 ----
    {
      id: 'bg',
      type: 'background',
      paint: { 'background-color': '#F1EDE2' },
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
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
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
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
      },
      paint: {
        'text-color': '#8A8272',
        'text-halo-color': '#F1EDE2',
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
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 16, 13],
        'text-letter-spacing': 0.08,
        'text-transform': 'uppercase',
      },
      paint: {
        'text-color': '#9A9282',
        'text-halo-color': '#F1EDE2',
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
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 15],
        'text-letter-spacing': 0.12,
      },
      paint: {
        'text-color': '#6B655A',
        'text-halo-color': '#F1EDE2',
        'text-halo-width': 1.6,
      },
    },
    {
      id: 'label-province',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'state'],
      layout: {
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 13,
        'text-letter-spacing': 0.3,
      },
      paint: {
        'text-color': '#B0A892',
        'text-halo-color': '#F1EDE2',
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
        'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 14,
        'text-letter-spacing': 0.35,
        'text-transform': 'uppercase',
      },
      paint: {
        'text-color': '#A8A08C',
        'text-halo-color': '#F1EDE2',
        'text-halo-width': 1.4,
      },
    },
  ],
};
