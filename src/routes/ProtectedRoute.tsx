import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

type Props = {
  allowedRoles?: string[];
  allowGuest?: boolean;
};

const ProtectedRoute = ({ allowedRoles = [], allowGuest = false }: Props) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return allowGuest ? <Outlet /> : <Navigate to='/buyer/login' replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role[0])) {
    return <Navigate to='/forbidden' replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
