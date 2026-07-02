import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '../common/Icons';
import { HERO, img } from '../../lib/images';

const SLIDES = HERO.map((s) => ({ ...s, img: img(s.id, 1920, 640) }));

export default function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="fullbleed" style={{ position: 'relative', height: 640, background: 'var(--charcoal)', overflow: 'hidden' }}>
      {SLIDES.map((s, idx) => (
        <div key={idx} style={{
          position: 'absolute', inset: 0, opacity: idx === i ? 1 : 0, transition: 'opacity 0.6s ease',
        }}>
          <img src={s.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.72 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(23,24,26,0.7), rgba(23,24,26,0.15))' }} />
        </div>
      ))}
      <div className="container" style={{ position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 220, left: 0, color: '#fff' }}>
          <h1 className="t-display" style={{ color: '#fff' }}>{SLIDES[i].head}</h1>
          <p style={{ marginTop: 16, fontSize: 18, color: 'rgba(255,255,255,0.85)' }}>{SLIDES[i].sub}</p>
          <Link to="/products" className="btn btn--volt" style={{ marginTop: 32 }}>
            지금 둘러보기 <ArrowRight width={18} height={18} />
          </Link>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 32, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {SLIDES.map((_, idx) => (
          <button key={idx} aria-label={`슬라이드 ${idx + 1}`} onClick={() => setI(idx)}
            style={{ width: idx === i ? 12 : 8, height: idx === i ? 12 : 8, borderRadius: 999,
              background: idx === i ? 'var(--volt)' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }} />
        ))}
      </div>
    </section>
  );
}
