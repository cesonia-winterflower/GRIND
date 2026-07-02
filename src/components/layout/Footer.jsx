import { Link } from 'react-router-dom';
import { DumbbellIcon } from '../common/Icons';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="gf fullbleed">
      <div className="container gf__top">
        <div className="gf__brand">
          <div className="gf__logo"><span>GR</span><DumbbellIcon width={20} height={20} /><span>ND</span></div>
          <p className="gf__slogan">RISE &amp; GRIND — 매일, 조금씩</p>
          <div className="gf__sns">
            <a href="#" aria-label="instagram">IG</a>
            <a href="#" aria-label="youtube">YT</a>
            <a href="#" aria-label="x">X</a>
          </div>
        </div>

        <div className="gf__col">
          <h4>SHOP</h4>
          <Link to="/category/TOP">상의</Link>
          <Link to="/category/BOTTOM">하의</Link>
          <Link to="/category/OUTER">아우터</Link>
          <Link to="/category/SET">세트</Link>
          <Link to="/category/ACCESSORY">용품</Link>
        </div>

        <div className="gf__col">
          <h4>CUSTOMER</h4>
          <Link to="/login">주문조회</Link>
          <Link to="/mypage">Q&amp;A</Link>
          <a href="#">공지사항</a>
          <a href="#">매장안내</a>
        </div>

        <div className="gf__col gf__news">
          <h4>NEWSLETTER</h4>
          <p>GRIND 소식과 쿠폰을 받아보세요.</p>
          <div className="gf__newsrow">
            <input className="gf__newsinput" placeholder="이메일 주소" />
            <button className="gf__newsbtn">구독</button>
          </div>
        </div>
      </div>

      <div className="container gf__info">
        <div className="gf__links">
          <a href="#">회사소개</a><a href="#">이용안내</a>
          <a href="#" className="gf__strong">개인정보처리방침</a><a href="#">이용약관</a>
        </div>
        <p>상호 (주)그라인드 · 대표 ○○○ · 통신판매신고 2026-서울-0000 · 사업자등록번호 000-00-00000 · 개인정보보호책임자 ○○○ · help@grind.com</p>
        <p>고객센터 1577-0000 · CS 월–금 10:00~18:00 (공휴일 휴무) · © 2026 GRIND ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
