import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import ScrollToTop from '@/components/common/ScrollToTop';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';

import routes from './routes';

const AUTH_LAYOUT_ROUTES = new Set(['/login', '/reset-password']);

function AppShell() {
  const { pathname } = useLocation();
  const hideChrome = AUTH_LAYOUT_ROUTES.has(pathname);

  return (
    <>
      <IntersectObserver />
      <ScrollToTop />
      <FloatingWhatsApp />
      <div className="flex min-h-screen flex-col">
        {!hideChrome && <Header />}
        <main className="flex-grow">
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!hideChrome && <Footer />}
      </div>
      <Toaster />
    </>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <WishlistProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </WishlistProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
