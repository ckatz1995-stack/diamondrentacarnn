import { Navigate } from 'react-router-dom';

// Dashboard redirects to Bookings
export default function Dashboard() {
  return <Navigate to="/bookings" replace />;
}
