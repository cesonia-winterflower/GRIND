// 이미지 소스: Unsplash (실제 존재하는 사진만, 전부 curl 200 + 육안 확인 완료 — 가짜 URL 없음)
// 컨셉: urban athleisure · minimalist activewear · street sportswear · casual men's running
// id 로 저장하고 크기는 요청 시 정확히 부여(3:4 / 히어로 비율 등) → 어떤 배치에서도 안 깨짐.
export const img = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=72`;

// Z3 히어로 (1920x640) — 도심 러닝 / 스트리트 애슬레저
export const HERO = [
  { id: '1483721310020-03333e577078', head: 'RISE & GRIND', sub: '매일, 조금씩.' },        // 도심 스트리트 · 러닝 준비
  { id: '1607962837359-5e7e89f86776', head: 'GYM TO STREET', sub: '헬스장에서 거리까지.' },  // 캐주얼 러닝
  { id: '1556906781-9a412961c28c', head: 'DAILY ATHLEISURE', sub: '사이즈 걱정 없이.' },     // 옥상 · 조거 · 스니커즈
];

// Z4 카테고리 (245x245)
export const CATEGORY_IMG = {
  TOP: '1503341504253-dff4815485f1',    // 스트리트 그래픽 티 + 쇼츠
  BOTTOM: '1556906781-9a412961c28c',    // 조거 팬츠 · 스니커즈
  OUTER: '1516826957135-700dedea698c',  // 스웻셔츠 · 도심
  SET: '1607962837359-5e7e89f86776',    // 러닝 세트
  ACCESSORY: '1608231387042-66d1773070a5', // 미니멀 스니커즈
};

export const PROMO_IMG = '1517649763962-0c623066013b'; // 로드 사이클 (스포츠 다이내믹)
export const BRAND_IMG = '1605296867304-46d5465a13f1'; // 무드 (다크)
export const POPUP_IMG = '1618354691373-d851c5c3a990'; // 티셔츠 상품컷

// Z9 GRIND STYLE 착장 이미지 (3:4)
export const STYLE_POOL = [
  '1483721310020-03333e577078', '1503341504253-dff4815485f1', '1516826957135-700dedea698c',
  '1556906781-9a412961c28c', '1549476464-37392f717541', '1571019614242-c5c5dee9f50b',
];

// Z10 룩북 (424x566)
export const LOOKBOOK_POOL = [
  '1483721310020-03333e577078', '1503341504253-dff4815485f1', '1516826957135-700dedea698c',
  '1605296867304-46d5465a13f1', '1556906781-9a412961c28c', '1549476464-37392f717541',
  '1607962837359-5e7e89f86776', '1461897104016-0b3b00cc81ee',
];
