import { Cart, Checkout } from '@/pages';
import ProtectedRoute from './ProtectedRoute';
import { RootLayout } from '@/layouts';

export const buyerRoutes = {
  path: '/',
  element: <ProtectedRoute allowedRoles={['buyer']} allowGuest={false} />,
  children: [
    {
      element: <RootLayout />,
      children: [
        {
          path: 'cart',
          element: <Cart />,
        },
        {
          path: 'checkout',
          element: <Checkout />,
        },
      ],
    },
  ],
};
