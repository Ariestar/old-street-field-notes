import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Map as MLMap } from 'maplibre-gl';

/**
 * 地图右上角控件组：缩放 / 复位 / 全图。
 * 复位 = 回到全国巡礼视图。
 */
export function MapControls({ map, onReset }: { map: MLMap; onReset: () => void }) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const nav = new maplibregl.NavigationControl({ showCompass: false });
    const el = nav.onAdd(map);
    el.classList.add('maplibregl-ctrl');
    navRef.current.appendChild(el);
    return () => {
      nav.onRemove();
    };
  }, [map]);

  return (
    <div className="absolute right-4 top-[68px] z-20 flex flex-col items-end gap-2">
      <div ref={navRef} className="[&_.maplibregl-ctrl]:!m-0" />
      <button
        onClick={onReset}
        className="group flex items-center gap-2 border border-[#C4BCA8] bg-[#F3F0E8]/90 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-[#77736A] uppercase shadow-[2px_2px_0_rgba(27,27,27,0.08)] transition-colors hover:border-[#8B2F2F] hover:text-[#8B2F2F]"
        title="回到实践路线全图"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-500 group-hover:-rotate-180">
          <path d="M6 1 A5 5 0 1 1 1.2 4.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <path d="M1 1 L1.2 4.5 L4.5 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
        回到全图 / OVERVIEW
      </button>
    </div>
  );
}
