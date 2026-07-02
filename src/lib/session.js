// 비회원 식별용 session_id (브라우저 로컬 저장)
const KEY = 'grind_session_id';

export function getSessionId() {
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = 'sess_' + crypto.randomUUID();
    localStorage.setItem(KEY, sid);
  }
  return sid;
}

// 데모용 간이 해시 (실서비스에서는 서버 bcrypt 필수)
export async function hashPassword(pw) {
  const data = new TextEncoder().encode('grind$' + pw);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function formatKRW(n) {
  return (n ?? 0).toLocaleString('ko-KR') + '원';
}
