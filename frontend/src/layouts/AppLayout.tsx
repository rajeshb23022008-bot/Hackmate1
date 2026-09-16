import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Users,
  Trophy,
  Bell,
  User,
  LogOut,
  Sparkles,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { subscribeToNotifications, type AppNotification } from '../services/firestoreService';
import CreateTeamModal from '../components/team/CreateTeamModal';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = subscribeToNotifications(currentUser.uid, (data: AppNotification[]) => {
      const count = data.filter((n) => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const navItems = [
    { name: 'Dashboard', path: '/app', icon: Home, mobile: true },
    { name: 'Find Teammates', path: '/app/teammates', icon: Search, mobile: true },
    { name: 'Find Teams', path: '/app/teams', icon: Users, mobile: true },
    { name: 'My Team', path: '/app/my-team', icon: Trophy, mobile: true },
    { name: 'Notifications', path: '/app/notifications', icon: Bell, mobile: true, badge: unreadCount },
    { name: 'Profile', path: '/app/profile', icon: User, mobile: false },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    navigate('/login');
  };

  const displayName =
    userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Hacker';
  const displayEmail = userProfile?.email || currentUser?.email || '';

  return (
    <div className="min-h-screen bg-navy-900 text-slate-300 font-sans flex flex-col md:flex-row antialiased selection:bg-blue-accent/30 selection:text-blue-accent">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-800/95 backdrop-blur-md border-r border-navy-700/80 h-screen sticky top-0 shrink-0 z-30">
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              HACK<span className="text-blue-accent">MATE</span>
            </span>
          </Link>
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="mx-4 mb-3 p-3 bg-navy-900/80 border border-navy-700/60 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 flex items-center justify-center text-navy-900 font-bold text-sm shrink-0 shadow-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{displayName}</div>
            <div className="text-[10px] text-slate-400 truncate">{displayEmail}</div>
          </div>
        </div>

        {/* Quick Action: Create Team */}
        <div className="px-4 mb-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-accent/10 border border-blue-accent/30 text-blue-accent hover:bg-blue-accent hover:text-navy-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Create Team</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path));

            return (
              <Link key={item.name} to={item.path} className="block">
                <motion.div
                  whileHover={{ scale: 1.015, x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ duration: 0.15 }}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors will-change-transform',
                    isActive
                      ? 'bg-navy-700 text-white font-semibold shadow-sm border border-navy-600/50'
                      : 'text-slate-400 hover:text-white hover:bg-navy-700/40'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive ? 'text-blue-accent' : 'text-slate-400'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-accent text-navy-900 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-700/70">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 px-3 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </motion.button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-navy-800/90 backdrop-blur-md border-b border-navy-700/80 sticky top-0 z-40">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              HACK<span className="text-blue-accent">MATE</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-accent text-navy-900 text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Team</span>
            </button>
            <Link to="/app/notifications" className="relative">
              <button
                className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-slate-300 hover:text-white"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-accent text-navy-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-slate-300 hover:text-red-400"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-800/95 backdrop-blur-lg border-t border-navy-700 flex items-center justify-around p-2 pb-[env(safe-area-inset-bottom,8px)] z-50 shadow-2xl">
        {navItems
          .filter((item) => item.mobile)
          .map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/app' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center gap-1 p-1.5 min-w-[56px] rounded-lg transition-colors relative',
                  isActive ? 'text-blue-accent' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-accent" />
                  )}
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {item.name}
                </span>
              </Link>
            );
          })}
      </nav>

      {/* Global Create Team Modal */}
      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => navigate('/app/my-team')}
      />
    </div>
  );
}
