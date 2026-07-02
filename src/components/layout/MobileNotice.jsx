import { useEffect, useState } from 'react';
import { DumbbellIcon } from '../common/Icons';

export default function MobileNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,26,0.92)', zIndex: 2000,
      display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ maxWidth: 320, color: '#fff' }}>
        <div style={{ display: 'inline-flex', color: 'var(--volt)', marginBottom: 12 }}><DumbbellIcon width={40} height={40} /></div>
        <div style={{ fontFamily: 'var(--font-en)', fontSize: 28, fontWeight: 900, letterSpacing: '0.02em' }}>GRIND</div>
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>
          이 사이트는 <b style={{ color: '#fff' }}>PC 환경에 최적화</b>되어 있습니다.<br />
          더 나은 경험을 위해 데스크탑에서 접속해 주세요.
        </p>
        <button onClick={() => setShow(false)} className="btn btn--volt" style={{ marginTop: 24 }}>그래도 둘러보기</button>
      </div>
    </div>
  );
}
