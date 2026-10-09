import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import type { Map as MLMap } from 'maplibre-gl';
import { STREETS, streetById } from './data/streets';
import { ROUTES } from './data/routes';
import { photosOf } from './data/media';
import type { RouteId } from './data/types';
import { PAPER_MAP_STYLE } from './styles/paperMapStyle';
import { useMapLibre } from './hooks/useMapLibre';
import { ScrollCover } from './components/ScrollCover';
import { MapLayers } from './components/MapLayers';
import { MapHUD } from './components/MapHUD';
import { MapLegend } from './components/WalkPlayer';
import { ArchiveCard } from './components/ArchiveCard';
import { NodeTooltip } from './components/MapOverlays';
import { MapDecorations } from './components/MapDecorations';
import { ProvArtLayer } from './components/ProvArtLayer';
import { Findings } from './components/Findings';
import { Closing } from './components/Closing';
import { TopNav } from './components/TopNav';
import { DeckleDefs, PaperSheet } from './components/Paper';
import { PlateText } from './components/PlateText';
import { paperVars } from './lib/paper';
import { contentIn, paperGroup, paperGroupTight } from './lib/motion';

export default function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteId | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
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

  // ---------- 首屏：地图是主角；翻过首屏后地图退回背景 ----------
  // 地图整幅铺满、压在所有内容之下，滚轮必然落在它身上。
  // 所以按位置分工：还在首屏时滚轮/拖拽归地图（滚轮缩放、拖拽平移），
  // 一旦往下翻过首屏，就交还给页面，让滚轮正常翻页。
  const [atHero, setAtHero] = useState(true);
  useEffect(() => {
    const sync = () => setAtHero(window.scrollY < window.innerHeight * 0.6);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  useEffect(() => {
    if (!map) return;
    if (atHero) {
      map.scrollZoom.enable();
      map.dragPan.enable();
    } else {
      map.scrollZoom.disable();
      map.dragPan.disable();
    }
  }, [map, atHero]);

  const goToArchive = useCallback(() => {
    document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ---------- 键盘 ----------
  // 卡片打开时 ← → 翻当前地点的照片，Shift + ← → 仍切换地点
  useEffect(() => {
    setPhotoIndex(0);
  }, [selectedId]);

  const stepPhoto = useCallback(
    (d: 1 | -1) => {
      if (!selectedId) return;
      const n = photosOf(selectedId).length;
      if (n < 2) return;
      setPhotoIndex((i) => (i + d + n) % n);
    },
    [selectedId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedId(null);
        return;
      }
      if (!selectedId) return;
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      // 只有一张照片时无处可翻，让 ← → 继续承担切地点
      if (!e.shiftKey && photosOf(selectedId).length > 1) {
        stepPhoto(d);
        return;
      }
      const i = STREETS.findIndex((s) => s.id === selectedId);
      const next = STREETS[(i + d + STREETS.length) % STREETS.length];
      handleNodeClick(next.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, handleNodeClick, stepPhoto]);

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
    setSelectedId(null);
    setActiveRoute(null);
    mapRef.current?.flyTo({ center: [104.5, 34.8], zoom: 4.3, duration: 1800 });
  }, []);

  /**
   * 「回到实践路线」：复位相机 + 把页面带回地图段。
   * 只复位相机是不够的 —— 结语处地图被整幅内容盖住，用户看不到任何变化，
   * 按下去像是没反应（实测 scrollY 5803 纹丝不动）。
   */
  const backToMap = useCallback(() => {
    resetView();
    sectionMapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [resetView]);

  // 路线筛选：同时飞到该路线的包络视野
  const filterRoute = useCallback((r: RouteId | null) => {
    setActiveRoute(r);
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
  }, []);

  return (
    <div className="grain relative min-h-screen bg-[#F4EFE4] text-[#1F1C18]">
      <DeckleDefs />
      <TopNav
        map={map}
        onReset={resetView}
        onNavigate={(target) => {
          if (target === 'map') {
            sectionMapRef.current?.scrollIntoView({ behavior: 'smooth' });
          } else {
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

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
              <MapLegend activeRoute={activeRoute} onPick={filterRoute} />
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
        <section id="archive" className="pointer-events-auto relative bg-[#F4EFE4]">
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

        <Closing onBackToMap={backToMap} />
      </div>

      {/* ── 档案卡（桌面右侧 / 移动底部） ── */}
      <ArchiveCard
        street={selectedId ? streetById(selectedId) : null}
        onClose={() => setSelectedId(null)}
        onPrev={() => gotoNeighbor(-1)}
        onNext={() => gotoNeighbor(1)}
        index={selectedIndex >= 0 ? STREETS[selectedIndex].order : 0}
        total={STREETS.length}
        photoIndex={photoIndex}
        onPhotoIndex={setPhotoIndex}
      />

      {/* ── 卷首开卷（覆盖层，展毕自行卸载） ── */}
      <ScrollCover />

      {/* ── 向下翻页指示：首屏滚轮归地图，出口放在这里 ── */}
      {atHero && (
        <button
          onClick={goToArchive}
          aria-label="向下翻页，查看全部地点"
          className="paper fixed bottom-8 left-1/2 z-40 flex h-11 w-11 -translate-x-1/2 items-center justify-center"
          style={paperVars('scroll-cue', { deckle: 'sm' })}
        >
          <PaperSheet />
          <svg
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="none"
            className="animate-[scroll-cue_1.8s_ease-in-out_infinite] text-[#8B2F2F]"
            aria-hidden
          >
            <path d="M1 1 L8 8 L15 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ─────────────────────── 档案总表 ─────────────────────── */

function ArchiveIndex({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <motion.div
      className="paper p-8 max-md:p-5"
      style={paperVars('archive-index', { deckle: 'lg' })}
      variants={paperGroup}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.1 }}
    >
      <PaperSheet />
      <motion.header
        variants={contentIn}
        className="mb-12 flex items-end justify-between max-md:mb-8"
      >
        <div>
          <div className="kicker">INDEX / 全部地点</div>
          <h2 className="mt-3 font-serif-sc text-[38px] font-bold leading-tight max-md:text-[28px]">
            <PlateText id="archive-index">二十四站 · 实践档案总表</PlateText>
          </h2>
        </div>
        <p className="hidden max-w-[300px] text-right font-mono text-[10px] leading-relaxed tracking-[0.1em] text-[#A49D92] uppercase md:block">
          click any row — 点击任意一行，回到地图
        </p>
      </motion.header>

      <div className="border-t border-[#4A453C]">
        {ROUTES.map((r) => (
          /* 每条路线自成一层编排：分组条 + 该组每一行依次浮现 */
          <motion.div key={r.id} variants={paperGroupTight}>
            <motion.div
              variants={contentIn}
              className="paper flex items-center gap-3 px-4 py-2.5"
              style={paperVars(`route-${r.id}`, { tone: '#E9E3D5', deckle: 'sm' })}
            >
              <PaperSheet />
              <span className="h-[7px] w-[7px] shrink-0 rotate-45" style={{ background: r.color }} />
              <span className="font-serif-sc text-[14px] font-bold">{r.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#6B655C]">{r.en}</span>
              <span className="ml-auto hidden font-mono text-[9px] tracking-[0.14em] text-[#A49D92] md:block">{r.story}</span>
            </motion.div>
            {r.streetIds.map((id) => {
              const s = streetById(id);
              return (
                <motion.button
                  key={id}
                  variants={contentIn}
                  onClick={() => onOpen(id)}
                  className="group grid w-full grid-cols-[52px_1fr_auto] items-center gap-4 border-b border-[#CBC3B4] px-4 py-3.5 text-left transition-colors hover:bg-[#EFE9DC] max-md:grid-cols-[40px_1fr_auto] max-md:px-2"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[#8B2F2F]">
                    {String(s.order).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span className="font-serif-sc text-[17px] font-medium transition-colors group-hover:text-[#8B2F2F] max-md:text-[15px]">
                      {s.name}
                    </span>
                    <span className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-[#A49D92]">
                      {s.province} · {s.tagline}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-[#BCB3A0] transition-all group-hover:translate-x-1 group-hover:text-[#8B2F2F]">→</span>
                </motion.button>
              );
            })}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
