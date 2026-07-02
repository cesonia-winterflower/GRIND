import { useState } from 'react';
import { CloseIcon } from '../common/Icons';

export default function PromoBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fullbleed" style={{ background: 'var(--charcoal)', height: 36, position: 'relative' }}>
      <div className="center" style={{ height: 36, color: 'var(--white)', fontSize: 13, letterSpacing: '0.01em' }}>
        신규가입 15% 쿠폰 + 3만 원 이상 무료배송
      </div>
      <button onClick={() => setOpen(false)} aria-label="띠배너 닫기"
        style={{ position: 'absolute', right: 24, top: 0, height: 36, color: 'rgba(255,255,255,0.7)' }}>
        <CloseIcon width={16} height={16} />
      </button>
    </div>
  );
}
