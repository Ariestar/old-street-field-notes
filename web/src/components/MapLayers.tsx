import { useEffect, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { STREETS, streetById } from '../data/streets';
import { ROUTES } from '../data/routes';
import type { RouteId } from '../data/types';

export interface MapLayersProps {
  map: MLMap;
  /** 当前选中的街道 */
  selectedId: string | null;
  /** 当前聚焦的路线（null = 全部） */
  activeRoute: RouteId | null;
  /** 悬停节点 */
  hoverId: string | null;
  onNodeClick: (id: string) => void;
  onNodeHover: (id: string | null) => void;
}

const NODE_SRC = 'streets-nodes';
const ROUTE_SRC = 'walk-routes';

/** 生成带轻微手工折点的路线 GeoJSON（贝塞尔近似：在两站间插入缓弯） */
function routeFeature(streetIds: string[], routeId: RouteId, color: string) {
  const pts = streetIds.map((id) => streetById(id).coord);
  // Catmull-Rom → 折线密集采样，让路线有手绘弧度
  const curve: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const segments = 48;
    for (let t = 0; t < 1; t += 1 / segments) {
      const t2 = t * t;
      const t3 = t2 * t;
      const lng =
        0.5 *
        (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lat =
        0.5 *
        (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      curve.push([lng, lat]);
    }
  }
  curve.push(pts[pts.length - 1]);
  return {
    type: 'Feature' as const,
    id: routeId,
    properties: { route: routeId, color },
    geometry: { type: 'LineString' as const, coordinates: curve },
  };
}

export function MapLayers({
  map,
  selectedId,
  activeRoute,
  hoverId,
  onNodeClick,
  onNodeHover,
}: MapLayersProps) {
  const hoveredFeatureRef = useRef<number | null>(null);

  // ---------- 数据源 & 图层（一次建立） ----------
  useEffect(() => {
    if (!map.hasImage('node-dot')) {
      // 程序生成节点贴图：暖纸底 + 墨圈
      const size = 64;
      const data = new Uint8Array(size * size * 4);
      const c = size / 2;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - c + 0.5;
          const dy = y - c + 0.5;
          const d = Math.sqrt(dx * dx + dy * dy);
          const i = (y * size + x) * 4;
          if (d <= 15) {
            // 实心暗红核心
            data[i] = 0x8b; data[i + 1] = 0x2f; data[i + 2] = 0x2f; data[i + 3] = 255;
          } else if (d <= 19) {
            // 纸色描边
            data[i] = 0xf1; data[i + 1] = 0xed; data[i + 2] = 0xe2; data[i + 3] = 255;
          } else if (d <= 22) {
            // 墨圈
            data[i] = 0x3a; data[i + 1] = 0x37; data[i + 2] = 0x2f; data[i + 3] = 200;
          } else if (d <= 30) {
            const alpha = Math.max(0, 1 - (d - 22) / 8) * 90;
            data[i] = 0x8b; data[i + 1] = 0x2f; data[i + 2] = 0x2f; data[i + 3] = alpha;
          } else {
            data[i + 3] = 0;
          }
        }
      }
      map.addImage('node-dot', { width: size, height: size, data });
    }

    if (!map.getSource(NODE_SRC)) {
      map.addSource(NODE_SRC, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: STREETS.map((s) => ({
            type: 'Feature' as const,
            id: s.order,
            properties: {
              id: s.id,
              name: s.name,
              order: s.order,
              route: s.route,
              categories: s.categories.join(','),
              province: s.province,
            },
            geometry: { type: 'Point' as const, coordinates: s.coord },
          })),
        },
      });
    }

    if (!map.getSource(ROUTE_SRC)) {
      map.addSource(ROUTE_SRC, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: ROUTES.map((r) => routeFeature(r.streetIds, r.id, r.color)),
        },
      });
    }

    if (!map.getLayer('route-glow')) {
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 8, 10, 14],
          'line-opacity': 0.1,
          'line-blur': 6,
        },
      });
    }
    if (!map.getLayer('route-dash')) {
      map.addLayer({
        id: 'route-dash',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.6, 10, 3],
          'line-opacity': 0.55,
          'line-dasharray': [3, 2.5],
        },
      });
    }
    if (!map.getLayer('route-solid')) {
      map.addLayer({
        id: 'route-solid',
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 2, 10, 3.6, 13, 5],
          'line-opacity': 0.92,
        },
      });
    }
    if (!map.getLayer('node-halo')) {
      map.addLayer({
        id: 'node-halo',
        type: 'circle',
        source: NODE_SRC,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 6, 8, 10, 12, 18],
          'circle-color': '#8B2F2F',
          'circle-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.25, 0.12],
          'circle-blur': 0.6,
        },
      });
    }
    if (!map.getLayer('node-stroke')) {
      map.addLayer({
        id: 'node-stroke',
        type: 'circle',
        source: NODE_SRC,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 7.5, 8, 12, 12, 22],
          'circle-color': '#F1EDE2',
        },
      });
    }
    if (!map.getLayer('node-core')) {
      map.addLayer({
        id: 'node-core',
        type: 'circle',
        source: NODE_SRC,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            4, ['case', ['boolean', ['feature-state', 'hover'], false], 6.5, 4.5],
            8, ['case', ['boolean', ['feature-state', 'hover'], false], 9.5, 6.5],
            12, ['case', ['boolean', ['feature-state', 'hover'], false], 16, 11]],
          'circle-color': ['case',
            ['boolean', ['feature-state', 'selected'], false], '#B89B67',
            '#8B2F2F'],
          'circle-stroke-width': 1.4,
          'circle-stroke-color': '#3A372F',
        },
      });
    }
    if (!map.getLayer('node-label')) {
      map.addLayer({
        id: 'node-label',
        type: 'symbol',
        source: NODE_SRC,
        minzoom: 4.6,
        layout: {
          'text-field': ['concat', ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 10, 13],
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#1B1B1B',
          'text-halo-color': '#F1EDE2',
          'text-halo-width': 2.2,
        },
      });
    }
  }, [map]);

  // ---------- 交互事件 ----------
  // 注：不使用 maplibre 图层级事件 —— 该版本 delegated listener 的点查询
  // 在此配置下失效，改用通用事件 + bbox 手动命中，行为完全可控。
  useEffect(() => {
    const hitLayer = 'node-core';
    const pickAt = (x: number, y: number) => {
      const r = 5;
      const feats = map.queryRenderedFeatures(
        [[x - r, y - r], [x + r, y + r]],
        { layers: [hitLayer] },
      );
      return feats[0]?.properties?.id as string | undefined;
    };
    const onClick = (e: maplibregl.MapMouseEvent) => {
      const id = pickAt(e.point.x, e.point.y);
      if (id) onNodeClick(id);
    };
    let lastHover: string | null | undefined;
    const onMove = (e: maplibregl.MapMouseEvent) => {
      const id = pickAt(e.point.x, e.point.y);
      map.getCanvas().style.cursor = id ? 'pointer' : '';
      if (lastHover === undefined || lastHover !== id) {
        lastHover = id ?? null;
        onNodeHover(lastHover);
      }
    };
    const onLeave = () => {
      lastHover = null;
      onNodeHover(null);
    };
    map.on('click', onClick);
    map.on('mousemove', onMove);
    map.on('mouseout', onLeave);
    return () => {
      map.off('click', onClick);
      map.off('mousemove', onMove);
      map.off('mouseout', onLeave);
    };
  }, [map, onNodeClick, onNodeHover]);

  // ---------- feature-state: hover ----------
  useEffect(() => {
    const src = map.getSource(NODE_SRC) as (maplibregl.GeoJSONSource & {
      setFeatureState: (id: string | number, state: Record<string, boolean>) => void;
    }) | undefined;
    if (!src?.setFeatureState) return;
    // 清除旧 hover
    if (hoveredFeatureRef.current != null) {
      src.setFeatureState(hoveredFeatureRef.current, { hover: false });
      hoveredFeatureRef.current = null;
    }
    if (hoverId) {
      const s = STREETS.find((x) => x.id === hoverId);
      if (s) {
        src.setFeatureState(s.order, { hover: true });
        hoveredFeatureRef.current = s.order;
      }
    }
  }, [hoverId, map]);

  // ---------- feature-state: selected ----------
  useEffect(() => {
    const src = map.getSource(NODE_SRC) as (maplibregl.GeoJSONSource & {
      setFeatureState: (id: string | number, state: Record<string, boolean>) => void;
    }) | undefined;
    if (!src?.setFeatureState) return;
    STREETS.forEach((s) => {
      src.setFeatureState(s.order, { selected: s.id === selectedId });
    });
  }, [selectedId, map]);

  // 路线筛选可见性
  useEffect(() => {
    const filterFor = (visibleRoutes: RouteId[] | null) =>
      visibleRoutes
        ? ['in', ['get', 'route'], ['literal', visibleRoutes]]
        : ['all'];
    const vis = activeRoute ? [activeRoute] : null;
    ['route-glow', 'route-dash', 'route-solid'].forEach((layer) => {
      if (map.getLayer(layer)) map.setFilter(layer, filterFor(vis) as never);
    });
  }, [activeRoute, map]);

  // 节点随路线筛选淡出
  useEffect(() => {
    const vis = activeRoute ? [activeRoute] : null;
    const filter = vis
      ? ['in', ['get', 'route'], ['literal', vis]]
      : ['all'];
    ['node-halo', 'node-stroke', 'node-core', 'node-label'].forEach((layer) => {
      if (map.getLayer(layer)) map.setFilter(layer, filter as never);
    });
  }, [activeRoute, map]);

  return null;
}
