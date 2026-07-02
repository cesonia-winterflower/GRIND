const STEPS = ['장바구니', '주문/결제', '완료'];

export default function StepIndicator({ step = 1 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 40 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n <= step;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
                background: active ? 'var(--volt)' : 'var(--placeholder)', color: active ? 'var(--charcoal)' : 'var(--text-secondary)' }}>{n}</span>
              <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, color: active ? 'var(--charcoal)' : 'var(--text-secondary)' }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ width: 40, height: 1, background: 'var(--border)' }} />}
          </div>
        );
      })}
    </div>
  );
}
