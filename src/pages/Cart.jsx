import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, CloseIcon } from '../components/common/Icons';
import Button from '../components/common/Button';
import StepIndicator from '../components/common/StepIndicator';
import { useStore } from '../store/StoreContext';
import { formatKRW } from '../lib/session';
import { fetchCart, updateCartQty, removeCartItems } from '../lib/api';

export default function Cart() {
  const { user, refreshCartCount } = useStore();
  const nav = useNavigate();
  const [rows, setRows] = useState(null);
  const [checked, setChecked] = useState(new Set());

  const load = async () => {
    const r = await fetchCart(user);
    setRows(r);
    setChecked(new Set(r.map((x) => x.id)));
  };
  useEffect(() => { load(); }, []);

  const mainImg = (row) => {
    const imgs = row.product_variants?.products?.product_images || [];
    return (imgs.find((i) => i.is_main) || imgs[0])?.image_url;
  };
  const priceOf = (row) => (row.product_variants?.products?.sale_price || 0) * row.quantity;

  const toggle = (id) => setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allChecked = rows && checked.size === rows.length && rows.length > 0;
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  const changeQty = async (row, delta) => {
    const q = Math.max(1, row.quantity + delta);
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, quantity: q } : r)));
    await updateCartQty(row.id, q);
  };
  const remove = async (ids) => {
    if (!ids.length) return;
    await removeCartItems(ids);
    await refreshCartCount();
    load();
  };

  const selectedRows = (rows || []).filter((r) => checked.has(r.id));
  const itemsPrice = selectedRows.reduce((s, r) => s + priceOf(r), 0);
  const deliveryFee = itemsPrice >= 30000 || itemsPrice === 0 ? 0 : 3000;

  const goCheckout = () => {
    if (!selectedRows.length) return;
    sessionStorage.setItem('grind_checkout_ids', JSON.stringify(selectedRows.map((r) => r.id)));
    nav('/checkout');
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <StepIndicator step={1} />
      <h1 className="t-h1" style={{ margin: '32px 0 24px' }}>장바구니</h1>

      {rows === null ? <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        : rows.length === 0 ? (
          <div className="center" style={{ flexDirection: 'column', gap: 16, padding: '80px 0' }}>
            <p style={{ color: 'var(--text-secondary)' }}>장바구니가 비어 있습니다.</p>
            <Button to="/products" variant="dark">쇼핑 계속하기</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className="between" style={{ height: 40, borderBottom: '2px solid var(--charcoal)' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} /> 전체선택 ({checked.size}/{rows.length})
                </label>
                <button onClick={() => remove([...checked])} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>선택삭제</button>
              </div>
              {rows.map((row) => {
                const prod = row.product_variants?.products;
                return (
                  <div key={row.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <input type="checkbox" checked={checked.has(row.id)} onChange={() => toggle(row.id)} />
                    <Link to={`/products/${prod?.id}`}><img src={mainImg(row)} alt="" style={{ width: 100, height: 133, objectFit: 'cover', borderRadius: 8 }} /></Link>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500 }}>{prod?.name}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{row.product_variants?.color} / {row.product_variants?.size}</p>
                    </div>
                    <div className="stepper">
                      <button onClick={() => changeQty(row, -1)}><MinusIcon width={16} height={16} /></button>
                      <span className="val">{row.quantity}</span>
                      <button onClick={() => changeQty(row, 1)}><PlusIcon width={16} height={16} /></button>
                    </div>
                    <div style={{ width: 120, textAlign: 'right', fontWeight: 700 }}>{formatKRW(priceOf(row))}</div>
                    <button onClick={() => remove([row.id])} aria-label="삭제" style={{ color: 'var(--text-secondary)' }}><CloseIcon width={18} height={18} /></button>
                  </div>
                );
              })}
            </div>

            {/* 요약 */}
            <aside style={{ width: 400, flex: '0 0 auto', position: 'sticky', top: 96, border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>주문 요약</h3>
              <SummaryRow label="상품금액" value={formatKRW(itemsPrice)} />
              <SummaryRow label="배송비" value={deliveryFee === 0 ? '무료' : formatKRW(deliveryFee)} />
              <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
              <div className="between"><span style={{ fontWeight: 600 }}>총 결제금액</span><span style={{ fontSize: 24, fontWeight: 800 }}>{formatKRW(itemsPrice + deliveryFee)}</span></div>
              <Button variant="dark" size="lg" block onClick={goCheckout} disabled={!selectedRows.length} className="" >주문하기 ({selectedRows.length})</Button>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12, textAlign: 'center' }}>3만 원 이상 무료배송</p>
            </aside>
          </div>
        )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return <div className="between" style={{ padding: '6px 0', fontSize: 14 }}><span style={{ color: 'var(--text-secondary)' }}>{label}</span><span style={{ fontWeight: 600 }}>{value}</span></div>;
}
