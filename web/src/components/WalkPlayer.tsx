import type { Map as MLMap } from 'maplibre-gl';
import { STREETS } from '../data/streets';
import { ROUTES } from '../data/routes';
import type { RouteId } from '../data/types';

/**
 * 图例面板：五条路线的线框图例 + 站数。
 * 位于地图左下角。
 */
export function MapLegend({
  activeRoute,
  onHoverRoute,
}: {
  activeRoute: RouteId | null;
  onHoverRoute: (r: RouteId | null) => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-8 left-4 z-10 hidden border border-[#C4BCA8] bg-[#F3F0E8]/92 px-4 py-3 shadow-[2px_2px_0_rgba(27,27,27,0.08)] backdrop-blur-sm md:block">
      <div className="kicker mb-2">实践路线 / OUR WALKS</div>
      <div className="space-y-1.5">
        {ROUTES.map((r) => {
          const on = !activeRoute || activeRoute === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onHoverRoute(activeRoute === r.id ? null : r.id)}
              onMouseEnter={() => onHoverRoute(r.id)}
              onMouseLeave={() => onHoverRoute(null)}
              className={`flex w-full items-center gap-2.5 text-left transition-opacity ${on ? 'opacity-100' : 'opacity-35'}`}
            >
              <svg width="26" height="8" className="shrink-0">
                <path d="M1 4 C 8 1, 18 7, 25 4" stroke={r.color} strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-serif-sc text-[12.5px] font-medium text-[#1B1B1B]">{r.name}</span>
              <span className="font-mono text-[8px] tracking-[0.14em] text-[#A8A296]">
                {r.streetIds.length} STOPS
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 播放控制器 —— OUR WALK 自动巡礼。
 * 桌面端位于地图底部中央；播放中显示进度与停止按钮。
 */
export function WalkControls({
  playing,
  onPlay,
  onStop,
  progressLabel,
}: {
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  progressLabel: string;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-8 left-1/2 z-20 -translate-x-1/2 max-md:bottom-5 max-md:left-4 max-md:translate-x-0">
      {playing ? (
        <div className="flex items-center gap-3 border border-[#3A372F] bg-[#1B1B1B] px-4 py-2.5 text-[#F3F0E8] shadow-[3px_3px_0_rgba(139,47,47,0.5)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-[pulse-ring_1.6s_ease-out_infinite] rounded-full bg-[#8B2F2F]" />
            <span className="h-2 w-2 rounded-full bg-[#B89B67]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{progressLabel}</span>
          <button
            onClick={onStop}
            className="ml-1 border border-[#F3F0E8]/40 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] transition-colors hover:border-[#B89B67] hover:text-[#B89B67]"
          >
            停止 STOP
          </button>
        </div>
      ) : (
        <button
          onClick={onPlay}
          className="group flex items-center gap-3 border border-[#3A372F] bg-[#F3F0E8]/95 px-5 py-2.5 shadow-[3px_3px_0_rgba(27,27,27,0.15)] backdrop-blur-sm transition-all hover:border-[#8B2F2F] hover:bg-[#F3F0E8] hover:shadow-[3px_3px_0_rgba(139,47,47,0.35)]"
        >
          <svg width="11" height="12" viewBox="0 0 11 12" className="shrink-0 text-[#8B2F2F]">
            <path d="M1 1 L10 6 L1 11 Z" fill="currentColor" />
          </svg>
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-[#1B1B1B]">
            播放实践路线 · PLAY OUR WALK
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * 全程路线播放器 —— 串行飞越全部 23 站。
 */
export class WalkPlayer {
  private timers: number[] = [];
  private stopped = true;

  constructor(
    private map: MLMap,
    private onArrive: (streetId: string) => void,
    private onDone: () => void,
    private onProgress: (label: string) => void,
  ) {}

  get isStopped() {
    return this.stopped;
  }

  /** 开始全程巡礼 */
  play(order: string[]) {
    this.stop();
    this.stopped = false;
    let t = 400;
    const PER_STOP = 3200;
    const FLY = 2100;

    // 开场：全国全貌
    this.onProgress('全图 OVERVIEW');
    this.map.flyTo({ center: [104.5, 34.5], zoom: 4.4, duration: 1600 });
    t += 1800;

    order.forEach((id, i) => {
      const s = STREETS.find((x) => x.id === id)!;
      this.timers.push(
        window.setTimeout(() => {
          if (this.stopped) return;
          this.onProgress(`${String(i + 1).padStart(2, '0')} / ${order.length} · ${s.name}`);
          this.onArrive(id);
          this.map.flyTo({ center: s.coord, zoom: 11.2, duration: FLY, curve: 1.25 });
        }, t),
      );
      t += PER_STOP;
    });

    this.timers.push(
      window.setTimeout(() => {
        if (this.stopped) return;
        this.onDone();
      }, t + 600),
    );
    return t;
  }

  stop() {
    this.stopped = true;
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }
}
