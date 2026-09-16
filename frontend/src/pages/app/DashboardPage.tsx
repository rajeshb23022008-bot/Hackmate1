import { useState, useEffect } from 'react';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { SwipeCarousel } from '../../components/ui/SwipeCarousel';
import { AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedList';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Users,
  Trophy,
  CheckCircle2,
  Bell,
  ArrowRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  subscribeUserTeams,
  subscribeToNotifications,
  type Team,
  type AppNotification,
} from '../../services/firestoreService';
import CreateTeamModal from '../../components/team/CreateTeamModal';

const mockTeammates = [
  {
    id: '1',
    name: 'Aarav Patel',
    role: 'Computer Vision & PyTorch',
    college: 'IIT Bombay',
    skills: ['PyTorch', 'YOLOv8', 'FastAPI', 'OpenCV'],
    matchScore: 97,
    status: 'Seeking Team',
    tag: 'Fills your ML gap',
  },
  {
    id: '2',
    name: 'Simran Kaur',
    role: 'Full-Stack & Cloud',
    college: 'IIIT Delhi',
    skills: ['Next.js', 'PostgreSQL', 'Docker', 'AWS'],
    matchScore: 94,
    status: 'Team Leader',
    tag: 'SIH Healthcare Track',
  },
  {
    id: '3',
    name: 'Devansh Roy',
    role: 'Product & UX Designer',
    college: 'NID Bengaluru',
    skills: ['Figma', 'UI Systems', 'Motion', 'Prototyping'],
    matchScore: 91,
    status: 'Solo Hacker',
    tag: 'Portfolio Verified',
  },
];

export default function DashboardPage() {
  const { userProfile, currentUser } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsubTeams = subscribeUserTeams(currentUser.uid, (data) => {
      setTeams(data);
    });
    const unsubNotifs = subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
    });
    return () => {
      unsubTeams();
      unsubNotifs();
    };
  }, [currentUser]);

  const userName =
    userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Hacker';

  const totalMembersInUserTeams = teams.reduce((acc, t) => acc + (t.members?.length || 0), 0);

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-navy-800 via-navy-800 to-navy-700/80 rounded-2xl border border-navy-700/80 p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-accent/10 border border-blue-accent/20 text-xs font-semibold text-blue-accent mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Synergy Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {userName}!
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1">
              {teams.length > 0 ? (
                <>
                  You are leading / member of{' '}
                  <span className="text-blue-accent font-semibold">{teams.length} active team(s)</span>.
                </>
              ) : (
                <>
                  Create your team or browse open hackathon teams to start matching.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <MotionButton
              onClick={() => setCreateModalOpen(true)}
              size="md"
              className="gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </MotionButton>
            <Link to="/app/teams">
              <MotionButton size="md" variant="secondary" className="gap-2">
                <span>Browse Teams</span>
                <ArrowRight className="w-4 h-4" />
              </MotionButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MotionCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{teams.length}</div>
            <div className="text-xs text-slate-400 font-medium">My Active Teams</div>
          </div>
        </MotionCard>

        <MotionCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{totalMembersInUserTeams}</div>
            <div className="text-xs text-slate-400 font-medium">Total Teammates</div>
          </div>
        </MotionCard>

        <MotionCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">98%</div>
            <div className="text-xs text-slate-400 font-medium">Profile Synergy</div>
          </div>
        </MotionCard>

        <MotionCard className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">
              {notifications.filter((n) => !n.read).length}
            </div>
            <div className="text-xs text-slate-400 font-medium">Unread Updates</div>
          </div>
        </MotionCard>
      </div>

      {/* Swipe Carousel for Recommended Teammates */}
      <div className="pt-2">
        <SwipeCarousel
          title="Recommended For Your Hackathon Track"
          subtitle="Hand-picked candidates based on SIH problem statement criteria."
        >
          {mockTeammates.map((mate) => (
            <div key={mate.id} className="min-w-[300px] md:min-w-[320px] max-w-[340px] shrink-0">
              <MotionCard className="p-5 h-full flex flex-col justify-between border-navy-700/80 hover:border-blue-accent/40 shadow-md bg-navy-800/90">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{mate.name}</h3>
                      <p className="text-xs text-blue-accent font-medium">{mate.role}</p>
                      <p className="text-[11px] text-slate-400">{mate.college}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {mate.matchScore}%
                    </span>
                  </div>

                  <div className="inline-block px-2.5 py-1 rounded bg-navy-900 text-xs text-slate-300 border border-navy-700/80 mb-3">
                    ⚡ {mate.tag}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mate.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-navy-700 text-slate-300 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{mate.status}</span>
                  <Link to="/app/teammates">
                    <MotionButton size="sm" variant="outline" className="text-xs py-1 px-2.5">
                      Connect
                    </MotionButton>
                  </Link>
                </div>
              </MotionCard>
            </div>
          ))}
        </SwipeCarousel>
      </div>

      {/* Live Notifications & Invites */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity & Invites</h2>
            <p className="text-xs text-slate-400">Live notifications from teams and applicants</p>
          </div>
          <Link to="/app/notifications" className="text-xs font-semibold text-blue-accent hover:underline">
            View All
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-navy-800/40 rounded-2xl border border-navy-700/60 text-slate-400">
            <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs">No notifications yet. Team updates and requests will show up here.</p>
          </div>
        ) : (
          <AnimatedList className="space-y-3">
            {notifications.slice(0, 3).map((notif, index) => (
              <AnimatedListItem key={notif.id || index} index={index}>
                <Link to={notif.link || '/app/my-team'}>
                  <MotionCard
                    interactive={true}
                    className="p-4 flex items-center justify-between bg-navy-800/80 border-navy-700/80 hover:border-navy-600"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-accent/10 border border-blue-accent/20 flex items-center justify-center text-blue-accent shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-accent animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </MotionCard>
                </Link>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>

      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </PageTransition>
  );
}
