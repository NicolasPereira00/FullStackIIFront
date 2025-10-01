import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function CustomerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CUSTOMER') return <div style={{padding:16}}>Acesso restrito a CUSTOMER.</div>;
  return children;
}

export function SellerOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'SELLER') return <div style={{padding:16}}>Acesso restrito a SELLER.</div>;
  return children;
}
