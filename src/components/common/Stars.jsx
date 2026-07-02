import { StarIcon } from './Icons';

export default function Stars({ value = 0, count, size = 14 }) {
  const rounded = Math.round(value);
  return (
    <span className="stars" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= rounded} width={size} height={size} className={n <= rounded ? '' : 'muted'} />
      ))}
      {value != null && <span style={{ marginLeft: 6, fontSize: 13, fontWeight: 700, color: 'var(--charcoal)' }}>{Number(value).toFixed(1)}</span>}
      {count != null && <span style={{ marginLeft: 4, fontSize: 13, color: 'var(--text-secondary)' }}>({count.toLocaleString()})</span>}
    </span>
  );
}
