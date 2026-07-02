import { useEffect } from 'react';
import { CloseIcon } from './Icons';

export default function Modal({ open, onClose, width = 480, children, title }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(23,24,26,0.55)', zIndex: 1000,
      display: 'grid', placeItems: 'center', animation: 'fadeUp 0.2s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto', background: 'var(--white)',
        borderRadius: 'var(--r-card)', boxShadow: 'var(--shadow-float)', position: 'relative',
      }}>
        {title && <div style={{ padding: '24px 24px 0', fontSize: 20, fontWeight: 800 }}>{title}</div>}
        <button onClick={onClose} aria-label="닫기" style={{ position: 'absolute', top: 16, right: 16, color: 'var(--charcoal)' }}>
          <CloseIcon width={20} height={20} />
        </button>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
