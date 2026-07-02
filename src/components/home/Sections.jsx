import { Link } from 'react-router-dom';
import Marquee from '../common/Marquee';
import HScroll from '../common/HScroll';
import Stars from '../common/Stars';
import { ArrowRight } from '../common/Icons';
import { formatKRW } from '../../lib/session';
import { img, CATEGORY_IMG, PROMO_IMG, BRAND_IMG, STYLE_POOL, LOOKBOOK_POOL } from '../../lib/images';

/* ---------- Z4. 카테고리 퀵메뉴 ---------- */
const CATS = [
  { key: 'TOP', label: '상의' },
  { key: 'BOTTOM', label: '하의' },
  { key: 'OUTER', label: '아우터' },
  { key: 'SET', label: '세트' },
  { key: 'ACCESSORY', label: '용품' },
];
export function CategoryQuick() {
  return (
    <section className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
        {CATS.map((c) => (
          <Link key={c.key} to={`/category/${c.key}`} className="cat-card"
            style={{ position: 'relative', width: 245, height: 245, borderRadius: 16, overflow: 'hidden', flex: '0 0 auto' }}>
            <img src={img(CATEGORY_IMG[c.key], 300, 300)} alt={c.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="cat-card__img" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(23,24,26,0.55))' }} />
            <span style={{ position: 'absolute', left: 16, bottom: 16, color: '#fff', fontSize: 16, fontWeight: 700 }}>{c.label}</span>
          </Link>
        ))}
      </div>
      <style>{`.cat-card:hover .cat-card__img{transform:scale(1.05)}`}</style>
    </section>
  );
}

/* ---------- Z6. 기획전 배너 ---------- */
export function PromoFeature() {
  return (
    <section className="fullbleed" style={{ height: 360, background: 'var(--charcoal)', overflow: 'hidden' }}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ color: '#fff', zIndex: 2 }}>
          <div className="badge badge--sale" style={{ marginBottom: 16 }}>SPECIAL</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>입문자 세트 30%<br />오늘부터, 갈아 넣자.</h2>
          <Link to="/category/SET" className="btn btn--outline" style={{ marginTop: 24, color: '#fff', borderColor: 'var(--volt)' }}>
            기획전 보기 <ArrowRight width={18} height={18} />
          </Link>
        </div>
        <img src={img(PROMO_IMG, 720, 360)} alt=""
          style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 720, objectFit: 'cover', opacity: 0.5, maskImage: 'linear-gradient(90deg, transparent, #000 40%)' }} />
      </div>
    </section>
  );
}

/* ---------- Z8. BRAND STORY ---------- */
const KEYWORDS = ['DAILY GRIND', 'RISE & GRIND', '나를 위한 루틴', 'ATHLEISURE', 'GYM TO STREET', '오늘도 갈아 넣자'];
export function BrandStory() {
  return (
    <section className="section">
      <Marquee duration={22}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', height: 56 }}>
          {KEYWORDS.map((k, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-en)', fontSize: 24, fontWeight: 700, color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
              {k} <span style={{ color: 'var(--volt)', WebkitTextStroke: '1px var(--charcoal)' }}>✦</span>
            </span>
          ))}
        </div>
      </Marquee>
      <div className="container" style={{ marginTop: 40, textAlign: 'center' }}>
        <img src={img(BRAND_IMG, 880, 440)} alt="브랜드 무드"
          style={{ width: 880, height: 440, objectFit: 'cover', borderRadius: 12, margin: '0 auto' }} />
        <h2 style={{ fontSize: 32, fontWeight: 700, marginTop: 32 }}>나를 위한 루틴</h2>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 12 }}>오늘의 운동이 내일의 나를 만든다.</p>
        <Link to="/products" className="btn btn--outline" style={{ marginTop: 24, height: 48 }}>브랜드 스토리 더보기</Link>
      </div>
    </section>
  );
}

/* ---------- Z9. GRIND STYLE (Shop the Look) ---------- */
export function GrindStyle({ looks }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="t-h2">GRIND STYLE</h2>
          <a className="more" href="#">@grind.official</a>
        </div>
        <div style={{ marginTop: 32 }}>
          <HScroll step={640}>
            {looks.map((look, i) => (
              <div key={i} style={{ flex: '0 0 auto', width: 616, height: 420, display: 'flex', gap: 24, scrollSnapAlign: 'start' }}>
                <img src={img(STYLE_POOL[i % STYLE_POOL.length], 320, 420)} alt="스타일"
                  style={{ width: 315, height: 420, objectFit: 'cover', borderRadius: 12 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                  <div className="badge badge--soft">SHOP THE LOOK</div>
                  {look.map((p) => (
                    <Link key={p.id} to={`/products/${p.id}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <img src={p.mainImage} alt="" style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 4 }}>
                          <span style={{ color: 'var(--sale)', fontWeight: 800 }}>{p.discount_rate}%</span>
                          <span style={{ fontWeight: 700 }}>{formatKRW(p.sale_price)}</span>
                          <span style={{ fontSize: 12, color: 'rgba(23,24,26,0.4)', textDecoration: 'line-through' }}>{formatKRW(p.original_price)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </HScroll>
        </div>
      </div>
    </section>
  );
}

/* ---------- Z10. LOOKBOOK (Infinite Marquee) ---------- */
export function Lookbook() {
  const cards = Array.from({ length: 8 }, (_, i) => i);
  return (
    <section className="section">
      <div className="container"><div className="section-head"><h2 className="t-h2">LOOKBOOK</h2></div></div>
      <div style={{ marginTop: 32 }}>
        <Marquee direction="left" duration={40}>
          <div style={{ display: 'flex', gap: 24 }}>
            {cards.map((i) => (
              <div key={i} className="lookbook-card" style={{ position: 'relative', width: 424, height: 566, borderRadius: 12, overflow: 'hidden', flex: '0 0 auto' }}>
                <img src={img(LOOKBOOK_POOL[i % LOOKBOOK_POOL.length], 424, 566)} alt="코디" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="lookbook-card__hover">이 코디 상품 4개 <ArrowRight width={18} height={18} /></div>
              </div>
            ))}
          </div>
        </Marquee>
      </div>
      <style>{`.lookbook-card__hover{position:absolute;inset:0;display:flex;align-items:flex-end;padding:20px;gap:6px;color:#fff;font-weight:700;background:linear-gradient(180deg,transparent,rgba(23,24,26,0.6));opacity:0;transition:opacity 0.25s}.lookbook-card:hover .lookbook-card__hover{opacity:1}`}</style>
    </section>
  );
}

/* ---------- Z11. REAL FIT REVIEW ---------- */
export function RealFitReview({ reviews }) {
  return (
    <section className="section" style={{ background: 'var(--charcoal-04)' }}>
      <div className="container">
        <div className="section-head"><h2 className="t-h2">REAL FIT REVIEW</h2></div>
        <div style={{ marginTop: 32 }}>
          <HScroll step={280}>
            {reviews.map((r) => (
              <div key={r.id} style={{ flex: '0 0 auto', width: 240, scrollSnapAlign: 'start' }}>
                <img src={r.review_image_url} alt="실착" style={{ width: 240, height: 320, objectFit: 'cover', borderRadius: 12 }} />
                <div style={{ height: 60, paddingTop: 10 }}>
                  <Stars value={r.rating} />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    키 {r.height_cm}cm / {r.weight_kg}kg / {r.size_bought} 구매
                  </p>
                  <p style={{ fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.content}</p>
                </div>
              </div>
            ))}
          </HScroll>
        </div>
      </div>
    </section>
  );
}
