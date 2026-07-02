import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PromoBanner from './PromoBanner';
import Header from './Header';
import Footer from './Footer';
import Floating from './Floating';
import MobileNotice from './MobileNotice';
import Toast from '../common/Toast';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <PromoBanner />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Floating />
      <MobileNotice />
      <Toast />
    </>
  );
}
