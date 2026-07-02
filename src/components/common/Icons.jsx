// 인라인 SVG 아이콘 (stroke=currentColor, 24px 기준)
const s = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const SearchIcon = (p) => (<svg {...s} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>);
export const UserIcon = (p) => (<svg {...s} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></svg>);
export const CartIcon = (p) => (<svg {...s} {...p}><path d="M5 6h15l-1.5 9.5a2 2 0 0 1-2 1.7H9a2 2 0 0 1-2-1.7L5 4H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></svg>);
export const ChatIcon = (p) => (<svg {...s} {...p}><path d="M4 5h16v11H8l-4 4V5Z" /><path d="M8 10h8M8 13h5" /></svg>);
export const CloseIcon = (p) => (<svg {...s} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const ArrowRight = (p) => (<svg {...s} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ChevronLeft = (p) => (<svg {...s} {...p}><path d="M15 6l-6 6 6 6" /></svg>);
export const ChevronRight = (p) => (<svg {...s} {...p}><path d="M9 6l6 6-6 6" /></svg>);
export const ChevronDown = (p) => (<svg {...s} {...p}><path d="M6 9l6 6 6-6" /></svg>);
export const MinusIcon = (p) => (<svg {...s} {...p}><path d="M5 12h14" /></svg>);
export const PlusIcon = (p) => (<svg {...s} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const CheckIcon = (p) => (<svg {...s} {...p}><path d="M20 6 9 17l-5-5" /></svg>);
export const StarIcon = ({ filled, ...p }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
  </svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" {...p}>
    <path d="M12 20s-7-4.5-9.2-9C1.3 8 2.6 5 5.6 5 7.6 5 9 6.3 12 9c3-2.7 4.4-4 6.4-4 3 0 4.3 3 2.8 6-2.2 4.5-9.2 9-9.2 9Z" />
  </svg>
);
export const DumbbellIcon = (p) => (<svg {...s} {...p}><path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" /></svg>);
