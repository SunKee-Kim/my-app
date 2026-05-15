import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSession } from '../utils/auth';

export default function RequireAuth() {
  const session = getSession();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
