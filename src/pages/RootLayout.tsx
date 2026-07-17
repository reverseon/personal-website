import { Outlet } from '@tanstack/react-router';
import { Footer } from '../components/Footer';
import { FloatingBackToTop } from '../components/FloatingBackToTop';

export const RootLayout = () => {
  return (
    <>
      <Outlet />
      <Footer />
      <FloatingBackToTop />
    </>
  );
};
