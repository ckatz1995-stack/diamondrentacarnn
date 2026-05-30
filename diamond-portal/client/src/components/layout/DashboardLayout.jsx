import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../api/client.js';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '🏠', label: 'Αρχική' },
  { to: '/bookings', icon: '📋', label: 'Κρατήσεις' },
  { to: '/analytics', icon: '📊', label: 'Ανάλυση' },
  { to: '/payments', icon: '💳', label: 'Πληρωμές' },
  { to: '/loyalty', icon: '🏆', label: 'Loyalty' },
  { to: '/notifications', icon: '🔔', label: 'Ειδοποιήσεις' },
  { to: '/documents', icon: '📄', label: 'Έγγραφα' },
  { to: '/support', icon: '🎧', label: 'Υποστήριξη' },
  { to: '/profile', icon: '👤', label: 'Προφίλ' },
];

const MOBILE_NAV = [
  { to: '/dashboard', icon: '🏠', label: 'Αρχική' },
  { to: '/bookings', icon: '📋', label: 'Κρατήσεις' },
  { to: '/loyalty', icon: '🏆', label: 'Loyalty' },
  { to: '/notifications', icon: '🔔', label: 'Ειδοποιήσεις' },
  { to: '/profile', icon: '👤', label: 'Προφίλ' },
];

function initials(u) {
  if (!u) return '?';
  return ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || u.email?.[0]?.toUpperCase() || '?';
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications?unreadOnly=true&limit=1');
      if (data.ok) setUnreadCount(data.total || 0);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-gray-900 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-brand-dark dark:bg-gray-950 z-40 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-dark font-black text-lg">◆</div>
            <div>
              <div className="text-white font-black text-sm leading-none">Diamond</div>
              <div className="text-brand-gold text-xs font-medium">Rent A Car</div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-teal flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials(user)}
            </div>
            <div className="min-w-0">
              <div className="text-white text-sm font-semibold truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}
              </div>
              <div className="text-gray-400 text-xs truncate">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-teal text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-2 ${
                  isActive
                    ? 'bg-brand-gold text-brand-dark shadow-sm'
                    : 'text-brand-gold hover:bg-brand-gold/10'
                }`
              }
            >
              <span className="text-base w-5 text-center">⚙️</span>
              <span>Διαχείριση</span>
            </NavLink>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            <span>{darkMode ? 'Φωτεινό θέμα' : 'Σκοτεινό θέμα'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <span>🚪</span>
            <span>Αποσύνδεση</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Left: hamburger + logo (mobile) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Άνοιγμα μενού"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-gold rounded-lg flex items-center justify-center text-brand-dark font-black text-sm">◆</div>
                <span className="font-black text-brand-dark dark:text-white text-sm">Diamond</span>
              </div>
            </div>

            {/* Right: dark mode, notifications, user */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Dark mode toggle (desktop) */}
              <button
                onClick={() => setDarkMode(d => !d)}
                className="hidden lg:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Εναλλαγή θέματος"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>

              {/* Notification bell */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Ειδοποιήσεις"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User avatar menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-white text-sm font-bold">
                    {initials(user)}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                    {user?.firstName || user?.email?.split('@')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Χρήστης'}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>👤</span> Προφίλ
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-brand-gold hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <span>⚙️</span> Διαχείριση
                        </button>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <span>🚪</span> Αποσύνδεση
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex lg:hidden safe-area-pb">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-teal' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-lg relative">
              {item.icon}
              {item.to === '/notifications' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none font-bold" style={{ fontSize: '9px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className="truncate max-w-full px-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
