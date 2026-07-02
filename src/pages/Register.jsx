import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { CheckIcon } from '../components/common/Icons';
import { useStore } from '../store/StoreContext';
import { signUp } from '../lib/api';
import { supabase } from '../lib/supabase';

const TERMS = [
  ['age', '만 14세 이상입니다 (필수)', true],
  ['tos', '이용약관 동의 (필수)', true],
  ['privacy', '개인정보 수집·이용 동의 (필수)', true],
  ['marketing', '마케팅 정보 수신 동의 (선택)', false],
];
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function Register() {
  const { setUser, refreshCartCount, showToast } = useStore();
  const nav = useNavigate();
  const [stepN, setStepN] = useState(1);
  const [agree, setAgree] = useState({});
  const [emailOk, setEmailOk] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', password2: '', name: '', phone: '', zipcode: '', base_address: '', detail_address: '', gender: '', birth_date: '' });
  const [err, setErr] = useState('');

  const allRequired = TERMS.filter((t) => t[2]).every((t) => agree[t[0]]);
  const allChecked = TERMS.every((t) => agree[t[0]]);
  const toggleAll = () => { const v = !allChecked; setAgree(Object.fromEntries(TERMS.map((t) => [t[0], v]))); };

  const checkEmail = async () => {
    if (!form.email) return;
    const { data } = await supabase.from('users').select('id').eq('email', form.email).maybeSingle();
    setEmailOk(!data);
  };

  const submit = async () => {
    setErr('');
    if (!PW_RE.test(form.password)) return setErr('비밀번호는 영문+숫자 8자 이상이어야 합니다.');
    if (form.password !== form.password2) return setErr('비밀번호가 일치하지 않습니다.');
    if (!form.name || !form.phone) return setErr('이름과 연락처를 입력해주세요.');
    if (emailOk === false) return setErr('이미 사용 중인 이메일입니다.');
    try {
      const u = await signUp(form);
      setUser(u); await refreshCartCount();
      setStepN(3);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="container center" style={{ padding: '60px 0 120px' }}>
      <div style={{ width: 460 }}>
        <h1 className="t-h1" style={{ textAlign: 'center', marginBottom: 24 }}>회원가입</h1>
        <Steps n={stepN} />

        {stepN === 1 && (
          <div style={{ marginTop: 32 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 16, border: '1px solid var(--charcoal)', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              <input type="checkbox" checked={allChecked} onChange={toggleAll} /> 전체 동의
            </label>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TERMS.map(([k, label]) => (
                <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!agree[k]} onChange={() => setAgree({ ...agree, [k]: !agree[k] })} /> {label}
                </label>
              ))}
            </div>
            <Button variant="dark" size="lg" block onClick={() => allRequired && setStepN(2)} disabled={!allRequired} style={{ marginTop: 24 }}>다음</Button>
          </div>
        )}

        {stepN === 2 && (
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: 1 }}><label>이메일 (아이디)</label>
                <input className="input" type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setEmailOk(null); }} /></div>
              <button className="btn btn--outline btn--sm" onClick={checkEmail}>중복확인</button>
            </div>
            {emailOk === true && <p style={{ color: 'green', fontSize: 13 }}>사용 가능한 이메일입니다.</p>}
            {emailOk === false && <p style={{ color: 'var(--sale)', fontSize: 13 }}>이미 사용 중인 이메일입니다.</p>}
            <input className="input" type="password" placeholder="비밀번호 (영문+숫자 8자 이상)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className="input" type="password" placeholder="비밀번호 확인" value={form.password2} onChange={(e) => setForm({ ...form, password2: e.target.value })} />
            <input className="input" placeholder="이름" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="휴대전화" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" placeholder="우편번호" value={form.zipcode} onChange={(e) => setForm({ ...form, zipcode: e.target.value })} style={{ width: 140 }} />
              <button className="btn btn--outline btn--sm" onClick={() => setForm({ ...form, zipcode: '04524', base_address: '서울특별시 중구 세종대로 110' })}>주소검색</button>
            </div>
            <input className="input" placeholder="기본 주소" value={form.base_address} onChange={(e) => setForm({ ...form, base_address: e.target.value })} />
            <input className="input" placeholder="상세 주소" value={form.detail_address} onChange={(e) => setForm({ ...form, detail_address: e.target.value })} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="">성별</option><option value="MALE">남성</option><option value="FEMALE">여성</option></select>
              <input className="input" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            </div>
            {err && <p style={{ color: 'var(--sale)', fontSize: 13 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn--ghost btn--lg" style={{ flex: 1 }} onClick={() => setStepN(1)}>이전</button>
              <Button variant="dark" size="lg" onClick={submit} className="" style={{ flex: 2 }}>가입 완료</Button>
            </div>
          </div>
        )}

        {stepN === 3 && (
          <div className="center" style={{ flexDirection: 'column', gap: 12, marginTop: 40, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--volt)', display: 'grid', placeItems: 'center' }}><CheckIcon width={36} height={36} /></div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>가입을 환영합니다!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>즉시 사용 가능한 <b style={{ color: 'var(--charcoal)' }}>가입 축하 15% 쿠폰</b>이 발급되었어요.</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Button to="/mypage" variant="outline">마이페이지</Button>
              <Button to="/products" variant="dark">쇼핑 시작하기</Button>
            </div>
          </div>
        )}
        {stepN < 3 && <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>이미 회원이신가요? <Link to="/login" style={{ color: 'var(--charcoal)', fontWeight: 600 }}>로그인</Link></p>}
      </div>
    </div>
  );
}

function Steps({ n }) {
  const labels = ['약관동의', '정보입력', '가입완료'];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
      {labels.map((l, i) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 24, height: 24, borderRadius: 999, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
              background: n >= i + 1 ? 'var(--volt)' : 'var(--placeholder)', color: n >= i + 1 ? 'var(--charcoal)' : 'var(--text-secondary)' }}>{i + 1}</span>
            <span style={{ fontSize: 14, fontWeight: n === i + 1 ? 700 : 500, color: n >= i + 1 ? 'var(--charcoal)' : 'var(--text-secondary)' }}>{l}</span>
          </div>
          {i < 2 && <span style={{ width: 30, height: 1, background: 'var(--border)' }} />}
        </div>
      ))}
    </div>
  );
}
