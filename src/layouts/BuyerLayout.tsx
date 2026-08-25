import { Outlet } from 'react-router-dom';
import { SearchBar } from '@/components';

export default function BuyerLayout() {
  return (
    <>
      <SearchBar />
      <Outlet />
    </>
  );
}
