import { useState, useEffect, useMemo } from 'react';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedList';
import {
  Users,
  Search,
  Plus,
  Trophy,
  Building2,
  Send,
  CheckCircle2,
  Tag,
  Zap,
} from 'lucide-react';
import { getAllTeams, type Team } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import CreateTeamModal from '../../components/team/CreateTeamModal';
import ApplyTeamModal from '../../components/team/ApplyTeamModal';
import { CompatibilityModal } from '../../components/team/CompatibilityModal';
import { calculateCompatibility } from '../../services/compatibilityService';

const EVENT_TYPES = [
  'All Events',
  'Smart India Hackathon 2026',
  'ETHIndia 2026',
  'Internal Hackathon',
  'Paper Presentation',
  'Symposium',
  'Project Expo',
];

export default function TeamsPage() {
  const { currentUser, userProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('All Events');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedApplyTeam, setSelectedApplyTeam] = useState<Team | null>(null);
  const [selectedCompatibilityTeam, setSelectedCompatibilityTeam] = useState<Team | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    const data = await getAllTeams();
    setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesEvent =
        selectedEventType === 'All Events' ||
        team.hackathon.toLowerCase().includes(selectedEventType.toLowerCase()) ||
        (selectedEventType === 'Smart India Hackathon 2026' && /sih|smart india/i.test(team.hackathon));

      const matchesCollege =
        !collegeFilter ||
        (team.college || '').toLowerCase().includes(collegeFilter.toLowerCase());

      const matchesSkill =
        !skillFilter ||
        (team.requiredSkills || []).some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        team.name.toLowerCase().includes(searchLower) ||
        team.problemStatement.toLowerCase().includes(searchLower) ||
        (team.requiredSkills || []).some((s) => s.toLowerCase().includes(searchLower)) ||
        (team.missingRoles || []).some((r) => r.toLowerCase().includes(searchLower));

      return matchesEvent && matchesCollege && matchesSkill && matchesSearch;
    });
  }, [teams, searchQuery, selectedEventType, collegeFilter, skillFilter]);

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Create Team Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Find Hackathon Teams
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover open teams actively looking for your skills and apply in one click
          </p>
        </div>

        <MotionButton
          onClick={() => setCreateModalOpen(true)}
          size="md"
          className="gap-2 shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create Team</span>
        </MotionButton>
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="bg-navy-800/80 p-4 rounded-2xl border border-navy-700/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* General Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team name, problem statement, roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 pl-10 pr-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>

          {/* College Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by College / Inst..."
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Skill Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by Skill (e.g. React)..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-3 px-4 text-white text-base md:text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Event Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Event Type:
          </span>
          {EVENT_TYPES.map((ev) => (
            <button
              key={ev}
              onClick={() => setSelectedEventType(ev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedEventType === ev
                  ? 'bg-blue-accent text-navy-900 font-bold shadow'
                  : 'bg-navy-900 text-slate-300 border border-navy-700 hover:border-slate-500'
              }`}
            >
              {ev}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading open teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-20 bg-navy-800/40 rounded-2xl border border-navy-700/60 p-8">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No teams found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
            Be the first to create a team for this track and recruit your dream teammates!
          </p>
          <MotionButton onClick={() => setCreateModalOpen(true)} size="md">
            Create a Team Now
          </MotionButton>
        </div>
      ) : (
        <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => {
            const isLeader = team.leaderId === currentUser?.uid;
            const isMember = team.members?.some((m) => m.uid === currentUser?.uid);
            const memberCount = team.members?.length || 1;
            const isFull = memberCount >= (team.maxSize || 6);
            const compat = calculateCompatibility(userProfile, team);

            return (
              <AnimatedListItem key={team.id} index={index}>
                <MotionCard className="p-6 h-full flex flex-col justify-between border-navy-700/80 hover:border-blue-accent/40 shadow-xl bg-navy-800/90">
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg leading-snug truncate">{team.name}</h3>
                        <p className="text-xs text-blue-accent font-medium flex items-center gap-1.5 mt-0.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{team.hackathon}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCompatibilityTeam(team)}
                          className="px-2.5 py-1 rounded-full bg-navy-900 border border-blue-accent/40 text-blue-accent hover:bg-blue-accent hover:text-navy-950 text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Click to view AI compatibility analysis"
                        >
                          <Zap className="w-3 h-3 text-amber-400 fill-current" />
                          <span>{compat.totalScore}% Fit</span>
                        </button>

                        <span className="text-[10px] font-mono text-slate-400">
                          {memberCount} / {team.maxSize || 6} members
                        </span>
                      </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="p-3 bg-navy-900/90 rounded-xl border border-navy-700/60 mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Problem Statement
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                        {team.problemStatement}
                      </p>
                    </div>

                    {/* Missing Roles */}
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <span>Missing Roles:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {team.missingRoles?.map((role, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Required Stack:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {team.requiredSkills?.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-navy-700/60 text-slate-300 text-[10px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-4 border-t border-navy-700/60 flex items-center justify-between mt-auto">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{team.college || 'Collegiate'}</span>
                    </div>

                    {isLeader ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        You're Leader
                      </span>
                    ) : isMember ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Joined
                      </span>
                    ) : isFull ? (
                      <span className="text-xs text-slate-500 font-medium">Team Full</span>
                    ) : (
                      <MotionButton
                        size="sm"
                        onClick={() => setSelectedApplyTeam(team)}
                        className="text-xs py-1.5 px-3 gap-1.5"
                      >
                        <Send className="w-3 h-3" />
                        <span>Apply</span>
                      </MotionButton>
                    )}
                  </div>
                </MotionCard>
              </AnimatedListItem>
            );
          })}
        </AnimatedList>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => fetchTeams()}
      />

      <ApplyTeamModal
        isOpen={!!selectedApplyTeam}
        team={selectedApplyTeam}
        onClose={() => setSelectedApplyTeam(null)}
        onSuccess={() => fetchTeams()}
      />

      {/* AI Compatibility Analysis Modal */}
      <CompatibilityModal
        isOpen={!!selectedCompatibilityTeam}
        onClose={() => setSelectedCompatibilityTeam(null)}
        user={userProfile}
        team={selectedCompatibilityTeam}
        onInvite={() => {
          if (selectedCompatibilityTeam) {
            setSelectedApplyTeam(selectedCompatibilityTeam);
          }
        }}
      />
    </PageTransition>
  );
}
