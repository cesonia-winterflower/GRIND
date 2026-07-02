import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import ProductCard from '../components/common/ProductCard';
import { useStore } from '../store/StoreContext';
import { formatKRW } from '../lib/session';
import { fetchOrders, fetchWishlist, fetchUserCoupons, enrichWithVariants } from '../lib/api';

const MENU = [['dashboard', '대시보드'], ['orders', '주문내역'], ['wish', '관심상품'], ['coupons', '쿠폰/적립금'], ['activity', '내 후기·문의']];
const ORDER_STEPS = ['PENDING', 'PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'];
const STEP_LABEL = { PENDING: '입금전', PAID: '결제완료', PREPARING: '배송준비', SHIPPING: '배송중', DELIVERED: '배송완료' };

export default function MyPage() {
  const { user, logout, refreshCartCount, showToast } = useStore();
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'dashboard';
  const [orders, setOrders] = useState([]);
  const [wish, setWish] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchOrders(user).then(setOrders);
    fetchWishlist(user).then((w) => {
      const prods = w.filter((x) => x.products).map((x) => {
        const imgs = x.products.product_images || [];
        const main = imgs.find((i) => i.is_main) || imgs[0];
        return { ...x.products, mainImage: main?.image_url, hoverImage: imgs[1]?.image_url || main?.image_url, _wid: x.id };
      });
      enrichWithVariants(prods).then(setWish);
    });
    fetchUserCoupons(user).then(setCoupons);
  }, [user]);

  if (!user) {
    return (
      <div className="container center" style={{ padding: '80px 0 140px' }}>
        <div style={{ width: 420, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 16, padding: 40 }}>
          <h1 className="t-h2" style={{ marginBottom: 8 }}>로그인이 필요합니다</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>마이페이지는 로그인 후 이용할 수 있어요.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button to="/login" variant="dark">로그인</Button>
            <Button to="/register" variant="outline">회원가입</Button>
          </div>
        </div>
      </div>
    );
  }

  const statusCount = (s) => orders.filter((o) => o.status === s).length;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, display: 'flex', gap: 40, alignItems: 'flex-start' }}>
      {/* 사이드 */}
      <aside style={{ width: 220, flex: '0 0 auto' }}>
        <div style={{ padding: '4px 0 20px' }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{user.name}님</div>
          <span className="badge badge--soft" style={{ marginTop: 6 }}>{user.user_level}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {MENU.map(([k, l]) => (
            <button key={k} onClick={() => setSp({ tab: k })}
              style={{ textAlign: 'left', height: 48, padding: '0 14px', fontSize: 15, fontWeight: tab === k ? 700 : 500,
                color: tab === k ? 'var(--charcoal)' : 'var(--text-secondary)',
                borderLeft: tab === k ? '3px solid var(--volt)' : '3px solid transparent', background: tab === k ? 'var(--placeholder)' : 'transparent' }}>{l}</button>
          ))}
          <button onClick={() => { logout(); nav('/'); }} style={{ textAlign: 'left', height: 48, padding: '0 14px', fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>로그아웃</button>
        </nav>
      </aside>

      {/* 콘텐츠 */}
      <div style={{ flex: 1 }}>
        {tab === 'dashboard' && (
          <>
            <h1 className="t-h2" style={{ marginBottom: 24 }}>{user.name}님, 오늘도 갈아 넣자 💪</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              <StatCard label="보유 적립금" value={`${(user.points || 0).toLocaleString()} P`} />
              <StatCard label="보유 쿠폰" value={`${coupons.length} 장`} />
              <StatCard label="회원 등급" value={user.user_level} />
            </div>
            <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>주문 처리 현황</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {ORDER_STEPS.map((s) => (
                  <div key={s} className="center" style={{ flexDirection: 'column', gap: 6, flex: 1 }}>
                    <span style={{ fontSize: 28, fontWeight: 800 }}>{statusCount(s)}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{STEP_LABEL[s]}</span>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontWeight: 700, margin: '32px 0 16px' }}>최근 주문</h3>
            {orders.slice(0, 3).map((o) => <OrderRow key={o.id} order={o} />)}
            {orders.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>주문 내역이 없습니다.</p>}

            <h3 style={{ fontWeight: 700, margin: '32px 0 16px' }}>관심상품</h3>
            <div className="grid-4" style={{ justifyContent: 'flex-start' }}>{wish.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} cardW={242} imgH={323} />)}</div>
            {wish.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>찜한 상품이 없습니다.</p>}
          </>
        )}

        {tab === 'orders' && (
          <>
            <h1 className="t-h2" style={{ marginBottom: 24 }}>주문내역</h1>
            {orders.map((o) => <OrderRow key={o.id} order={o} detailed />)}
            {orders.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>주문 내역이 없습니다.</p>}
          </>
        )}

        {tab === 'wish' && (
          <>
            <h1 className="t-h2" style={{ marginBottom: 24 }}>관심상품 ({wish.length})</h1>
            <div className="grid-4" style={{ justifyContent: 'flex-start' }}>
              {wish.map((p) => (
                <div key={p.id}>
                  <ProductCard product={p} cardW={242} imgH={323} />
                  <button className="btn btn--dark btn--sm btn--block" style={{ marginTop: 8 }}
                    onClick={() => nav(`/products/${p.id}`)}>담으러 가기</button>
                </div>
              ))}
            </div>
            {wish.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>찜한 상품이 없습니다.</p>}
          </>
        )}

        {tab === 'coupons' && (
          <>
            <h1 className="t-h2" style={{ marginBottom: 24 }}>쿠폰 / 적립금</h1>
            <div style={{ padding: 24, background: 'var(--charcoal)', color: '#fff', borderRadius: 12, marginBottom: 24 }}>
              <span style={{ color: 'var(--on-charcoal-56)', fontSize: 14 }}>보유 적립금</span>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--volt)' }}>{(user.points || 0).toLocaleString()} P</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {coupons.map((c) => (
                <div key={c.id} className="between" style={{ border: '1px dashed var(--charcoal)', borderRadius: 12, padding: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{c.coupons.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{c.coupons.min_order_price.toLocaleString()}원 이상 · ~{new Date(c.expires_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sale)' }}>
                    {c.coupons.discount_type === 'PERCENTAGE' ? `${c.coupons.discount_value}%` : formatKRW(c.coupons.discount_value)}
                  </div>
                </div>
              ))}
              {coupons.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>보유한 쿠폰이 없습니다.</p>}
            </div>
          </>
        )}

        {tab === 'activity' && (
          <>
            <h1 className="t-h2" style={{ marginBottom: 24 }}>내 후기 · 문의</h1>
            <p style={{ color: 'var(--text-secondary)' }}>상품 상세 페이지에서 남긴 후기와 문의가 여기에 모입니다. (데모 기준 로그인 유저 기록)</p>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ height: 120, border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{value}</span>
    </div>
  );
}

function OrderRow({ order, detailed }) {
  const items = order.order_items || [];
  const first = items[0];
  const prod = first?.product_variants?.products;
  const imgs = prod?.product_images || [];
  const img = (imgs.find((i) => i.is_main) || imgs[0])?.image_url;
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
      <div className="between" style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(order.created_at).toLocaleDateString()} · {order.order_number}</span>
        <span className="badge badge--new">{STEP_LABEL[order.status] || order.status}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {img && <img src={img} alt="" style={{ width: 56, height: 74, objectFit: 'cover', borderRadius: 6 }} />}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>{prod?.name}{items.length > 1 ? ` 외 ${items.length - 1}건` : ''}</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{formatKRW(order.final_payment_price)}</p>
        </div>
      </div>
      {detailed && order.tracking_number && <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text-secondary)' }}>송장: {order.tracking_number}</p>}
    </div>
  );
}
