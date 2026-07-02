import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';

// 가로 스와이퍼 (화살표 + 스크롤 스냅)
export default function HScroll({ children, gap = 24, step = 340, arrows = true }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * step, behavior: 'smooth' });
  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} className="noscrollbar" style={{ display: 'flex', gap, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 4 }}>
        {children}
      </div>
      {arrows && (
        <>
          <button aria-label="이전" onClick={() => scroll(-1)} className="hscroll-arrow" style={{ left: -20 }}><ChevronLeft /></button>
          <button aria-label="다음" onClick={() => scroll(1)} className="hscroll-arrow" style={{ right: -20 }}><ChevronRight /></button>
        </>
      )}
      <style>{`.hscroll-arrow{position:absolute;top:calc(50% - 20px);width:40px;height:40px;border-radius:999px;background:#fff;box-shadow:var(--shadow-card);display:grid;place-items:center;color:var(--charcoal);z-index:3}.hscroll-arrow:hover{background:var(--charcoal);color:#fff}`}</style>
    </div>
  );
}
