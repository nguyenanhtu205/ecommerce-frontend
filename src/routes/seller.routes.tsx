import {
  ShopOnboarding,
  SellerDashboard,
  ShopSettings,
  AddProduct,
  OrderList,
  ProductList,
  ShopProfile,
  Revenue,
  AccountBalance,
  ChatManagement,
  ReviewManagement,
} from '@/pages';
import { SellerLayout } from '@/layouts';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute.tsx';

export const sellerRoutes = {
  path: '/seller',
  element: <ProtectedRoute allowedRoles={['seller']} allowGuest={false} />,
  children: [
    { path: 'onboarding', element: <ShopOnboarding /> },
    { path: '/seller/products/new', element: <AddProduct /> },
    {
      element: <SellerLayout />,
      children: [
        {
          index: true,
          element: <SellerDashboard />,
        },
        { path: 'shop/settings', element: <Navigate to='account-security' replace /> },
        { path: 'shop/settings/:tab', element: <ShopSettings /> },
        { path: 'orders/:status', element: <OrderList /> },
        { path: 'products/all', element: <ProductList /> },
        { path: 'shop/profile', element: <ShopProfile /> },
        { path: 'finance/revenue', element: <Revenue /> },
        { path: 'finance/balance', element: <AccountBalance /> },
        { path: 'customer-service/chat', element: <ChatManagement /> },
        { path: 'customer-service/reviews', element: <ReviewManagement /> },
      ],
    },
  ],
};
