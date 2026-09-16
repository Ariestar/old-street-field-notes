import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MLMap, type StyleSpecification } from 'maplibre-gl';

/**
 * 创建持久地图实例。地图挂在一个常驻 DOM 容器上，
 * 由 App 控制其视口位置（首屏 100vh → 常驻底图）。
 */
export function useMapLibre(
  containerRef: React.RefObject<HTMLDivElement | null>,
  style: StyleSpecification,
  onMapReady?: (map: MLMap) => void,
) {
  const mapRef = useRef<MLMap | null>(null);
  const readyRef = useRef(onMapReady);
  readyRef.current = onMapReady;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [104.0, 35.0],
      zoom: 4.2,
      minZoom: 3.4,
      maxZoom: 17,
      attributionControl: false,
      renderWorldCopies: false,
      // 纪录片感：缓动参数
      maxPitch: 0,
      dragRotate: false,
      touchZoomRotate: true,
      fadeDuration: 300,
    });
    mapRef.current = map;
    if (import.meta.env.DEV) {
      (window as unknown as { __map?: MLMap }).__map = map; // 调试用
    }
    map.on('load', () => {
      setReady(true);
      readyRef.current?.(map);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { map: mapRef.current, ready };
}
