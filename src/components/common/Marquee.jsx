// 무한 마퀴 (좌→우 또는 우→좌). 호버 시 정지.
export default function Marquee({ children, direction = 'left', duration = 26, gap = 24 }) {
  const anim = direction === 'left' ? 'marquee-left' : 'marquee-right';
  const items = [children, children]; // 2배 복제로 무한 루프
  return (
    <div className="mq" style={{ overflow: 'hidden', width: '100%' }}>
      <div className="mq__track" style={{ display: 'flex', gap, width: 'max-content', animation: `${anim} ${duration}s linear infinite` }}>
        {items.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap }} aria-hidden={i === 1}>{c}</div>
        ))}
      </div>
      <style>{`.mq:hover .mq__track{animation-play-state:paused}`}</style>
    </div>
  );
}
