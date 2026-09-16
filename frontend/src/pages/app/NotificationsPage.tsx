import { useState, useEffect } from 'react';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedList';
import {
  Bell,
  CheckCheck,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification,
} from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToNotifications(
      currentUser.uid,
      (data) => {
        setNotifications(data);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Error listening to notifications:', err);
        setError('Unable to sync notifications right now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkAll = async () => {
    await markAllNotificationsAsRead(notifications);
  };

  const handleClick = async (notif: AppNotification) => {
    if (!notif.read && notif.id) {
      await markNotificationAsRead(notif.id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request_received':
        return <UserPlus className="w-5 h-5 text-blue-accent" />;
      case 'request_accepted':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'request_rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageTransition className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-accent text-navy-900">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time updates on team invites, applications, and hackathon milestones
          </p>
        </div>

        {unreadCount > 0 && (
          <MotionButton
            onClick={handleMarkAll}
            variant="secondary"
            size="sm"
            className="gap-2 shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-blue-accent" />
            <span>Mark All as Read</span>
          </MotionButton>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-navy-800/40 rounded-2xl border border-navy-700/60 p-8">
          <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">All caught up!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You don't have any notifications right now. Activity from teammates and teams will appear here.
          </p>
        </div>
      ) : (
        <AnimatedList className="space-y-3">
          {notifications.map((notif, index) => (
            <AnimatedListItem key={notif.id || index} index={index}>
              <Link
                to={notif.link || '/app/my-team'}
                onClick={() => handleClick(notif)}
                className="block"
              >
                <MotionCard
                  interactive={true}
                  className={`p-4 md:p-5 flex items-start justify-between gap-4 transition-all ${
                    !notif.read
                      ? 'bg-navy-800 border-blue-accent/40 shadow-[0_0_15px_rgba(100,255,218,0.08)]'
                      : 'bg-navy-800/60 border-navy-700/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm md:text-base font-bold text-white">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-accent animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-accent transition-colors" />
                  </div>
                </MotionCard>
              </Link>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      )}
    </PageTransition>
  );
}
