import { createBrowserRouter } from 'react-router-dom';
import { guestRoutes } from './guest.routes';
import { authRoutes, googleAuthCallbackRoute, sellerAuthRoutes } from './auth.routes';
import { accountRoutes } from './account.routes';
import { sellerRoutes } from './seller.routes';
import { buyerRoutes } from './buyer.routes';
import { Forbidden, NotFound } from '@/pages';

export const router = createBrowserRouter([
  guestRoutes,
  authRoutes,
  sellerAuthRoutes,
  googleAuthCallbackRoute,
  accountRoutes,
  sellerRoutes,
  buyerRoutes,
  {
    path: 'forbidden',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
