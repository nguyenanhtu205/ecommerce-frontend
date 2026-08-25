import { Register, Login, SellerRegister, SellerLogin, GoogleCallbackPage } from '@/pages';

export const authRoutes = {
  path: '/buyer',
  children: [
    {
      path: 'register',
      element: <Register />,
    },
    {
      path: 'login',
      element: <Login />,
    },
  ],
};

export const sellerAuthRoutes = {
  path: '/seller',
  children: [
    {
      path: 'register',
      element: <SellerRegister />,
    },
    {
      path: 'login',
      element: <SellerLogin />,
    },
  ],
};

export const googleAuthCallbackRoute = {
  path: '/auth/google/callback',
  element: <GoogleCallbackPage />,
};
