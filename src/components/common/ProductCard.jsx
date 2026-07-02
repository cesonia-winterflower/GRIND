import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon } from './Icons';
import { useStore } from '../../store/StoreContext';
import { formatKRW } from '../../lib/session';
import './ProductCard.css';

const COLOR_HEX = {
  딥블랙: '#1a1a1a', 블랙: '#1a1a1a', 차콜: '#3a3d42', 애쉬그레이: '#9aa0a6', 그레이: '#8b9096',
  화이트: '#f2f2f2', 아이보리: '#efeade', 네이비: '#232b3d', 카키: '#6b6a4b', 볼트: '#c7f000',
};

export default function ProductCard({ product, rank, imgH = 416, cardW = 312, showCartBar = true }) {
  const { wishIds, toggleWish } = useStore();
  const nav = useNavigate();
  const [hover, setHover] = useState(false);
  const wished = wishIds.has(product.id);
  const colors = product.colors || [];
  const soldout = product.soldout;

  const go = () => nav(`/products/${product.id}`);

  return (
    <article
      className="pcard"
      style={{ width: cardW }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={go}
    >
      <div className="pcard__imgwrap" style={{ height: imgH }}>
        <img className="pcard__img" src={product.mainImage} alt={product.name} loading="lazy" />
        {product.hoverImage && (
          <img className={`pcard__img pcard__img--hover ${hover ? 'show' : ''}`} src={product.hoverImage} alt="" loading="lazy" />
        )}
        {soldout && <div className="pcard__soldout">SOLD OUT</div>}

        {rank && <span className="badge badge--rank pcard__rank">BEST {rank}</span>}
        {!rank && product.is_new && <span className="badge badge--new pcard__rank">NEW</span>}

        <button
          className={`pcard__heart ${wished ? 'is-on' : ''}`}
          aria-label="찜하기"
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
        >
          <HeartIcon filled={wished} width={18} height={18} />
        </button>

        {showCartBar && (
          <div className={`pcard__cartbar ${hover ? 'show' : ''}`} onClick={(e) => { e.stopPropagation(); go(); }}>
            옵션 선택하고 담기
          </div>
        )}
      </div>

      <div className="pcard__info">
        <span className="badge badge--soft pcard__tag">{product.badge_text || product.category}</span>
        <p className="pcard__name">{product.name}</p>
        <div className="pcard__price">
          {product.discount_rate > 0 && <span className="pcard__disc">{product.discount_rate}%</span>}
          <span className="pcard__sale">{formatKRW(product.sale_price)}</span>
          {product.discount_rate > 0 && <span className="pcard__origin">{formatKRW(product.original_price)}</span>}
        </div>
        <div className="pcard__meta">
          <span>★ {Number(product.rating_avg).toFixed(1)}</span>
          <span className="pcard__reviews">({(product.review_count || 0).toLocaleString()})</span>
          <span className="pcard__chips">
            {colors.slice(0, 4).map((c, i) => (
              <i key={i} className="pcard__chip" style={{ background: COLOR_HEX[c] || '#ccc' }} title={c} />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}
