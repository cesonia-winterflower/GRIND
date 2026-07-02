import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import { CategoryQuick, PromoFeature, BrandStory, GrindStyle, Lookbook, RealFitReview } from '../components/home/Sections';
import ProductCard from '../components/common/ProductCard';
import { fetchProductsWithMain, enrichWithVariants, fetchReviewsWithFit } from '../lib/api';

function GridSkeleton({ rows = 2 }) {
  return (
    <div className="grid-4" style={{ marginTop: 32 }}>
      {Array.from({ length: rows * 4 }).map((_, i) => (
        <div key={i} style={{ width: 312 }}>
          <div className="skeleton" style={{ height: 416, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 16, marginTop: 12, width: '70%' }} />
          <div className="skeleton" style={{ height: 16, marginTop: 8, width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [best, setBest] = useState(null);
  const [news, setNews] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    (async () => {
      const [b, n, r] = await Promise.all([
        fetchProductsWithMain({ isBest: true, limit: 8 }).then(enrichWithVariants),
        fetchProductsWithMain({ isNew: true, limit: 4 }).then(enrichWithVariants),
        fetchReviewsWithFit(8),
      ]);
      // BEST 정렬: badge_text "BEST n" 순서 우선
      b.sort((x, y) => {
        const rx = /BEST (\d)/.exec(x.badge_text || '')?.[1] || 99;
        const ry = /BEST (\d)/.exec(y.badge_text || '')?.[1] || 99;
        return rx - ry;
      });
      setBest(b); setNews(n); setReviews(r);
    })().catch(console.error);
  }, []);

  const looks = best ? [best.slice(0, 3), best.slice(3, 6), best.slice(5, 8)] : [];

  return (
    <>
      <Hero />
      <CategoryQuick />

      {/* Z5. BEST */}
      <section className="section container">
        <div className="section-head">
          <h2 className="t-h2">이번 주 BEST</h2>
          <Link className="more" to="/products?best=1">전체보기 →</Link>
        </div>
        {best ? (
          <div className="grid-4" style={{ marginTop: 32 }}>
            {best.map((p, i) => <ProductCard key={p.id} product={p} rank={i < 3 ? i + 1 : undefined} />)}
          </div>
        ) : <GridSkeleton rows={2} />}
      </section>

      <PromoFeature />

      {/* Z7. NEW ARRIVALS */}
      <section className="section container">
        <div className="section-head">
          <h2 className="t-h2">NEW ARRIVALS</h2>
          <Link className="more" to="/products">신상 전체보기 →</Link>
        </div>
        {news ? (
          <div className="grid-4" style={{ marginTop: 32 }}>
            {news.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : <GridSkeleton rows={1} />}
      </section>

      <BrandStory />
      {best && <GrindStyle looks={looks} />}
      <Lookbook />
      {reviews.length > 0 && <RealFitReview reviews={reviews} />}
    </>
  );
}
