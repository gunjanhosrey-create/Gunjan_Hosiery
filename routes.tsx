import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import AddressPage from './pages/AddressPage';
import WhatsAppOrderPage from './pages/WhatsAppOrderPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import B2BDashboardPage from './pages/B2BDashboardPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    name: 'Products',
    path: '/products',
    element: <ProductsPage />,
  },
  {
    name: 'Product Detail',
    path: '/products/:slug',
    element: <ProductDetailPage />,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <CartPage />,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: <CheckoutPage />,
  },
  {
    name: 'About',
    path: '/about',
    element: <AboutPage />,
  },
  {
    name: 'Address',
    path: '/address',
    element: <AddressPage />,
  },
  {
    name: 'WhatsApp Order',
    path: '/whatsapp-order',
    element: <WhatsAppOrderPage />,
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <ContactPage />,
  },
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
  },
  {
    name: 'B2B Dashboard',
    path: '/b2b-dashboard',
    element: <B2BDashboardPage />,
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    name: 'Account',
    path: '/account',
    element: <ProfilePage />,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
  },
];

export default routes;
