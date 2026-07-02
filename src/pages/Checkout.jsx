import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StepIndicator from '../components/common/StepIndicator';
import Button from '../components/common/Button';
import { CheckIcon } from '../components/common/Icons';
import { useStore } from '../store/StoreContext';
import { formatKRW } from '../lib/session';
import { fetchCart, fetchUserCoupons, createOrder } from '../lib/api';

export default function Checkout() {
  const { user, refreshCartCount } = useStore();
  const [rows, setRows] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponId, setCouponId] = useState('');
  const [usePoints, setUsePoints] = useState(0);
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    buyer_name: user?.name || '', buyer_phone: user?.phone || '',
    recipient_name: user?.name || '', recipient_phone: user?.phone || '',
    recipient_zipcode: user?.zipcode || '', recipient_address: user?.base_address || '', recipient_detail_address: user?.detail_address || '',
    non_member_password: '',
  });

  useEffect(() => {
    (async () => {
      const all = await fetchCart(user);
      let ids = null;
      try { ids = JSON.parse(sessionStorage.getItem('grind_checkout_ids') || 'null'); } catch { /* */ }
      setRows(ids ? all.filter((r) => ids.includes(r.id)) : all);
      if (user) setCoupons(await fetchUserCoupons(user));
    })();
  }, []);

  const priceOf = (r) => (r.product_variants?.products?.sale_price || 0) * r.quantity;
  const itemsPrice = (rows || []).reduce((s, r) => s + priceOf(r), 0);
  const deliveryFee = itemsPrice >= 30000 || itemsPrice === 0 ? 0 : 3000;

  const coupon = coupons.find((c) => c.id === couponId)?.coupons;
  let discountCoupon = 0;
  if (coupon && itemsPrice >= coupon.min_order_price) {
    discountCoupon = coupon.discount_type === 'PERCENTAGE'
      ? Math.min(Math.floor(itemsPrice * coupon.discount_value / 100), coupon.max_discount_amount || Infinity)
      : coupon.discount_value;
  }
  const maxPoints = Math.min(user?.points || 0, Math.max(0, itemsPrice - discountCoupon));
  const pointsUsed = Math.min(usePoints, maxPoints);
  const finalPrice = Math.max(0, itemsPrice - discountCoupon - pointsUsed) + deliveryFee;

  const pay = async () => {
    if (!form.recipient_name || !form.recipient_phone || !form.recipient_address) return alert('배송지 정보를 입력해주세요.');
    if (!user && !form.non_member_password) return alert('비회원 주문 비밀번호를 입력해주세요.');
    if (!agree) return alert('주문 약관에 동의해주세요.');
    try {
      const order = await createOrder({ user, cartRows: rows, form, discountCoupon, discountPoints: pointsUsed });
      sessionStorage.removeItem('grind_checkout_ids');
      await refreshCartCount();
      setDone(order);
      window.scrollTo(0, 0);
    } catch (e) { alert('결제 처리 중 오류: ' + e.message); }
  };

  if (done) {
    return (
      <div className="container" style={{ paddingTop: 40, paddingBottom: 120 }}>
        <StepIndicator step={3} />
        <div className="center" style={{ flexDirection: 'column', gap: 12, marginTop: 60, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--volt)', display: 'grid', placeItems: 'center' }}><CheckIcon width={36} height={36} /></div>
          <h1 className="t-h1" style={{ marginTop: 12 }}>주문 완료</h1>
          <p style={{ color: 'var(--text-secondary)' }}>주문번호 <b style={{ color: 'var(--charcoal)' }}>{done.order_number}</b></p>
          <p style={{ fontSize: 22, fontWeight: 800, marginTop: 8 }}>{formatKRW(done.final_payment_price)}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Button to="/mypage" variant="outline">주문 상세</Button>
            <Button to="/products" variant="dark">쇼핑 계속</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <StepIndicator step={2} />
      <h1 className="t-h1" style={{ margin: '32px 0 24px' }}>주문/결제</h1>
      {rows === null ? <div className="skeleton" style={{ height: 300, borderRadius: 12 }} /> : (
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
            <Block title="주문 상품">
              {rows.map((r) => (
                <div key={r.id} className="between" style={{ padding: '10px 0', fontSize: 14 }}>
                  <span>{r.product_variants?.products?.name} · {r.product_variants?.color}/{r.product_variants?.size} · {r.quantity}개</span>
                  <span style={{ fontWeight: 700 }}>{formatKRW(priceOf(r))}</span>
                </div>
              ))}
            </Block>

            <Block title="주문자 정보">
              <Grid2>
                <Field label="주문자명"><input className="input" value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} /></Field>
                <Field label="연락처"><input className="input" value={form.buyer_phone} onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })} /></Field>
              </Grid2>
            </Block>

            <Block title="배송지">
              <Grid2>
                <Field label="수령인"><input className="input" value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} /></Field>
                <Field label="연락처"><input className="input" value={form.recipient_phone} onChange={(e) => setForm({ ...form, recipient_phone: e.target.value })} /></Field>
              </Grid2>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <input className="input" placeholder="우편번호" value={form.recipient_zipcode} onChange={(e) => setForm({ ...form, recipient_zipcode: e.target.value })} style={{ width: 140 }} />
                <button className="btn btn--outline btn--sm" onClick={() => setForm({ ...form, recipient_zipcode: '04524', recipient_address: '서울특별시 중구 세종대로 110' })}>우편번호 검색</button>
              </div>
              <input className="input" placeholder="기본 주소" value={form.recipient_address} onChange={(e) => setForm({ ...form, recipient_address: e.target.value })} style={{ marginTop: 12 }} />
              <input className="input" placeholder="상세 주소" value={form.recipient_detail_address} onChange={(e) => setForm({ ...form, recipient_detail_address: e.target.value })} style={{ marginTop: 12 }} />
            </Block>

            {!user && (
              <Block title="비회원 주문 비밀번호">
                <input className="input" type="password" placeholder="주문 조회 시 사용할 비밀번호" value={form.non_member_password} onChange={(e) => setForm({ ...form, non_member_password: e.target.value })} />
              </Block>
            )}

            <Block title="쿠폰 / 적립금">
              <Field label="쿠폰">
                <select className="input" value={couponId} onChange={(e) => setCouponId(e.target.value)}>
                  <option value="">쿠폰 선택 (보유 {coupons.length}장)</option>
                  {coupons.map((c) => <option key={c.id} value={c.id}>{c.coupons.name}</option>)}
                </select>
              </Field>
              <Field label={`적립금 (보유 ${(user?.points || 0).toLocaleString()}P)`}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="input" type="number" value={usePoints} onChange={(e) => setUsePoints(Math.max(0, +e.target.value || 0))} />
                  <button className="btn btn--ghost btn--sm" onClick={() => setUsePoints(maxPoints)}>전액</button>
                </div>
              </Field>
            </Block>

            <Block title="결제 수단">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['신용카드', '무통장입금', '카카오페이', '네이버페이'].map((m, i) => (
                  <label key={m} className="chip" style={{ height: 44 }}><input type="radio" name="pay" defaultChecked={i === 0} style={{ marginRight: 6 }} />{m}</label>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>* 포트폴리오 데모: 실제 결제는 진행되지 않습니다 (PG 가상 연동).</p>
            </Block>
          </div>

          {/* 요약 */}
          <aside style={{ width: 400, flex: '0 0 auto', position: 'sticky', top: 96, border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>결제 금액</h3>
            <Sum label="상품금액" value={formatKRW(itemsPrice)} />
            <Sum label="쿠폰 할인" value={'-' + formatKRW(discountCoupon)} accent />
            <Sum label="적립금 사용" value={'-' + formatKRW(pointsUsed)} accent />
            <Sum label="배송비" value={deliveryFee === 0 ? '무료' : formatKRW(deliveryFee)} />
            <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <div className="between"><span style={{ fontWeight: 600 }}>최종 결제금액</span><span style={{ fontSize: 24, fontWeight: 800 }}>{formatKRW(finalPrice)}</span></div>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, margin: '16px 0' }}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 주문 내용 확인 및 결제 약관에 동의합니다.
            </label>
            <Button variant="dark" size="lg" block onClick={pay}>결제하기</Button>
          </aside>
        </div>
      )}
      <p style={{ marginTop: 24 }}><Link to="/cart" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>← 장바구니로 돌아가기</Link></p>
    </div>
  );
}

const Block = ({ title, children }) => (
  <section><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid var(--charcoal)' }}>{title}</h3>{children}</section>
);
const Grid2 = ({ children }) => <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
const Field = ({ label, children }) => <div className="field" style={{ marginTop: 12 }}><label>{label}</label>{children}</div>;
const Sum = ({ label, value, accent }) => <div className="between" style={{ padding: '6px 0', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>{label}</span><span style={{ fontWeight: 600, color: accent ? 'var(--sale)' : 'inherit' }}>{value}</span></div>;
