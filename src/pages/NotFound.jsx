import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="container center" style={{ flexDirection: 'column', gap: 20, padding: '160px 0' }}>
      <div className="t-display">404</div>
      <p style={{ color: 'var(--text-secondary)' }}>페이지를 찾을 수 없습니다.</p>
      <Button to="/" variant="dark">홈으로</Button>
    </div>
  );
}
