import { supabase } from './supabase';
import { getSessionId, hashPassword } from './session';

/* ============================ 상품 ============================ */
export async function fetchProducts({ category, isBest, isNew, sort, limit, ids } = {}) {
  let q = supabase.from('products').select('*').eq('is_displayed', true);
  if (category && category !== 'ALL') q = q.eq('category', category);
  if (isBest) q = q.eq('is_best', true);
  if (isNew) q = q.eq('is_new', true);
  if (ids) q = q.in('id', ids);
  if (sort === 'price_asc') q = q.order('sale_price', { ascending: true });
  else if (sort === 'price_desc') q = q.order('sale_price', { ascending: false });
  else if (sort === 'review') q = q.order('review_count', { ascending: false });
  else q = q.order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function fetchProductsWithMain(opts) {
  const products = await fetchProducts(opts);
  if (!products.length) return [];
  const ids = products.map((p) => p.id);
  const { data: imgs } = await supabase
    .from('product_images')
    .select('product_id,image_url,is_main,sort_order')
    .in('product_id', ids)
    .order('sort_order', { ascending: true });
  const byProd = {};
  (imgs || []).forEach((im) => {
    (byProd[im.product_id] ||= []).push(im);
  });
  return products.map((p) => {
    const list = byProd[p.id] || [];
    const main = list.find((i) => i.is_main) || list[0];
    return { ...p, mainImage: main?.image_url, hoverImage: list[1]?.image_url || main?.image_url, images: list };
  });
}

// 상품 카드용 색상/품절 요약
export async function enrichWithVariants(products) {
  if (!products?.length) return products || [];
  const ids = products.map((p) => p.id);
  const { data } = await supabase.from('product_variants').select('product_id,color,stock').in('product_id', ids);
  const map = {};
  (data || []).forEach((v) => {
    const m = (map[v.product_id] ||= { colors: [], sizes: [], stockSum: 0 });
    if (!m.colors.includes(v.color)) m.colors.push(v.color);
    if (!m.sizes.includes(v.size)) m.sizes.push(v.size);
    m.stockSum += v.stock;
  });
  return products.map((p) => ({ ...p, colors: map[p.id]?.colors || [], sizes: map[p.id]?.sizes || [], soldout: (map[p.id]?.stockSum ?? 1) === 0 }));
}

export async function fetchProductDetail(id) {
  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  const [{ data: images }, { data: variants }, { data: reviews }, { data: qna }] = await Promise.all([
    supabase.from('product_images').select('*').eq('product_id', id).order('sort_order'),
    supabase.from('product_variants').select('*').eq('product_id', id).order('color'),
    supabase.from('reviews').select('*').eq('product_id', id).order('created_at', { ascending: false }),
    supabase.from('qna').select('*').eq('product_id', id).order('created_at', { ascending: false }),
  ]);
  return { product, images: images || [], variants: variants || [], reviews: reviews || [], qna: qna || [] };
}

export async function fetchReviewsWithFit(limit = 8) {
  const { data } = await supabase
    .from('reviews')
    .select('*, products(name)')
    .not('height_cm', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

export async function fetchFaqs() {
  const { data } = await supabase.from('faqs').select('*').order('id');
  return data || [];
}

/* ============================ 인증(커스텀) ============================ */
const AUTH_KEY = 'grind_user';
export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}
function storeUser(u) {
  if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  else localStorage.removeItem(AUTH_KEY);
}

export async function signUp(form) {
  const { data: exists } = await supabase.from('users').select('id').eq('email', form.email).maybeSingle();
  if (exists) throw new Error('이미 가입된 이메일입니다.');
  const password_hash = await hashPassword(form.password);
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: form.email, password_hash, name: form.name, phone: form.phone,
      zipcode: form.zipcode, base_address: form.base_address, detail_address: form.detail_address,
      gender: form.gender, birth_date: form.birth_date || null,
    })
    .select('*').single();
  if (error) throw error;
  // 가입 축하 쿠폰 자동 발급 (GRIND_WELCOME)
  await issueWelcomeCoupon(data.id);
  await mergeGuestData(data.id);
  const { password_hash: _, ...safe } = data;
  storeUser(safe);
  return safe;
}

export async function signIn(email, password) {
  const password_hash = await hashPassword(password);
  const { data, error } = await supabase
    .from('users').select('*').eq('email', email).maybeSingle();
  if (error) throw error;
  if (!data || data.password_hash !== password_hash) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  await mergeGuestData(data.id);
  const { password_hash: _, ...safe } = data;
  storeUser(safe);
  return safe;
}

export function signOut() { storeUser(null); }

async function issueWelcomeCoupon(userId) {
  const { data: coupon } = await supabase.from('coupons').select('*').eq('code', 'GRIND_WELCOME').maybeSingle();
  if (!coupon) return;
  const expires = new Date(Date.now() + coupon.duration_days * 86400000).toISOString();
  await supabase.from('user_coupons').insert({ user_id: userId, coupon_id: coupon.id, expires_at: expires });
}

// 비회원 → 회원 병합 (cart_items / wishlist_items의 session_id → user_id)
export async function mergeGuestData(userId) {
  const sid = getSessionId();
  await supabase.from('cart_items').update({ user_id: userId, session_id: null }).eq('session_id', sid);
  await supabase.from('wishlist_items').update({ user_id: userId, session_id: null }).eq('session_id', sid);
}

/* ============================ 장바구니 ============================ */
function ownerFilter(user) {
  return user ? { col: 'user_id', val: user.id } : { col: 'session_id', val: getSessionId() };
}

export async function fetchCart(user) {
  const { col, val } = ownerFilter(user);
  const { data } = await supabase
    .from('cart_items')
    .select('*, product_variants(*, products(*, product_images(image_url,is_main)))')
    .eq(col, val)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function addToCart(user, variantId, quantity = 1) {
  const { col, val } = ownerFilter(user);
  const { data: existing } = await supabase
    .from('cart_items').select('*').eq(col, val).eq('variant_id', variantId).maybeSingle();
  if (existing) {
    const { data } = await supabase.from('cart_items')
      .update({ quantity: existing.quantity + quantity }).eq('id', existing.id).select().single();
    return data;
  }
  const row = { variant_id: variantId, quantity };
  row[col] = val;
  const { data, error } = await supabase.from('cart_items').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function updateCartQty(id, quantity) {
  await supabase.from('cart_items').update({ quantity }).eq('id', id);
}
export async function removeCartItems(ids) {
  await supabase.from('cart_items').delete().in('id', ids);
}
export async function cartCount(user) {
  const { col, val } = ownerFilter(user);
  const { count } = await supabase.from('cart_items').select('id', { count: 'exact', head: true }).eq(col, val);
  return count || 0;
}

/* ============================ 찜 ============================ */
export async function fetchWishlist(user) {
  const { col, val } = ownerFilter(user);
  const { data } = await supabase
    .from('wishlist_items')
    .select('*, products(*, product_images(image_url,is_main))')
    .eq(col, val)
    .order('created_at', { ascending: false });
  return data || [];
}
export async function fetchWishlistProductIds(user) {
  const { col, val } = ownerFilter(user);
  const { data } = await supabase.from('wishlist_items').select('product_id').eq(col, val);
  return new Set((data || []).map((w) => w.product_id));
}
export async function toggleWishlist(user, productId, on) {
  const { col, val } = ownerFilter(user);
  if (on) {
    const row = { product_id: productId };
    row[col] = val;
    await supabase.from('wishlist_items').insert(row);
  } else {
    await supabase.from('wishlist_items').delete().eq(col, val).eq('product_id', productId);
  }
}

/* ============================ 쿠폰 ============================ */
export async function fetchUserCoupons(user) {
  if (!user) return [];
  const { data } = await supabase
    .from('user_coupons').select('*, coupons(*)').eq('user_id', user.id).eq('is_used', false);
  return data || [];
}

/* ============================ 주문 ============================ */
export function genOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 9).toUpperCase();
  return `${ymd}-${rand}`;
}

export async function createOrder({ user, cartRows, form, discountCoupon = 0, discountPoints = 0 }) {
  const itemsPrice = cartRows.reduce((s, r) => s + (r.product_variants?.products?.sale_price || 0) * r.quantity, 0);
  const deliveryFee = itemsPrice >= 30000 ? 0 : 3000;
  const finalPrice = Math.max(0, itemsPrice - discountCoupon - discountPoints) + deliveryFee;
  const order_number = genOrderNumber();
  const { data: order, error } = await supabase.from('orders').insert({
    order_number,
    user_id: user?.id || null,
    order_type: user ? 'MEMBER' : 'NON_MEMBER',
    non_member_password: form.non_member_password ? await hashPassword(form.non_member_password) : null,
    buyer_name: form.buyer_name, buyer_phone: form.buyer_phone,
    recipient_name: form.recipient_name, recipient_phone: form.recipient_phone,
    recipient_zipcode: form.recipient_zipcode, recipient_address: form.recipient_address,
    recipient_detail_address: form.recipient_detail_address,
    total_items_price: itemsPrice, discount_coupon: discountCoupon, discount_points: discountPoints,
    delivery_fee: deliveryFee, final_payment_price: finalPrice, status: 'PAID',
  }).select().single();
  if (error) throw error;

  const orderItems = cartRows.map((r) => ({
    order_id: order.id, variant_id: r.variant_id, quantity: r.quantity,
    price_per_item: r.product_variants?.products?.sale_price || 0,
  }));
  await supabase.from('order_items').insert(orderItems);

  // 재고 차감
  for (const r of cartRows) {
    const cur = r.product_variants?.stock ?? 0;
    await supabase.from('product_variants').update({ stock: Math.max(0, cur - r.quantity) }).eq('id', r.variant_id);
  }
  // 장바구니 비우기
  await removeCartItems(cartRows.map((r) => r.id));
  return order;
}

export async function fetchOrders(user) {
  if (!user) return [];
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*, product_variants(*, products(name, product_images(image_url,is_main))))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function findGuestOrder({ buyer_name, order_number, password }) {
  const { data } = await supabase.from('orders').select('*').eq('order_number', order_number).maybeSingle();
  if (!data) throw new Error('주문을 찾을 수 없습니다.');
  const ok = data.buyer_name === buyer_name &&
    (!data.non_member_password || data.non_member_password === (await hashPassword(password)));
  if (!ok) throw new Error('주문 정보가 일치하지 않습니다.');
  return data;
}

/* ============================ 리뷰/Q&A/재입고 ============================ */
export async function submitReview(row) {
  const { error } = await supabase.from('reviews').insert(row);
  if (error) throw error;
}
export async function submitQna(row) {
  const { error } = await supabase.from('qna').insert(row);
  if (error) throw error;
}
export async function requestRestock(user, variantId) {
  const row = { variant_id: variantId, user_id: user?.id || null };
  const { error } = await supabase.from('restock_alerts').insert(row);
  if (error) throw error;
}

/* ============================ 검색 ============================ */
export async function searchProducts(keyword) {
  if (!keyword?.trim()) return [];
  const { data } = await supabase
    .from('products').select('id,name,category,sale_price')
    .ilike('name', `%${keyword.trim()}%`).limit(8);
  return data || [];
}
