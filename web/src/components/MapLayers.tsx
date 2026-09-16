import { useEffect, useRef } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { STREETS } from '../data/streets';
import { routeById } from '../data/routes';
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
              color: routeById(s.route as RouteId).color,
              categories: s.categories.join(','),
              province: s.province,
            },
            geometry: { type: 'Point' as const, coordinates: s.coord },
          })),
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
          'circle-color': ['get', 'color'],
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
          'circle-color': '#F4EFE4',
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
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 1.4,
          'circle-stroke-color': '#4A453C',
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
          'text-color': '#1F1C18',
          'text-halo-color': '#F4EFE4',
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

  // 节点随路线筛选显隐
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
