import { BuyerLayout, MainLayout, RootLayout } from '@/layouts';
import { AllCategories, Category, Home, ProductDetail, SearchResult, Shop } from '@/pages';
import ProtectedRoute from './ProtectedRoute';

export const guestRoutes = {
  path: '/',
  element: <ProtectedRoute allowedRoles={['buyer']} allowGuest={true} />,
  children: [
    {
      element: <RootLayout />,
      children: [
        {
          element: <BuyerLayout />,
          children: [
            {
              element: <MainLayout />,
              children: [
                { index: true, element: <Home /> },
                { path: 'product/:id', element: <ProductDetail /> },
                { path: 'products/search', element: <SearchResult /> },
                { path: ':slug', element: <Category /> },
                { path: 'all-categories', element: <AllCategories /> },
                { path: 'shop/:id', element: <Shop /> },
              ],
            },
          ],
        },
      ],
    },
  ],
};
