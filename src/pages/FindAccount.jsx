import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { useStore } from '../store/StoreContext';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../lib/session';

export default function FindAccount() {
  const { showToast } = useStore();
  const [method, setMethod] = useState('email');
  const [target, setTarget] = useState('');
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [serverCode, setServerCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [left, setLeft] = useState(0);
  const [newPw, setNewPw] = useState('');
  const [err, setErr] = useState('');
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const sendCode = async () => {
    setErr('');
    const gen = String(Math.floor(100000 + Math.random() * 900000));
    setServerCode(gen); setSent(true); setLeft(180);
    // 데모: verification_codes 기록 (실제 발송은 없음)
    const expires = new Date(Date.now() + 180000).toISOString();
    await supabase.from('verification_codes').insert({ target_value: target, code: gen, expires_at: expires });
    clearInterval(timer.current);
    timer.current = setInterval(() => setLeft((v) => { if (v <= 1) { clearInterval(timer.current); return 0; } return v - 1; }), 1000);
    showToast(`데모 인증번호: ${gen}`);
  };

  const verify = () => {
    if (left <= 0) return setErr('인증 시간이 만료되었습니다. 다시 요청해주세요.');
    if (code === serverCode) { setVerified(true); setErr(''); }
    else setErr('인증번호가 일치하지 않습니다.');
  };

  const resetPw = async () => {
    if (newPw.length < 8) return setErr('비밀번호는 8자 이상이어야 합니다.');
    const hash = await hashPassword(newPw);
    const col = method === 'email' ? 'email' : 'phone';
    const { data } = await supabase.from('users').update({ password_hash: hash }).eq(col, target).select('id');
    if (data?.length) showToast('비밀번호가 재설정되었습니다. 로그인해주세요.');
    else showToast('일치하는 계정이 없어요 (데모)');
  };

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <div className="container center" style={{ padding: '60px 0 120px' }}>
      <div style={{ width: 420 }}>
        <h1 className="t-h1" style={{ textAlign: 'center', marginBottom: 24 }}>아이디/비밀번호 찾기</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[['email', '이메일 인증'], ['phone', '휴대전화 인증']].map(([k, l]) => (
            <label key={k} className={`chip ${method === k ? 'is-active' : ''}`} style={{ flex: 1, justifyContent: 'center', height: 44 }}>
              <input type="radio" name="m" checked={method === k} onChange={() => { setMethod(k); setSent(false); setVerified(false); }} style={{ marginRight: 6 }} />{l}
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" placeholder={method === 'email' ? '가입 이메일' : '휴대전화 번호'} value={target} onChange={(e) => setTarget(e.target.value)} />
          <button className="btn btn--outline btn--sm" onClick={sendCode} disabled={!target}>{sent ? '재전송' : '인증요청'}</button>
        </div>

        {sent && !verified && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input className="input" placeholder="인증번호 6자리" value={code} onChange={(e) => setCode(e.target.value)} />
                <span style={{ position: 'absolute', right: 14, top: 16, color: 'var(--sale)', fontSize: 13, fontWeight: 600 }}>{mm}:{ss}</span>
              </div>
              <button className="btn btn--dark btn--sm" onClick={verify}>확인</button>
            </div>
          </div>
        )}

        {verified && (
          <div style={{ marginTop: 20 }}>
            <p style={{ color: 'green', fontSize: 13, marginBottom: 12 }}>✓ 인증되었습니다. 새 비밀번호를 설정하세요.</p>
            <input className="input" type="password" placeholder="새 비밀번호 (8자 이상)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            <Button variant="dark" size="lg" block onClick={resetPw} style={{ marginTop: 12 }}>비밀번호 재설정</Button>
          </div>
        )}

        {err && <p style={{ color: 'var(--sale)', fontSize: 13, marginTop: 12 }}>{err}</p>}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13 }}><Link to="/login" style={{ color: 'var(--text-secondary)' }}>← 로그인으로</Link></p>
      </div>
    </div>
  );
}
