import { Navigate } from 'react-router-dom';
import { AccountLayout, BuyerLayout, RootLayout } from '@/layouts';
import {
  Profile,
  NotificationOrder,
  Promotion,
  Address,
  Payment,
  ChangePassword,
  Purchase,
  NotificationSystem,
  WriteReview,
} from '@/pages';
import ProtectedRoute from './ProtectedRoute';

export const accountRoutes = {
  path: '/user',
  element: <ProtectedRoute allowedRoles={['buyer']} allowGuest={false} />,
  children: [
    {
      element: <RootLayout />,
      children: [
        {
          element: <BuyerLayout />,
          children: [
            {
              element: <AccountLayout />,
              children: [
                { index: true, element: <Navigate to='account/profile' replace /> },
                {
                  path: 'notifications',
                  children: [
                    { index: true, element: <Navigate to='order' replace /> },
                    { path: 'order', element: <NotificationOrder /> },
                    { path: 'promotion', element: <Promotion /> },
                    { path: 'system', element: <NotificationSystem /> },
                  ],
                },
                {
                  path: 'account',
                  children: [
                    { index: true, element: <Navigate to='profile' replace /> },
                    { path: 'profile', element: <Profile /> },
                    { path: 'payment', element: <Payment /> },
                    { path: 'address', element: <Address /> },
                    { path: 'password', element: <ChangePassword /> },
                  ],
                },
                { path: 'purchase', element: <Navigate to='all' replace /> },
                { path: 'purchase/:orderId/review', element: <WriteReview /> },
                { path: 'purchase/:status', element: <Purchase /> },
                { path: 'vouchers', element: <div>Kho voucher</div> },
                { path: 'shopee-xu', element: <div>Shopee Xu</div> },
              ],
            },
          ],
        },
      ],
    },
  ],
};
