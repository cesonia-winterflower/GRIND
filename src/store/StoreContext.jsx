import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredUser, signOut as apiSignOut, cartCount, fetchWishlistProductIds, toggleWishlist } from '../lib/api';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [cartQty, setCartQty] = useState(0);
  const [wishIds, setWishIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  const refreshCartCount = useCallback(async () => {
    try { setCartQty(await cartCount(user)); } catch { /* noop */ }
  }, [user]);

  const refreshWishlist = useCallback(async () => {
    try { setWishIds(await fetchWishlistProductIds(user)); } catch { /* noop */ }
  }, [user]);

  useEffect(() => { refreshCartCount(); refreshWishlist(); }, [refreshCartCount, refreshWishlist]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const logout = useCallback(() => { apiSignOut(); setUser(null); }, []);

  const toggleWish = useCallback(async (productId) => {
    const on = !wishIds.has(productId);
    setWishIds((prev) => {
      const next = new Set(prev);
      on ? next.add(productId) : next.delete(productId);
      return next;
    });
    try {
      await toggleWishlist(user, productId, on);
      showToast(on ? '찜 목록에 추가했어요' : '찜을 해제했어요');
    } catch { refreshWishlist(); }
  }, [wishIds, user, showToast, refreshWishlist]);

  const value = {
    user, setUser, logout,
    cartQty, refreshCartCount,
    wishIds, toggleWish, refreshWishlist,
    showToast, toast,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
