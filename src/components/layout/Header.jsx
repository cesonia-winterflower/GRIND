import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { SearchIcon, UserIcon, CartIcon, HeartIcon, CloseIcon, DumbbellIcon } from '../common/Icons';
import { useStore } from '../../store/StoreContext';
import { searchProducts } from '../../lib/api';
import './Header.css';

const NAV = [
  { label: 'BEST', to: '/products?best=1' },
  { label: 'TOP', to: '/category/TOP' },
  { label: 'BOTTOM', to: '/category/BOTTOM' },
  { label: 'OUTER', to: '/category/OUTER' },
  { label: 'SET', to: '/category/SET' },
  { label: 'SALE', to: '/products?sale=1', sale: true },
];

const MEGA = {
  TOP: ['반팔', '긴팔', '탱크탑', '후드/맨투맨', '컴프레션'],
  BOTTOM: ['쇼츠', '조거팬츠', '레깅스', '트레이닝팬츠', '스웻팬츠'],
  OUTER: ['바람막이', '플리스', '트랙탑', '베스트'],
  SET: ['트레이닝 세트', '세트업', '투피스'],
};

export default function Header() {
  const { cartQty, user } = useStore();
  const nav = useNavigate();
  const [openMega, setOpenMega] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [kw, setKw] = useState('');
  const [sugs, setSugs] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    if (!kw.trim()) { setSugs([]); return; }
    let alive = true;
    const t = setTimeout(async () => {
      const r = await searchProducts(kw);
      if (alive) setSugs(r);
    }, 180);
    return () => { alive = false; clearTimeout(t); };
  }, [kw]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!kw.trim()) return;
    setSearchOpen(false);
    nav(`/products?q=${encodeURIComponent(kw.trim())}`);
  };

  return (
    <>
      <header className="gh fullbleed" onMouseLeave={() => setOpenMega(null)}>
        <div className="gh__inner container">
          <Link to="/" className="gh__logo" aria-label="GRIND 홈">
            <span>GR</span><DumbbellIcon width={22} height={22} className="gh__logo-dumbbell" /><span>ND</span>
          </Link>

          <nav className="gh__nav">
            {NAV.map((n) => (
              <div key={n.label} className="gh__navitem"
                onMouseEnter={() => setOpenMega(MEGA[n.label] ? n.label : null)}>
                <NavLink to={n.to} className={({ isActive }) => `t-gnb gh__link ${n.sale ? 'is-sale' : ''} ${isActive ? 'is-active' : ''}`}>
                  {n.label}
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="gh__icons">
            <button aria-label="검색" onClick={() => setSearchOpen(true)}><SearchIcon /></button>
            <Link to="/mypage" aria-label="마이페이지"><UserIcon /></Link>
            <Link to="/mypage?tab=wish" aria-label="찜"><HeartIcon /></Link>
            <Link to="/cart" aria-label="장바구니" className="gh__cart">
              <CartIcon />
              {cartQty > 0 && <span className="gh__cartbadge">{cartQty}</span>}
            </Link>
          </div>
        </div>

        {openMega && MEGA[openMega] && (
          <div className="gh__mega fullbleed" onMouseLeave={() => setOpenMega(null)}>
            <div className="container gh__mega-inner">
              <div className="gh__mega-title t-gnb">{openMega}</div>
              <ul className="gh__mega-list">
                {MEGA[openMega].map((s) => (
                  <li key={s}><Link to={`/category/${openMega}`}>{s}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="gh__search-overlay fullbleed">
          <div className="container gh__search-inner">
            <form onSubmit={submitSearch} className="gh__search-form">
              <SearchIcon width={22} height={22} />
              <input ref={inputRef} className="gh__search-input" value={kw} onChange={(e) => setKw(e.target.value)}
                placeholder="상품명을 검색하세요 (예: 반팔, 조거, 세트)" />
              <button type="button" aria-label="검색 닫기" onClick={() => setSearchOpen(false)}><CloseIcon /></button>
            </form>
            {sugs.length > 0 && (
              <ul className="gh__sugs">
                {sugs.map((s) => (
                  <li key={s.id}><Link to={`/products/${s.id}`} onClick={() => setSearchOpen(false)}>
                    <span className="gh__sug-cat">{s.category}</span>{s.name}
                    <span className="gh__sug-price">{s.sale_price.toLocaleString()}원</span>
                  </Link></li>
                ))}
              </ul>
            )}
          </div>
          <div className="gh__search-dim" onClick={() => setSearchOpen(false)} />
        </div>
      )}
    </>
  );
}
