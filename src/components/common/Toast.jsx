import { useStore } from '../../store/StoreContext';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 1200,
      background: 'var(--charcoal)', color: 'var(--white)', padding: '14px 22px', borderRadius: 999,
      fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-float)', animation: 'fadeUp 0.25s ease',
    }}>
      {toast}
    </div>
  );
}
