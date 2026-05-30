import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import Toast from './components/ui/Toast.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Bookings from './pages/Bookings.jsx';
import BookingDetail from './pages/BookingDetail.jsx';
import Profile from './pages/Profile.jsx';
import Payments from './pages/Payments.jsx';
import Documents from './pages/Documents.jsx';
import Analytics from './pages/Analytics.jsx';
import Loyalty from './pages/Loyalty.jsx';
import Notifications from './pages/Notifications.jsx';
import Support from './pages/Support.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import AdminBookingDetail from './pages/AdminBookingDetail.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/bookings" replace />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/support" element={<Support />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/bookings/:id" element={<AdminBookingDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/bookings" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toast />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
