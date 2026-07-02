import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useStore } from '../store/StoreContext';
import { signIn, findGuestOrder } from '../lib/api';
import { formatKRW } from '../lib/session';

const SOCIALS = [['GOOGLE', '구글', '#fff', '#17181a'], ['KAKAO', '카카오', '#FEE500', '#17181a'], ['NAVER', '네이버', '#03C75A', '#fff']];

export default function Login() {
  const { setUser, refreshCartCount, refreshWishlist, showToast } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [guest, setGuest] = useState({ buyer_name: '', order_number: '', password: '' });
  const [guestResult, setGuestResult] = useState(null);

  const doLogin = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const u = await signIn(email, pw);
      setUser(u); await refreshCartCount(); await refreshWishlist();
      showToast(`${u.name}님 환영합니다`);
      nav('/mypage');
    } catch (e) { setErr(e.message); }
  };

  const doGuest = async (e) => {
    e.preventDefault(); setErr(''); setGuestResult(null);
    try { setGuestResult(await findGuestOrder(guest)); }
    catch (e) { setErr(e.message); }
  };

  return (
    <div className="container center" style={{ padding: '60px 0 120px' }}>
      <div style={{ width: 420 }}>
        <h1 className="t-h1" style={{ textAlign: 'center', marginBottom: 8 }}>GRIND</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 28 }}>RISE & GRIND</p>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          {[['login', '회원 로그인'], ['guest', '비회원 주문조회']].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setErr(''); }}
              style={{ flex: 1, padding: 14, fontWeight: 600, color: tab === k ? 'var(--charcoal)' : 'var(--text-secondary)',
                borderBottom: tab === k ? '2px solid var(--volt)' : '2px solid transparent', marginBottom: -1 }}>{l}</button>
          ))}
        </div>

        {tab === 'login' ? (
          <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="input" placeholder="이메일" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" placeholder="비밀번호" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
            {err && <p style={{ color: 'var(--sale)', fontSize: 13 }}>{err}</p>}
            <Button variant="dark" size="lg" block>로그인</Button>
            <div className="between" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <Link to="/find-account">아이디/비밀번호 찾기</Link>
              <Link to="/register">회원가입</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', color: 'var(--text-secondary)', fontSize: 13 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />또는<span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            {SOCIALS.map(([, label, bg, fg]) => (
              <button key={label} type="button" onClick={() => showToast('소셜 로그인은 데모에서 비활성화되어 있어요')}
                className="btn" style={{ background: bg, color: fg, border: '1px solid var(--border)' }}>{label}로 시작하기</button>
            ))}
          </form>
        ) : (
          <form onSubmit={doGuest} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input className="input" placeholder="주문자명" value={guest.buyer_name} onChange={(e) => setGuest({ ...guest, buyer_name: e.target.value })} required />
            <input className="input" placeholder="주문번호 (예: 20260701-XXXXXXX)" value={guest.order_number} onChange={(e) => setGuest({ ...guest, order_number: e.target.value })} required />
            <input className="input" placeholder="주문 비밀번호" type="password" value={guest.password} onChange={(e) => setGuest({ ...guest, password: e.target.value })} required />
            {err && <p style={{ color: 'var(--sale)', fontSize: 13 }}>{err}</p>}
            <Button variant="dark" size="lg" block>주문 조회</Button>
            {guestResult && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginTop: 8 }}>
                <div className="between"><b>{guestResult.order_number}</b><span className="badge badge--new">{guestResult.status}</span></div>
                <p style={{ marginTop: 8, fontSize: 14 }}>수령인 {guestResult.recipient_name} · {formatKRW(guestResult.final_payment_price)}</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{guestResult.recipient_address} {guestResult.recipient_detail_address}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
