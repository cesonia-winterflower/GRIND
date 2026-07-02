// 키·몸무게 기반 사이즈 추천 (기존 구매 데이터 성향 반영한 간이 비즈니스 로직)
// 운동인 체형(어깨·허벅지 발달) 가중치 포함
export function recommendSize({ height, weight, category = 'TOP', build = 'normal' }) {
  const h = Number(height), w = Number(weight);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  // 기본 사이즈 인덱스: S=0 M=1 L=2 XL=3
  let idx;
  if (category === 'BOTTOM') {
    if (w < 60) idx = 0; else if (w < 70) idx = 1; else if (w < 82) idx = 2; else idx = 3;
  } else {
    if (h < 168) idx = 0; else if (h < 175) idx = 1; else if (h < 183) idx = 2; else idx = 3;
    if (bmi >= 25) idx = Math.min(3, idx + 1); // 근육/체중 반영
  }
  if (build === 'athletic') idx = Math.min(3, idx + 1); // 운동인 체형 한 사이즈 업
  const sizes = ['S', 'M', 'L', 'XL'];
  const size = sizes[Math.max(0, Math.min(3, idx))];
  const msg = build === 'athletic'
    ? `어깨·허벅지 발달 체형을 반영해 여유 있는 ${size} 사이즈를 추천합니다.`
    : `키 ${h}cm · ${w}kg 기준 ${size} 사이즈가 가장 잘 맞습니다.`;
  return { size, message: msg, bmi: bmi.toFixed(1) };
}
