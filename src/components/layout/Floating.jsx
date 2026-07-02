import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatIcon, CloseIcon, ArrowRight } from '../common/Icons';
import { fetchFaqs } from '../../lib/api';

const CAT_LABEL = { SHIPPING: '배송', RETURN: '교환/반품', SIZE: '사이즈' };

export default function Floating() {
  const [chatOpen, setChatOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [active, setActive] = useState(null);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    fetchFaqs().then(setFaqs).catch(() => {});
    if (!sessionStorage.getItem('grind_popup_seen')) {
      const t = setTimeout(() => setPopup(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const closePopup = () => { setPopup(false); sessionStorage.setItem('grind_popup_seen', '1'); };
  const cats = [...new Set(faqs.map((f) => f.category))];

  return (
    <>
      {/* 챗봇 버튼 */}
      <button aria-label="챗봇 열기" onClick={() => setChatOpen((v) => !v)}
        style={{ position: 'fixed', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 999,
          background: 'var(--charcoal)', color: '#fff', display: 'grid', placeItems: 'center',
          boxShadow: 'var(--shadow-float)', zIndex: 800 }}>
        {chatOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* 챗봇 패널 */}
      {chatOpen && (
        <div style={{ position: 'fixed', right: 24, bottom: 92, width: 360, height: 480, background: '#fff',
          borderRadius: 16, boxShadow: 'var(--shadow-float)', zIndex: 800, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'fadeUp 0.2s ease' }}>
          <div style={{ background: 'var(--charcoal)', color: '#fff', padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--font-en)', fontWeight: 800, fontSize: 18 }}>GRIND HELP</div>
            <div style={{ fontSize: 12, color: 'var(--on-charcoal-56)', marginTop: 2 }}>무엇을 도와드릴까요? 아래에서 골라보세요.</div>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid var(--border)' }}>
            {cats.map((c) => (
              <button key={c} onClick={() => setActive(active === c ? null : c)}
                className={`chip ${active === c ? 'is-active' : ''}`}>{CAT_LABEL[c] || c}</button>
            ))}
          </div>
          <div className="noscrollbar" style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {faqs.filter((f) => !active || f.category === active).map((f) => (
              <details key={f.id} style={{ borderBottom: '1px solid var(--border)', padding: '10px 4px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 600, listStyle: 'none' }}>Q. {f.question}</summary>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 진입 팝업 */}
      {popup && (
        <div onClick={closePopup} style={{ position: 'fixed', inset: 0, background: 'rgba(23,24,26,0.55)', zIndex: 950,
          display: 'grid', placeItems: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 400, height: 480, background: '#fff', borderRadius: 16,
            overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-float)' }}>
            <img src="https://picsum.photos/seed/grind-popup/400/300?grayscale" alt="" style={{ width: '100%', height: 260, objectFit: 'cover' }} />
            <button onClick={closePopup} aria-label="닫기" style={{ position: 'absolute', top: 12, right: 12, color: '#fff' }}><CloseIcon /></button>
            <div style={{ padding: 24 }}>
              <div className="badge badge--new" style={{ marginBottom: 10 }}>WELCOME</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>신규가입 15% 쿠폰</div>
              <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14 }}>지금 가입하면 즉시 사용 가능한 쿠폰을 드려요. 오늘도 갈아 넣자.</p>
              <Link to="/register" onClick={closePopup} className="btn btn--volt btn--block" style={{ marginTop: 18 }}>
                가입하고 쿠폰 받기 <ArrowRight width={18} height={18} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
