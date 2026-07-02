import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Stars from '../components/common/Stars';
import Modal from '../components/common/Modal';
import ProductCard from '../components/common/ProductCard';
import { HeartIcon, MinusIcon, PlusIcon, CheckIcon } from '../components/common/Icons';
import { useStore } from '../store/StoreContext';
import { formatKRW } from '../lib/session';
import { recommendSize } from '../lib/sizeRecommend';
import {
  fetchProductDetail, fetchProductsWithMain, enrichWithVariants, addToCart,
  requestRestock, submitReview, submitQna,
} from '../lib/api';

const COLOR_HEX = { 딥블랙: '#1a1a1a', 블랙: '#1a1a1a', 차콜: '#3a3d42', 애쉬그레이: '#9aa0a6', 그레이: '#8b9096', 화이트: '#f2f2f2', 아이보리: '#efeade', 네이비: '#232b3d', 카키: '#6b6a4b', 볼트: '#c7f000' };
const TABS = ['상품정보', '사이즈&핏', '리뷰', 'Q&A', '배송/교환'];
const FEATURES = ['흡습속건', '4방향 스트레치', '무자극 봉제', '스쿼트 프루프'];

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, wishIds, toggleWish, refreshCartCount, showToast } = useStore();

  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [thumb, setThumb] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('상품정보');
  const [sizeModal, setSizeModal] = useState(false);

  useEffect(() => {
    setData(null); setColor(null); setSize(null); setQty(1); setThumb(0); setTab('상품정보');
    fetchProductDetail(id).then((d) => {
      setData(d);
      setColor(d.variants[0]?.color || null);
      fetchProductsWithMain({ category: d.product.category, limit: 5 })
        .then(enrichWithVariants)
        .then((r) => setRelated(r.filter((p) => p.id !== id).slice(0, 4)));
    }).catch(console.error);
  }, [id]);

  const p = data?.product;
  const variants = data?.variants || [];
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const sizesForColor = useMemo(() => variants.filter((v) => v.color === color), [variants, color]);
  const selectedVariant = variants.find((v) => v.color === color && v.size === size);
  const wished = p && wishIds.has(p.id);

  const handleAddCart = async (buyNow = false) => {
    if (!color || !size) { showToast('색상과 사이즈를 선택해주세요'); return; }
    if (!selectedVariant || selectedVariant.stock <= 0) { showToast('품절된 옵션입니다'); return; }
    try {
      await addToCart(user, selectedVariant.id, qty);
      await refreshCartCount();
      if (buyNow) nav('/cart');
      else showToast('장바구니에 담았어요');
    } catch { showToast('오류가 발생했어요'); }
  };

  const handleRestock = async () => {
    try { await requestRestock(user, selectedVariant.id); showToast('재입고 알림을 신청했어요'); }
    catch { showToast('이미 신청했거나 오류가 발생했어요'); }
  };

  if (!data) return <DetailSkeleton />;

  const total = (selectedVariant ? p.sale_price : p.sale_price) * qty;
  const mainImg = data.images[thumb]?.image_url || data.images[0]?.image_url;

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <nav style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '40px 0 24px' }}>
        <Link to="/">HOME</Link> / <Link to={`/category/${p.category}`}>{p.category}</Link> / {p.name}
      </nav>

      {/* 상단 2단 */}
      <div style={{ display: 'flex', gap: 40 }}>
        {/* 갤러리 */}
        <div style={{ width: 600, flex: '0 0 auto' }}>
          <img src={mainImg} alt={p.name} style={{ width: 600, height: 800, objectFit: 'cover', borderRadius: 12, background: 'var(--charcoal-04)' }} />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {data.images.slice(0, 5).map((im, i) => (
              <button key={im.id} onClick={() => setThumb(i)}
                style={{ width: 112, height: 150, borderRadius: 8, overflow: 'hidden', border: thumb === i ? '2px solid var(--charcoal)' : '1px solid var(--border)' }}>
                <img src={im.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* 정보 패널 */}
        <div style={{ width: 680, flex: '0 0 auto' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>GRIND</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{p.name}</h1>
          <div style={{ marginTop: 12 }}><Stars value={p.rating_avg} count={p.review_count} /></div>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {p.discount_rate > 0 && <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--sale)' }}>{p.discount_rate}%</span>}
            <span style={{ fontSize: 28, fontWeight: 800 }}>{formatKRW(p.sale_price)}</span>
            {p.discount_rate > 0 && <span style={{ fontSize: 15, color: 'rgba(23,24,26,0.4)', textDecoration: 'line-through' }}>{formatKRW(p.original_price)}</span>}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

          {/* 색상 */}
          <Row label="색상">
            <div style={{ display: 'flex', gap: 12 }}>
              {colors.map((c) => (
                <button key={c} title={c} onClick={() => { setColor(c); setSize(null); }}
                  style={{ width: 32, height: 32, borderRadius: 999, background: COLOR_HEX[c] || '#ccc',
                    border: color === c ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                    outline: color === c ? '2px solid var(--volt)' : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </Row>

          {/* 사이즈 */}
          <Row label="사이즈" extra={<button onClick={() => setSizeModal(true)} style={{ fontSize: 13, color: 'var(--charcoal)', textDecoration: 'underline', textUnderlineOffset: 3 }}>사이즈 추천</button>}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {sizesForColor.map((v) => {
                const out = v.stock <= 0;
                return (
                  <button key={v.id} disabled={out} onClick={() => setSize(v.size)}
                    style={{ minWidth: 56, height: 44, padding: '0 12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      border: size === v.size ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                      background: out ? 'var(--placeholder)' : '#fff', color: out ? 'rgba(23,24,26,0.3)' : 'var(--charcoal)',
                      textDecoration: out ? 'line-through' : 'none', cursor: out ? 'not-allowed' : 'pointer' }}>
                    {v.size}{v.stock > 0 && v.stock <= 3 ? ` (${v.stock})` : ''}
                  </button>
                );
              })}
            </div>
          </Row>

          {/* 품절 옵션 재입고 알림 */}
          {selectedVariant && selectedVariant.stock <= 0 && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--placeholder)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--sale)', fontWeight: 600 }}>품절된 옵션입니다</span>
              <button className="btn btn--dark btn--sm" onClick={handleRestock}>재입고 알림 신청</button>
            </div>
          )}

          {/* 수량 */}
          <Row label="수량">
            <div className="stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 감소"><MinusIcon width={18} height={18} /></button>
              <span className="val">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} aria-label="수량 증가"><PlusIcon width={18} height={18} /></button>
            </div>
          </Row>

          {/* 선택 옵션 박스 */}
          {color && size && selectedVariant && (
            <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{color} / {size} · {qty}개</span>
              <span style={{ fontWeight: 700 }}>{formatKRW(p.sale_price * qty)}</span>
            </div>
          )}

          {/* 총 결제금액 */}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginRight: 10 }}>총 결제금액</span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{formatKRW(total)}</span>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
            <button onClick={() => toggleWish(p.id)} aria-label="찜"
              style={{ width: 56, height: 56, flex: '0 0 auto', borderRadius: 8, border: '1px solid var(--border)', display: 'grid', placeItems: 'center', color: wished ? 'var(--sale)' : 'var(--charcoal)' }}>
              <HeartIcon filled={wished} />
            </button>
            <button className="btn btn--outline btn--lg" style={{ flex: 1 }} onClick={() => handleAddCart(false)}>장바구니</button>
            <button className="btn btn--dark btn--lg" style={{ flex: 1 }} onClick={() => handleAddCart(true)}>바로구매</button>
          </div>

          <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            · 3만 원 이상 무료배송 · 신규가입 15% 쿠폰 · 구매 시 1% 적립
          </p>
        </div>
      </div>

      {/* 상세 탭바 */}
      <div style={{ display: 'flex', gap: 4, marginTop: 64, borderBottom: '1px solid var(--border)', position: 'sticky', top: 72, background: '#fff', zIndex: 10 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '14px 20px', fontSize: 15, fontWeight: 600, color: tab === t ? 'var(--charcoal)' : 'var(--text-secondary)',
              borderBottom: tab === t ? '2px solid var(--charcoal)' : '2px solid transparent', marginBottom: -1 }}>
            {t}{t === '리뷰' ? ` (${p.review_count.toLocaleString()})` : ''}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ marginTop: 32, minHeight: 300 }}>
        {tab === '상품정보' && (
          <div>
            <img src={data.images[1]?.image_url || mainImg} alt="" style={{ width: '100%', height: 480, objectFit: 'cover', borderRadius: 12 }} />
            <p style={{ marginTop: 24, fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)' }}>{p.description}</p>
            <div style={{ display: 'flex', gap: 40, marginTop: 32, justifyContent: 'center' }}>
              {FEATURES.map((f) => (
                <div key={f} className="center" style={{ flexDirection: 'column', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--charcoal)', color: 'var(--volt)', display: 'grid', placeItems: 'center' }}><CheckIcon width={20} height={20} /></div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === '사이즈&핏' && <SizeFitTab onOpen={() => setSizeModal(true)} />}
        {tab === '리뷰' && <ReviewsTab data={data} productId={p.id} user={user} onDone={() => fetchProductDetail(id).then(setData)} showToast={showToast} />}
        {tab === 'Q&A' && <QnaTab data={data} productId={p.id} user={user} onDone={() => fetchProductDetail(id).then(setData)} showToast={showToast} />}
        {tab === '배송/교환' && <ShippingTab />}
      </div>

      {/* 연관 추천 */}
      {related.length > 0 && (
        <section style={{ marginTop: 64 }}>
          <h2 className="t-h2" style={{ marginBottom: 32 }}>함께 보면 좋은</h2>
          <div className="grid-4">{related.map((r) => <ProductCard key={r.id} product={r} />)}</div>
        </section>
      )}

      {/* 사이즈 추천 모달 */}
      <SizeRecommendModal open={sizeModal} onClose={() => setSizeModal(false)} category={p.category}
        onPick={(s) => { if (sizesForColor.some((v) => v.size === s && v.stock > 0)) setSize(s); setSizeModal(false); }} />
    </div>
  );
}

function Row({ label, extra, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 600 }}>{label}</span>{extra}
      </div>
      {children}
    </div>
  );
}

function SizeFitTab({ onOpen }) {
  const rows = [['S', 66, 46, 40], ['M', 68, 49, 42], ['L', 70, 52, 44], ['XL', 72, 55, 46]];
  return (
    <div>
      <p style={{ fontSize: 15, marginBottom: 16 }}>운동인 체형(어깨·허벅지 발달)을 고려한 여유 핏입니다. 정확한 추천은 아래 버튼을 눌러보세요.</p>
      <button className="btn btn--volt btn--sm" onClick={onOpen}>키·몸무게로 사이즈 추천받기</button>
      <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse', fontSize: 14, textAlign: 'center' }}>
        <thead><tr style={{ background: 'var(--charcoal)', color: '#fff' }}>{['사이즈', '총장', '어깨', '가슴'].map((h) => <th key={h} style={{ padding: 12 }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)' }}>{r.map((c, i) => <td key={i} style={{ padding: 12 }}>{c}{i > 0 ? 'cm' : ''}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ReviewsTab({ data, productId, user, onDone, showToast }) {
  const [form, setForm] = useState({ rating: 5, title: '', content: '', height_cm: '', weight_kg: '', size_bought: 'L' });
  const submit = async () => {
    if (!form.content.trim()) { showToast('내용을 입력해주세요'); return; }
    try {
      await submitReview({ product_id: productId, user_id: user?.id || null, rating: form.rating, title: form.title || '실착 후기',
        content: form.content, height_cm: form.height_cm ? +form.height_cm : null, weight_kg: form.weight_kg ? +form.weight_kg : null, size_bought: form.size_bought });
      showToast('리뷰가 등록되었어요'); setForm({ rating: 5, title: '', content: '', height_cm: '', weight_kg: '', size_bought: 'L' }); onDone();
    } catch { showToast('오류가 발생했어요'); }
  };
  return (
    <div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <select className="input" style={{ width: 100 }} value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>★ {n}</option>)}</select>
          <input className="input" placeholder="키(cm)" value={form.height_cm} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} style={{ width: 100 }} />
          <input className="input" placeholder="몸무게(kg)" value={form.weight_kg} onChange={(e) => setForm({ ...form, weight_kg: e.target.value })} style={{ width: 110 }} />
          <select className="input" style={{ width: 90 }} value={form.size_bought} onChange={(e) => setForm({ ...form, size_bought: e.target.value })}>{['S', 'M', 'L', 'XL'].map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <textarea className="input" rows={3} placeholder="핏/착용감을 남겨주세요" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <div style={{ textAlign: 'right', marginTop: 12 }}><button className="btn btn--dark btn--sm" onClick={submit}>리뷰 등록</button></div>
      </div>
      {data.reviews.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>아직 리뷰가 없습니다. 첫 리뷰를 남겨보세요!</p>}
      {data.reviews.map((r) => (
        <div key={r.id} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          {r.review_image_url && <img src={r.review_image_url} alt="" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8 }} />}
          <div>
            <Stars value={r.rating} />
            {(r.height_cm || r.size_bought) && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>키 {r.height_cm}cm / {r.weight_kg}kg / {r.size_bought} 구매</p>}
            <p style={{ marginTop: 6, fontSize: 14 }}>{r.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function QnaTab({ data, productId, user, onDone, showToast }) {
  const [form, setForm] = useState({ title: '', content: '', secret: false });
  const submit = async () => {
    if (!form.title.trim()) { showToast('제목을 입력해주세요'); return; }
    try {
      await submitQna({ product_id: productId, user_id: user?.id || null, question_title: form.title, question_content: form.content, is_secret: form.secret });
      showToast('문의가 등록되었어요'); setForm({ title: '', content: '', secret: false }); onDone();
    } catch { showToast('오류가 발생했어요'); }
  };
  return (
    <div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <input className="input" placeholder="문의 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
        <textarea className="input" rows={2} placeholder="문의 내용" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={form.secret} onChange={(e) => setForm({ ...form, secret: e.target.checked })} />비밀글</label>
          <button className="btn btn--dark btn--sm" onClick={submit}>문의 등록</button>
        </div>
      </div>
      {data.qna.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>등록된 문의가 없습니다.</p>}
      {data.qna.map((q) => (
        <div key={q.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`badge ${q.is_answered ? 'badge--new' : 'badge--soft'}`}>{q.is_answered ? '답변완료' : '답변대기'}</span>
            <span style={{ fontWeight: 600 }}>{q.is_secret ? '🔒 비밀글입니다' : q.question_title}</span>
          </div>
          {!q.is_secret && q.answer_content && <p style={{ marginTop: 8, marginLeft: 12, fontSize: 14, color: 'var(--text-secondary)' }}>↳ {q.answer_content}</p>}
        </div>
      ))}
    </div>
  );
}

function ShippingTab() {
  return (
    <div style={{ fontSize: 15, lineHeight: 2 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>배송 안내</h3>
      <p>· 배송비 3,000원 (3만 원 이상 무료) · 평균 1~3일 소요 · CJ대한통운</p>
      <h3 style={{ fontSize: 18, fontWeight: 700, margin: '24px 0 12px' }}>교환/반품 안내</h3>
      <p>· 수령 후 7일 이내 · 미착용·택 제거 전 · 단순 변심 시 왕복 배송비 6,000원</p>
    </div>
  );
}

export function SizeRecommendModal({ open, onClose, category, onPick }) {
  const [h, setH] = useState(''); const [w, setW] = useState(''); const [build, setBuild] = useState('normal');
  const [result, setResult] = useState(null);
  const run = () => setResult(recommendSize({ height: h, weight: w, category, build }));
  return (
    <Modal open={open} onClose={onClose} width={480} title="사이즈 추천">
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>키·몸무게와 체형을 입력하면 최적 사이즈를 알려드려요.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <input className="input" placeholder="키 (cm)" value={h} onChange={(e) => setH(e.target.value)} />
        <input className="input" placeholder="몸무게 (kg)" value={w} onChange={(e) => setW(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        {[['normal', '일반 체형'], ['athletic', '운동인 체형']].map(([v, l]) => (
          <button key={v} className={`chip ${build === v ? 'is-active' : ''}`} onClick={() => setBuild(v)}>{l}</button>
        ))}
      </div>
      <button className="btn btn--dark btn--block" style={{ marginTop: 16 }} onClick={run}>추천받기</button>
      {result && (
        <div style={{ marginTop: 20, padding: 20, background: 'var(--charcoal)', borderRadius: 12, textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 13, color: 'var(--on-charcoal-56)' }}>추천 사이즈</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--volt)' }}>{result.size}</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6 }}>{result.message}</p>
          <button className="btn btn--volt btn--sm" style={{ marginTop: 14 }} onClick={() => onPick(result.size)}>이 사이즈 선택</button>
        </div>
      )}
    </Modal>
  );
}

function DetailSkeleton() {
  return (
    <div className="container" style={{ paddingTop: 80, display: 'flex', gap: 40 }}>
      <div className="skeleton" style={{ width: 600, height: 800, borderRadius: 12 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[40, 24, 24, 60, 44, 44, 56].map((h, i) => <div key={i} className="skeleton" style={{ height: h, width: i === 0 ? '60%' : '100%' }} />)}
      </div>
    </div>
  );
}
