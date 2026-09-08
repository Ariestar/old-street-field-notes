import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import type { Map as MLMap } from 'maplibre-gl';
import { STREETS, streetById } from './data/streets';
import { ROUTES } from './data/routes';
import type { RouteId } from './data/types';
import { PAPER_MAP_STYLE } from './styles/paperMapStyle';
import { useMapLibre } from './hooks/useMapLibre';
import { ScrollCover } from './components/ScrollCover';
import { MapLayers } from './components/MapLayers';
import { MapHUD } from './components/MapHUD';
import { MapControls } from './components/MapControls';
import { MapLegend } from './components/WalkPlayer';
import { WalkControls, WalkPlayer } from './components/WalkPlayer';
import { ArchiveCard } from './components/ArchiveCard';
import { NodeTooltip, RouteFilter } from './components/MapOverlays';
import { MapDecorations } from './components/MapDecorations';
import { ProvArtLayer } from './components/ProvArtLayer';
import { Findings } from './components/Findings';
import { Closing } from './components/Closing';
import { TopNav } from './components/TopNav';

const ALL_ORDER = ROUTES.flatMap((r) => r.streetIds);

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteId | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progressLabel, setProgressLabel] = useState('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const playerRef = useRef<WalkPlayer | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const sectionMapRef = useRef<HTMLDivElement>(null);

  const { map } = useMapLibre(mapContainerRef, PAPER_MAP_STYLE, (m) => {
    mapRef.current = m;
    // 初始视野：全国
    m.jumpTo({ center: [104.5, 34.8], zoom: 4.3 });
    // ScaleControl（右下，与左下图例错开）
    const scale = new maplibregl.ScaleControl({ maxWidth: 90 });
    m.addControl(scale, 'bottom-right');
    // Attribution（低调）
    m.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: '© OpenFreeMap · © OpenMapTiles' }),
      'bottom-right',
    );
  });

  // ---------- 节点点击 ----------
  const handleNodeClick = useCallback((id: string) => {
    stopWalk();
    setSelectedId(id);
    const s = streetById(id);
    mapRef.current?.flyTo({ center: s.coord, zoom: Math.max(mapRef.current.getZoom(), 10.4), duration: 1400, curve: 1.3 });
  }, []);

  // ---------- 悬停 tooltip 跟踪 ----------
  useEffect(() => {
    if (!map) return;
    let raf = 0;
    const update = () => {
      if (hoverId) {
        const s = streetById(hoverId);
        const p = map.project(s.coord as [number, number]);
        setTooltipPos({ x: p.x, y: p.y });
      }
      raf = requestAnimationFrame(update);
    };
    if (hoverId) raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [map, hoverId]);

  // ---------- 播放 ----------
  const stopWalk = useCallback(() => {
    playerRef.current?.stop();
    setPlaying(false);
  }, []);

  const startWalk = useCallback(() => {
    if (!mapRef.current) return;
    setSelectedId(null);
    setPlaying(true);
    const player = new WalkPlayer(
      mapRef.current,
      (id) => setSelectedId(id),
      () => setPlaying(false),
      (label) => setProgressLabel(label),
    );
    playerRef.current = player;
    player.play(ALL_ORDER);
  }, []);

  useEffect(() => () => playerRef.current?.stop(), []);

  // ---------- 键盘 ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        stopWalk();
      }
      if (!selectedId) return;
      const i = STREETS.findIndex((s) => s.id === selectedId);
      if (e.key === 'ArrowRight') {
        const next = STREETS[(i + 1) % STREETS.length];
        handleNodeClick(next.id);
      }
      if (e.key === 'ArrowLeft') {
        const prev = STREETS[(i - 1 + STREETS.length) % STREETS.length];
        handleNodeClick(prev.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, handleNodeClick, stopWalk]);

  const selectedIndex = useMemo(
    () => (selectedId ? STREETS.findIndex((s) => s.id === selectedId) : -1),
    [selectedId],
  );

  const gotoNeighbor = useCallback(
    (dir: 1 | -1) => {
      if (selectedIndex < 0) return;
      const next = STREETS[(selectedIndex + dir + STREETS.length) % STREETS.length];
      handleNodeClick(next.id);
    },
    [selectedIndex, handleNodeClick],
  );

  const resetView = useCallback(() => {
    stopWalk();
    setSelectedId(null);
    setActiveRoute(null);
    mapRef.current?.flyTo({ center: [104.5, 34.8], zoom: 4.3, duration: 1800 });
  }, [stopWalk]);

  // 路线筛选：同时飞到该路线的包络视野
  const filterRoute = useCallback((r: RouteId | null) => {
    setActiveRoute(r);
    stopWalk();
    setSelectedId(null);
    const map = mapRef.current;
    if (!map) return;
    if (!r) {
      map.flyTo({ center: [104.5, 34.8], zoom: 4.3, duration: 1600 });
      return;
    }
    const pts = ROUTES.find((x) => x.id === r)!.streetIds.map((id) => streetById(id).coord);
    const lngs = pts.map((c) => c[0]);
    const lats = pts.map((c) => c[1]);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 120, maxZoom: 8.5, duration: 1600 },
    );
  }, [stopWalk]);

  return (
    <div className="grain relative min-h-screen bg-[#F3F0E8] text-[#1B1B1B]">
      <TopNav onNavigate={(target) => {
        if (target === 'map') {
          sectionMapRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
        }
      }} />

      {/* ── 常驻地图层 ── */}
      <div className="fixed inset-0 z-0">
        <div ref={mapContainerRef} className="map-fill absolute inset-0" />
        {map && (
          <>
            <MapLayers
              map={map}
              selectedId={selectedId}
              activeRoute={activeRoute}
              hoverId={hoverId}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoverId}
            />
            {/* 地图控件：地图控件常显（画卷覆盖在上，不拦截地图交互） */}
            <div
              className="pointer-events-none absolute inset-0 z-20 [&_a]:pointer-events-auto [&_button]:pointer-events-auto"
            >
              <MapHUD activeRoute={activeRoute} />
              <MapControls map={map} onReset={resetView} />
              <MapLegend activeRoute={activeRoute} onHoverRoute={setActiveRoute} />
              {/* 底部筛选 + 播放 */}
              <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5">
                <RouteFilter active={activeRoute} onChange={filterRoute} />
                <WalkControls playing={playing} onPlay={startWalk} onStop={stopWalk} progressLabel={progressLabel} />
              </div>
            </div>
            <NodeTooltip hoverId={hoverId} screenPos={tooltipPos} />
            {/* 水彩装饰插画：红日/飞鸟/祥云/雾山/帆船，低 zoom 显示 */}
            <MapDecorations map={map} />
            {/* 九省风物插画：熊猫/梯田/天坛/土楼等，锚定省域坐标，低 zoom 显示 */}
            <ProvArtLayer map={map} />
          </>
        )}
      </div>

      {/* ── 滚动内容层（容器穿透地图事件，内容段自行恢复交互） ── */}
      <div className="pointer-events-none relative z-10">
        {/* 地图独占段：首屏即整幅地图，画卷展毕自然让位 */}
        <section ref={sectionMapRef} className="pointer-events-none h-[100svh]" aria-hidden />

        {/* ── 档案总表 ── */}
        <section id="archive" className="pointer-events-auto relative bg-[#F3F0E8]">
          <div className="mx-auto max-w-[1200px] px-6 py-24 max-md:py-16">
            <ArchiveIndex onOpen={(id) => {
              handleNodeClick(id);
              // 滚到地图段，让节点与档案卡可见
              sectionMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} />
          </div>
        </section>

        <Findings onOpenStreet={(id) => {
          handleNodeClick(id);
          sectionMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }} />

        <Closing onBackToMap={resetView} />
      </div>

      {/* ── 档案卡（桌面右侧 / 移动底部） ── */}
      <ArchiveCard
        street={selectedId ? streetById(selectedId) : null}
        onClose={() => setSelectedId(null)}
        onPrev={() => gotoNeighbor(-1)}
        onNext={() => gotoNeighbor(1)}
        index={selectedIndex >= 0 ? STREETS[selectedIndex].order : 0}
        total={STREETS.length}
      />

      {/* ── 卷首开卷（覆盖层，展毕自行卸载） ── */}
      <ScrollCover />
    </div>
  );
}

/* ─────────────────────── 档案总表 ─────────────────────── */

function ArchiveIndex({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div>
      <header className="mb-12 flex items-end justify-between max-md:mb-8">
        <div>
          <div className="kicker">INDEX / 全部地点</div>
          <h2 className="mt-3 font-serif-sc text-[38px] font-bold leading-tight max-md:text-[28px]">
            二十四站 · 实践档案总表
          </h2>
        </div>
        <p className="hidden max-w-[300px] text-right font-mono text-[10px] leading-relaxed tracking-[0.1em] text-[#A8A296] uppercase md:block">
          click any row — 点击任意一行，回到地图
        </p>
      </header>

      <div className="border-t border-[#3A372F]">
        {ROUTES.map((r) => (
          <div key={r.id}>
            <div className="flex items-center gap-4 border-b border-[#D8D2C4] bg-[#EFE9DC] px-4 py-2.5">
              <svg width="26" height="8" className="shrink-0">
                <circle cx="4" cy="4" r="3" fill={r.color} stroke="#3A372F" strokeWidth="0.8" />
                <circle cx="22" cy="4" r="3" fill={r.color} stroke="#3A372F" strokeWidth="0.8" />
              </svg>
              <span className="font-serif-sc text-[14px] font-bold">{r.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#77736A]">{r.en}</span>
              <span className="ml-auto hidden font-mono text-[9px] tracking-[0.14em] text-[#A8A296] md:block">{r.story}</span>
            </div>
            {r.streetIds.map((id) => {
              const s = streetById(id);
              return (
                <button
                  key={id}
                  onClick={() => onOpen(id)}
                  className="group grid w-full grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#D8D2C4] px-4 py-3.5 text-left transition-colors hover:bg-[#EFE9DC] max-md:grid-cols-[40px_1fr_auto] max-md:px-2"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#8B2F2F]">
                    {String(s.order).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-serif-sc text-[17px] font-medium transition-colors group-hover:text-[#8B2F2F] max-md:text-[15px]">
                      {s.name}
                    </span>
                    <span className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#A8A296]">
                      {s.province} · {s.tagline}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-[#C4BCA8] transition-all group-hover:translate-x-1 group-hover:text-[#8B2F2F]">→</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
