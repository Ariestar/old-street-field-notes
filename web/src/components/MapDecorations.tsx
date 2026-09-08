/**
 * 地图边缘的水彩装饰插画 —— 从《中国山河锦绣》参考图原画抠取的水彩元素。
 * 元素：朱红日轮 / 墨色飞鸟 / 线描山纹 / 远山雾霭 / 海上帆船 / 朱印。
 * 仅在全国视野（低 zoom）出现，放大细看街道时整体淡出，不干扰档案阅读。
 * multiply 混合：纸白部分与底图相融，水彩笔触直接落在纸上。
 */
import { useEffect, useState } from 'react';
import type { Map as MLMap } from 'maplibre-gl';

const BASE = import.meta.env.BASE_URL;

function Deco({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={`${BASE}decor/${src}`}
      alt=""
      className={`pointer-events-none absolute mix-blend-multiply ${className ?? ''}`}
      style={style}
      draggable={false}
    />
  );
}

export function MapDecorations({ map }: { map: MLMap | null }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (!map) return;
    const sync = () => setFade(map.getZoom() > 5.2);
    sync();
    map.on('zoom', sync);
    return () => {
      map.off('zoom', sync);
    };
  }, [map]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 右上海域：帆船 + 倒影 */}
      <Deco src="boat.png" className="right-[13%] top-[24%] w-[92px] opacity-90 max-md:hidden" />

      {/* 左上：红日 + 飞鸟（参考图原位复刻） */}
      <Deco src="sun.png" className="left-[4.5%] top-[15%] w-[72px] opacity-95" />
      <Deco src="bird1.png" className="left-[13%] top-[17.5%] w-[40px] opacity-90 max-md:hidden" />
      <Deco src="bird2.png" className="left-[10%] top-[21%] w-[36px] opacity-85" />

      {/* 右上：线描山纹 + 朱印 */}
      <Deco src="linemountain.png" className="right-[6%] top-[7%] w-[100px] opacity-80 max-md:hidden" />
      <Deco src="seal.png" className="right-[3%] top-[5%] w-[22px] opacity-85 max-md:hidden" />

      {/* 左下：远山雾霭（避开左下角图例） */}
      <Deco src="mountain.png" className="bottom-[22%] left-[6%] w-[240px] opacity-80 max-lg:hidden" />
    </div>
  );
}
