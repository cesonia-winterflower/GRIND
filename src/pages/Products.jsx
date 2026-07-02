import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import { fetchProductsWithMain, enrichWithVariants } from '../lib/api';

const CAT_LABEL = { ALL: '전체', TOP: 'TOP', BOTTOM: 'BOTTOM', OUTER: 'OUTER', SET: 'SET', ACCESSORY: 'ACCESSORY' };
const CAT_KO = { ALL: '전체상품', TOP: '상의', BOTTOM: '하의', OUTER: '아우터', SET: '세트', ACCESSORY: '용품' };
const COLORS = [
  ['블랙', '#1a1a1a'], ['차콜', '#3a3d42'], ['그레이', '#8b9096'], ['화이트', '#f2f2f2'],
  ['네이비', '#232b3d'], ['카키', '#6b6a4b'], ['아이보리', '#efeade'], ['볼트', '#c7f000'],
];
const SIZES = ['S', 'M', 'L', 'XL', 'FREE'];
const PRICES = [['~3만', 0, 30000], ['3~5만', 30000, 50000], ['5~8만', 50000, 80000], ['8만~', 80000, 1e9]];
const SORTS = [['new', '신상품순'], ['review', '리뷰많은순'], ['price_asc', '낮은가격순'], ['price_desc', '높은가격순']];

export default function Products() {
  const { cat } = useParams();
  const [sp] = useSearchParams();
  const q = sp.get('q');
  const bestOnly = sp.get('best') === '1';
  const saleOnly = sp.get('sale') === '1';
  const category = cat || 'ALL';

  const [all, setAll] = useState(null);
  const [colorSel, setColorSel] = useState([]);
  const [sizeSel, setSizeSel] = useState([]);
  const [priceSel, setPriceSel] = useState([]);
  const [sort, setSort] = useState('new');
  const [visible, setVisible] = useState(12);

  useEffect(() => {
    setAll(null); setVisible(12);
    fetchProductsWithMain({ category, isBest: bestOnly || undefined, sort })
      .then(enrichWithVariants).then(setAll).catch(console.error);
  }, [category, bestOnly, sort]);

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const reset = () => { setColorSel([]); setSizeSel([]); setPriceSel([]); };

  const filtered = useMemo(() => {
    if (!all) return [];
    return all.filter((p) => {
      if (q && !p.name.includes(q)) return false;
      if (saleOnly && p.discount_rate <= 0) return false;
      if (colorSel.length && !colorSel.some((c) => p.colors.includes(c))) return false;
      if (sizeSel.length && !sizeSel.some((s) => p.sizes.includes(s))) return false;
      if (priceSel.length && !priceSel.some((i) => { const [, lo, hi] = PRICES[i]; return p.sale_price >= lo && p.sale_price < hi; })) return false;
      return true;
    });
  }, [all, q, saleOnly, colorSel, sizeSel, priceSel]);

  const activeChips = [
    ...colorSel.map((c) => ({ k: 'c', v: c, label: c })),
    ...sizeSel.map((s) => ({ k: 's', v: s, label: s })),
    ...priceSel.map((i) => ({ k: 'p', v: i, label: PRICES[i][0] })),
  ];
  const title = q ? `"${q}" 검색결과` : bestOnly ? 'BEST' : saleOnly ? 'SALE' : CAT_LABEL[category];

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* 페이지 헤더 */}
      <nav style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        <Link to="/">HOME</Link> / {CAT_KO[category] || title}
      </nav>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 12 }}>
        <h1 className="t-h1">{title}</h1>
        <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>({all ? filtered.length : '…'})</span>
      </div>

      {/* 서브 카테고리 탭 */}
      <div style={{ display: 'flex', gap: 4, marginTop: 20, borderBottom: '1px solid var(--border)' }}>
        {Object.keys(CAT_LABEL).map((k) => (
          <Link key={k} to={k === 'ALL' ? '/products' : `/category/${k}`}
            style={{ padding: '12px 16px', fontSize: 15, fontWeight: 600,
              color: category === k ? 'var(--charcoal)' : 'var(--text-secondary)',
              borderBottom: category === k ? '2px solid var(--volt)' : '2px solid transparent', marginBottom: -1 }}>
            {CAT_LABEL[k]}
          </Link>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input"
          style={{ marginLeft: 'auto', width: 150, height: 40, marginBottom: 6 }}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* 활성 필터 칩 */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {activeChips.map((c, i) => (
            <button key={i} className="chip is-active" onClick={() => {
              if (c.k === 'c') toggle(colorSel, setColorSel, c.v);
              if (c.k === 's') toggle(sizeSel, setSizeSel, c.v);
              if (c.k === 'p') toggle(priceSel, setPriceSel, c.v);
            }}>{c.label} ✕</button>
          ))}
          <button className="chip" onClick={reset}>전체 초기화</button>
        </div>
      )}

      {/* 본문 2단 */}
      <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
        {/* 필터 사이드바 */}
        <aside style={{ width: 240, flex: '0 0 auto', position: 'sticky', top: 96, alignSelf: 'flex-start' }}>
          <FilterGroup title="색상">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {COLORS.map(([name, hex]) => (
                <button key={name} title={name} onClick={() => toggle(colorSel, setColorSel, name)}
                  style={{ width: 24, height: 24, borderRadius: 999, background: hex,
                    border: colorSel.includes(name) ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                    outline: colorSel.includes(name) ? '2px solid var(--volt)' : 'none', outlineOffset: 1 }} />
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="사이즈">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SIZES.map((s) => (
                <button key={s} className={`chip ${sizeSel.includes(s) ? 'is-active' : ''}`} onClick={() => toggle(sizeSel, setSizeSel, s)}>{s}</button>
              ))}
            </div>
          </FilterGroup>
          <FilterGroup title="가격대">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PRICES.map(([label], i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={priceSel.includes(i)} onChange={() => toggle(priceSel, setPriceSel, i)} />
                  {label}
                </label>
              ))}
            </div>
          </FilterGroup>
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button className="btn btn--dark btn--sm btn--block" onClick={() => setVisible(12)}>필터 적용</button>
            <button className="btn btn--ghost btn--sm" onClick={reset}>초기화</button>
          </div>
        </aside>

        {/* 상품 그리드 */}
        <div style={{ flex: 1 }}>
          {!all ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: 24, rowGap: 40 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}><div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 12 }} /><div className="skeleton" style={{ height: 14, marginTop: 12, width: '70%' }} /></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="center" style={{ flexDirection: 'column', gap: 16, padding: '80px 0' }}>
              <p style={{ color: 'var(--text-secondary)' }}>조건에 맞는 상품이 없습니다.</p>
              <button className="btn btn--outline btn--sm" onClick={reset}>필터 초기화</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: 24, rowGap: 40 }}>
                {filtered.slice(0, visible).map((p) => <ProductCard key={p.id} product={p} cardW={242} imgH={323} />)}
              </div>
              {visible < filtered.length && (
                <div className="center" style={{ marginTop: 40 }}>
                  <Button variant="outline" size="lg" onClick={() => setVisible((v) => v + 8)}>상품 더보기 ({filtered.length - visible})</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  );
}
