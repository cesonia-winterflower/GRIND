# GRIND — 20대 남성 운동복 쇼핑몰

> RISE & GRIND — 매일, 조금씩. 풀스택 이커머스 포트폴리오 (React + Vite + Supabase)

라이브: **https://cesonia-winterflower.github.io/GRIND/**

## 기술 스택
- **Frontend**: React 19 · Vite 6 · React Router 7 · 순수 CSS 디자인 토큰
- **Backend/DB**: Supabase (PostgreSQL + PostgREST, RLS)
- **배포**: GitHub Actions → GitHub Pages
- **폰트**: Pretendard(한글) · Archivo(영문)
- **컬러**: white `#FFFFFF` · charcoal `#17181A` · volt `#C7F000` · sale `#E5484D`

## 페이지
- `/` 메인 (히어로 스와이퍼, BEST, 기획전, NEW, 브랜드스토리 마퀴, GRIND STYLE, 룩북, 리얼핏 리뷰)
- `/products` · `/category/:cat` 상품목록 (색상·사이즈·가격 필터, 정렬, 더보기)
- `/products/:id` 상품상세 (갤러리, 옵션(색×사이즈), 사이즈 추천, 리뷰/Q&A, 재입고 알림, 연관추천)
- `/cart` 장바구니 · `/checkout` 주문/결제 (쿠폰·적립금·비회원 주문·완료)
- `/login` 로그인 + 비회원 주문조회 · `/register` 회원가입(3단계) · `/find-account` 계정찾기
- `/mypage` 마이페이지 (대시보드·주문·찜·쿠폰)

## 핵심 기능
- 회원/비회원(session_id) 장바구니·찜, 로그인 시 **병합(merge)**
- 다차원 옵션(product_variants) 실재고 · 품절/재입고 알림
- 키·몸무게 기반 **사이즈 추천** · 검색 자동완성 · 챗봇(FAQ)
- 쿠폰(정률/정액)·적립금 · 주문 상태 머신 · 찜 카운트 트리거

## 로컬 실행
```bash
npm install
npm run dev      # http://localhost:5173/GRIND/
npm run build    # dist/
```

## 데이터베이스
- 스키마: `supabase/migrations/0001_init_schema.sql`
- 더미데이터: `supabase/seed.sql` (상품 24 · 옵션 188 · 이미지 96 · 리뷰/FAQ/쿠폰)
- 17개 테이블: users, social_accounts, products, product_images, product_variants,
  cart_items, wishlist_items, coupons, user_coupons, orders, order_items,
  reviews, qna, faqs, restock_alerts, verification_codes

> ⚠️ 포트폴리오 데모: 커스텀 인증(SHA-256, 클라이언트)과 anon 전체허용 RLS를 사용합니다.
> 실서비스 전환 시 Supabase Auth + 세분화된 RLS + 서버 사이드 검증이 필요합니다.

© 2026 GRIND
