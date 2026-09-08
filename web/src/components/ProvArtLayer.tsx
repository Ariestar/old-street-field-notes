/**
 * 九省风物插画层 —— 熊猫/梯田/天坛/石窟佛/园林/迎客松/土楼/黄鹤楼/牌匾。
 * 锚定各省地理坐标，随地图平移缩放移动（map.project + zoom 比例），
 * 与参考图一致：插画就落在水彩省份色块上（multiply 融纸）。
 * zoom > 5.2 整体淡出，与边框装饰同步。
 */
import { useEffect, useRef, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';
import { PROV_ART } from '../data/provArt';

const BASE = import.meta.env.BASE_URL;
/** 基准 zoom：全国视野 */
const BASE_ZOOM = 4.3;

export function ProvArtLayer({ map }: { map: MLMap | null }) {
  const [fade, setFade] = useState(false);
  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (!map) return;
    const sync = () => setFade(map.getZoom() > 5.2);
    sync();
    map.on('zoom', sync);
    return () => {
      map.off('zoom', sync);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      const k = Math.pow(2, map.getZoom() - BASE_ZOOM);
      PROV_ART.forEach((a, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        const p = map.project(a.coord);
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.style.width = `${Math.round(a.size * k)}px`;
      });
    };
    update();
    map.on('move', update);
    return () => {
      map.off('move', update);
    };
  }, [map]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[6] overflow-hidden transition-opacity duration-700 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {PROV_ART.map((a, i) => (
        <img
          key={a.prov}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          src={`${BASE}decor/${a.file}`}
          alt=""
          className="pointer-events-none absolute mix-blend-multiply"
          style={{ transform: 'translate(-50%, -50%)' }}
          draggable={false}
        />
      ))}
    </div>
  );
}
