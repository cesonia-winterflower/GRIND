-- ============================================================
-- GRIND · 20대 남성 운동복 쇼핑몰 · 초기 스키마
-- PostgreSQL / Supabase
-- 주의: 포트폴리오 데모용. 커스텀 인증(public.users)을 사용하며
--       RLS는 데모 편의를 위해 anon 접근을 허용하는 정책을 둡니다.
-- ============================================================

create extension if not exists pgcrypto;

-- 키핑용 헬스체크(기존 keep-alive 워크플로우가 참조)
create table if not exists public.health_check (
  id bigserial primary key,
  checked_at timestamptz not null default now()
);
insert into public.health_check (id) values (1) on conflict do nothing;

-- 1) users ----------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255),
  name varchar(100) not null,
  zipcode varchar(10),
  base_address varchar(255),
  detail_address varchar(255),
  phone varchar(50),
  gender varchar(10),
  birth_date date,
  is_solar boolean not null default true,
  region varchar(50),
  points integer not null default 0,
  user_level varchar(20) not null default 'BRONZE',
  created_at timestamptz not null default now()
);

-- 2) social_accounts ------------------------------------------
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider varchar(50) not null,
  provider_user_id varchar(255) not null,
  connected_at timestamptz not null default now()
);

-- 3) products -------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  description text,
  category varchar(100) not null,
  original_price integer not null,
  sale_price integer not null,
  discount_rate integer not null default 0,
  wish_count integer not null default 0,
  review_count integer not null default 0,
  rating_avg numeric(3,2) not null default 0.00,
  is_displayed boolean not null default true,
  -- 데모 진열 큐레이션용 플래그(기획안 섹션 매핑)
  is_best boolean not null default false,
  is_new boolean not null default false,
  badge_text varchar(30),
  created_at timestamptz not null default now()
);

-- 4) product_images -------------------------------------------
create table if not exists public.product_images (
  id bigserial primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  is_main boolean not null default false,
  sort_order integer not null default 0
);

-- 5) product_variants -----------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color varchar(50) not null,
  size varchar(50) not null,
  stock integer not null default 0,
  sku varchar(100)
);

-- 6) cart_items -----------------------------------------------
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id varchar(255),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity >= 1),
  created_at timestamptz not null default now()
);

-- 7) wishlist_items -------------------------------------------
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  session_id varchar(255),
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 8) coupons --------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) unique not null,
  name varchar(100) not null,
  discount_type varchar(20) not null,          -- PERCENTAGE / FIXED
  discount_value integer not null,
  min_order_price integer not null default 0,
  max_discount_amount integer,
  duration_days integer not null default 30
);

-- 9) user_coupons ---------------------------------------------
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  is_used boolean not null default false,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- 10) orders --------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number varchar(100) unique not null,
  user_id uuid references public.users(id) on delete set null,
  order_type varchar(20) not null default 'MEMBER',   -- MEMBER / NON_MEMBER
  non_member_password varchar(255),
  buyer_name varchar(100) not null,
  buyer_phone varchar(50),
  recipient_name varchar(100) not null,
  recipient_phone varchar(50),
  recipient_zipcode varchar(10),
  recipient_address varchar(255),
  recipient_detail_address varchar(255),
  total_items_price integer not null default 0,
  discount_coupon integer not null default 0,
  discount_points integer not null default 0,
  delivery_fee integer not null default 3000,
  final_payment_price integer not null default 0,
  status varchar(50) not null default 'PENDING',
  refund_reason text,
  tracking_number varchar(100),
  created_at timestamptz not null default now()
);

-- 11) order_items ---------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1,
  price_per_item integer not null default 0
);

-- 12) reviews -------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title varchar(255),
  content text,
  review_image_url text,
  height_cm integer,
  weight_kg integer,
  size_bought varchar(20),
  created_at timestamptz not null default now()
);

-- 13) qna -----------------------------------------------------
create table if not exists public.qna (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  question_title varchar(255) not null,
  question_content text,
  is_secret boolean not null default false,
  is_answered boolean not null default false,
  answer_content text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

-- 14) faqs ----------------------------------------------------
create table if not exists public.faqs (
  id serial primary key,
  category varchar(50) not null,
  question varchar(255) not null,
  answer text not null
);

-- 15) restock_alerts ------------------------------------------
create table if not exists public.restock_alerts (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  is_notified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 16) verification_codes --------------------------------------
create table if not exists public.verification_codes (
  id bigserial primary key,
  target_value varchar(255) not null,
  code varchar(10) not null,
  expires_at timestamptz not null,
  is_verified boolean not null default false
);

-- 인덱스 -------------------------------------------------------
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_best on public.products(is_best);
create index if not exists idx_products_is_new on public.products(is_new);
create index if not exists idx_variants_product on public.product_variants(product_id);
create index if not exists idx_images_product on public.product_images(product_id);
create index if not exists idx_cart_user on public.cart_items(user_id);
create index if not exists idx_cart_session on public.cart_items(session_id);
create index if not exists idx_wish_user on public.wishlist_items(user_id);
create index if not exists idx_wish_session on public.wishlist_items(session_id);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_qna_product on public.qna(product_id);

-- 찜 카운트 동기화 트리거 ------------------------------------
create or replace function public.sync_wish_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.products set wish_count = wish_count + 1 where id = new.product_id;
  elsif (tg_op = 'DELETE') then
    update public.products set wish_count = greatest(wish_count - 1, 0) where id = old.product_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_wishlist_count on public.wishlist_items;
create trigger trg_wishlist_count
after insert or delete on public.wishlist_items
for each row execute function public.sync_wish_count();

-- ============================================================
-- RLS: 데모용 — anon/authenticated 전체 허용 정책
-- (실서비스에서는 반드시 세분화 필요)
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array[
    'users','social_accounts','products','product_images','product_variants',
    'cart_items','wishlist_items','coupons','user_coupons','orders','order_items',
    'reviews','qna','faqs','restock_alerts','verification_codes','health_check'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists demo_all on public.%I;', t);
    execute format('create policy demo_all on public.%I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;
