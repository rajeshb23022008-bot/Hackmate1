import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedList';
import { Search, UserPlus, MessageSquare, Zap } from 'lucide-react';
import {
  getTeammates,
  subscribeUserTeams,
  type Team,
} from '../../services/firestoreService';
import { useAuth, type UserProfile } from '../../context/AuthContext';
import InviteTeammateModal from '../../components/team/InviteTeammateModal';
import { CompatibilityModal } from '../../components/team/CompatibilityModal';
import { calculateCompatibility } from '../../services/compatibilityService';


const domains = ['All Domains', 'AI/ML', 'Web/Cloud', 'Design', 'Web3', 'Hardware'];
const YEARS = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad'];

export default function TeammatesPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [teammates, setTeammates] = useState<UserProfile[]>([]);

  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('All Years');
  const [selectedTeammateToInvite, setSelectedTeammateToInvite] = useState<UserProfile | null>(null);
  const [compatibilityTarget, setCompatibilityTarget] = useState<{
    user: UserProfile;
    team: Team;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const liveUsers = await getTeammates();
      setTeammates(liveUsers.filter((u) => u.uid !== currentUser?.uid));
    };

    loadData();

    if (currentUser) {
      const unsub = subscribeUserTeams(currentUser.uid, (data) => {
        setUserTeams(data);
      });
      return () => unsub();
    }
  }, [currentUser]);

  const filteredTeammates = useMemo(() => {
    return teammates.filter((item) => {
      const matchesDomain =
        selectedDomain === 'All Domains' ||
        (selectedDomain === 'AI/ML' && item.skills?.some((s) => /python|pytorch|tensorflow|ml|ai/i.test(s))) ||
        (selectedDomain === 'Web/Cloud' && item.skills?.some((s) => /react|next|node|aws|docker|cloud/i.test(s))) ||
        (selectedDomain === 'Design' && item.skills?.some((s) => /figma|ui|ux|design/i.test(s))) ||
        (selectedDomain === 'Web3' && item.skills?.some((s) => /solidity|web3|ethereum/i.test(s))) ||
        (selectedDomain === 'Hardware' && item.skills?.some((s) => /esp32|iot|c\+\+|embedded/i.test(s)));

      const matchesCollege =
        !collegeFilter ||
        (item.college || '').toLowerCase().includes(collegeFilter.toLowerCase());

      const matchesDept =
        !deptFilter ||
        (item.department || '').toLowerCase().includes(deptFilter.toLowerCase());

      const matchesYear =
        yearFilter === 'All Years' ||
        (item.year || '').toLowerCase().includes(yearFilter.toLowerCase());

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (item.displayName || '').toLowerCase().includes(searchLower) ||
        (item.role || '').toLowerCase().includes(searchLower) ||
        (item.skills || []).some((s) => s.toLowerCase().includes(searchLower));

      return matchesDomain && matchesCollege && matchesDept && matchesYear && matchesSearch;
    });
  }, [teammates, searchQuery, selectedDomain, collegeFilter, deptFilter, yearFilter]);

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Find Teammates
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified students ranked by synergy with your hackathon goals
          </p>
        </div>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="bg-navy-800/80 p-4 rounded-2xl border border-navy-700/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* General Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill, name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 pl-10 pr-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>

          {/* College Filter */}
          <div>
            <input
              type="text"
              placeholder="College / Inst..."
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <input
              type="text"
              placeholder="Department (e.g. CSE, ECE)..."
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Year Select */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y} className="bg-navy-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Domain:
          </span>
          {domains.map((domain) => (
            <motion.button
              key={domain}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDomain === domain
                  ? 'bg-blue-accent text-navy-900 font-bold shadow'
                  : 'bg-navy-900 text-slate-300 border border-navy-700 hover:border-slate-500'
              }`}
            >
              {domain}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Animated Teammate Grid */}
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeammates.map((mate, index) => {
          return (
            <AnimatedListItem key={mate.uid} index={index}>
              <MotionCard
                interactive={true}
                className="p-6 h-full flex flex-col justify-between border-navy-700/80 hover:border-blue-accent/40 shadow-lg bg-navy-800/90"
              >
                <div>
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 flex items-center justify-center text-navy-900 font-bold text-base shadow-sm shrink-0">
                        {(mate.displayName || 'H').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base leading-snug truncate">
                          {mate.displayName || 'Hacker'}
                        </h3>
                        <p className="text-xs text-blue-accent font-medium truncate">{mate.role || 'Developer'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{mate.college || 'Collegiate'}</p>
                      </div>
                    </div>

                    {userTeams.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCompatibilityTarget({ user: mate, team: userTeams[0] })}
                        className="px-2.5 py-1 rounded-full bg-navy-900 border border-blue-accent/40 text-blue-accent hover:bg-blue-accent hover:text-navy-950 text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
                        title="Click to view AI compatibility breakdown"
                      >
                        <Zap className="w-3 h-3 text-amber-400 fill-current" />
                        <span>{calculateCompatibility(mate, userTeams[0]).totalScore}% Match</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {mate.bio || 'Looking for an ambitious hackathon team!'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mate.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-navy-900 border border-navy-700 text-slate-300 text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-navy-700/60 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/app/messages?recipientId=${mate.uid}`)}
                    className="py-1.5 px-3 bg-navy-900 border border-navy-700 hover:border-blue-accent/50 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-accent" />
                    <span>Message</span>
                  </button>

                  <MotionButton
                    size="sm"
                    onClick={() => setSelectedTeammateToInvite(mate)}
                    className="text-xs py-1.5 px-3 gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite</span>
                  </MotionButton>
                </div>
              </MotionCard>
            </AnimatedListItem>
          );
        })}
      </AnimatedList>

      {filteredTeammates.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-base font-semibold text-white">No teammates matched your filter</p>
          <p className="text-xs mt-1">Try searching for other skills like "PyTorch", "Figma", or "Solidity"</p>
        </div>
      )}

      {/* Invite Modal */}
      <InviteTeammateModal
        isOpen={!!selectedTeammateToInvite}
        teammate={selectedTeammateToInvite}
        userTeams={userTeams}
        onClose={() => setSelectedTeammateToInvite(null)}
      />

      {/* AI Compatibility Analysis Modal */}
      <CompatibilityModal
        isOpen={!!compatibilityTarget}
        onClose={() => setCompatibilityTarget(null)}
        user={compatibilityTarget?.user}
        team={compatibilityTarget?.team}
        onInvite={() => {
          if (compatibilityTarget?.user) {
            setSelectedTeammateToInvite(compatibilityTarget.user);
          }
        }}
        onMessage={() => {
          if (compatibilityTarget?.user) {
            navigate(`/app/messages?recipientId=${compatibilityTarget.user.uid}`);
          }
        }}
      />
    </PageTransition>
  );
}
