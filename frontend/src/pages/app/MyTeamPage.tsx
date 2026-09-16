import { useState, useEffect } from 'react';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { AnimatedList, AnimatedListItem } from '../../components/ui/AnimatedList';
import {
  Users,
  Trophy,
  Plus,
  Check,
  X,
  Clock,
  Send,
  Mail,
  Crown,
  Trash2,
  UserMinus,
  AlertTriangle,
  LogOut,
  Undo2,
} from 'lucide-react';
import {
  subscribeUserTeams,
  subscribeIncomingRequests,
  subscribeOutgoingRequests,
  acceptTeamRequest,
  rejectTeamRequest,
  removeTeamMember,
  deleteTeam,
  leaveTeam,
  withdrawTeamRequest,
  purgeFakeData,
  type Team,
  type TeamRequest,
  type TeamMember,
} from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import CreateTeamModal from '../../components/team/CreateTeamModal';

export default function MyTeamPage() {
  const { currentUser, userProfile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<TeamRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<TeamRequest[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'incoming' | 'outgoing'>('roster');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal states
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState<Team | null>(null);
  const [confirmLeaveTeam, setConfirmLeaveTeam] = useState<Team | null>(null);
  const [confirmWithdrawRequest, setConfirmWithdrawRequest] = useState<TeamRequest | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{
    team: Team;
    member: TeamMember;
  } | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    // Purge fake seed data if present
    purgeFakeData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubTeams = subscribeUserTeams(currentUser.uid, (data) => {
      setTeams(data);
    });

    const unsubIncoming = subscribeIncomingRequests(currentUser.uid, (data) => {
      setIncomingRequests(data);
    });

    const unsubOutgoing = subscribeOutgoingRequests(currentUser.uid, (data) => {
      setOutgoingRequests(data);
    });

    return () => {
      unsubTeams();
      unsubIncoming();
      unsubOutgoing();
    };
  }, [currentUser]);

  const handleAccept = async (req: TeamRequest) => {
    if (!req.id) return;
    setProcessingId(req.id);
    setActionError('');
    try {
      await acceptTeamRequest(req, {
        uid: req.senderId,
        name: req.senderName,
        email: req.senderEmail,
        role: req.role,
      });
    } catch (err: any) {
      console.error('Error accepting request:', err);
      setActionError(err.message || 'Failed to accept request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (req: TeamRequest) => {
    if (!req.id) return;
    setProcessingId(req.id);
    setActionError('');
    try {
      await rejectTeamRequest(req);
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteRemoveMember = async () => {
    if (!confirmRemoveMember || !confirmRemoveMember.team.id) return;
    setProcessingId(confirmRemoveMember.member.uid);
    try {
      await removeTeamMember(confirmRemoveMember.team.id, confirmRemoveMember.member.uid);
      setConfirmRemoveMember(null);
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      setActionError(err.message || 'Failed to remove member.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteDeleteTeam = async () => {
    if (!confirmDeleteTeam || !confirmDeleteTeam.id) return;
    setProcessingId(confirmDeleteTeam.id);
    try {
      await deleteTeam(confirmDeleteTeam.id);
      setConfirmDeleteTeam(null);
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      setActionError(err.message || 'Failed to delete team.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteLeaveTeam = async () => {
    if (!confirmLeaveTeam || !confirmLeaveTeam.id || !currentUser) return;
    setProcessingId(confirmLeaveTeam.id);
    try {
      await leaveTeam(
        confirmLeaveTeam.id,
        currentUser.uid,
        userProfile?.displayName || currentUser.displayName || 'Member'
      );
      setConfirmLeaveTeam(null);
    } catch (err: any) {
      console.error('Failed to leave team:', err);
      setActionError(err.message || 'Failed to leave team.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteWithdrawRequest = async () => {
    if (!confirmWithdrawRequest || !confirmWithdrawRequest.id) return;
    setProcessingId(confirmWithdrawRequest.id);
    try {
      await withdrawTeamRequest(confirmWithdrawRequest.id);
      setConfirmWithdrawRequest(null);
    } catch (err: any) {
      console.error('Failed to withdraw request:', err);
      setActionError(err.message || 'Failed to withdraw application.');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingIncoming = incomingRequests.filter((r) => r.status === 'pending');

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            My Teams & Requests
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your registered team rosters, incoming applications, and invitation status
          </p>
        </div>

        <MotionButton
          onClick={() => setCreateModalOpen(true)}
          size="md"
          className="gap-2 shrink-0 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </MotionButton>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-navy-700/80 pb-3">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-navy-800 text-blue-accent border border-navy-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Active Teams ({teams.length})
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'incoming'
              ? 'bg-navy-800 text-blue-accent border border-navy-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Incoming Requests</span>
          {pendingIncoming.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-accent text-navy-900 animate-pulse">
              {pendingIncoming.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'outgoing'
              ? 'bg-navy-800 text-blue-accent border border-navy-700 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Outgoing Applications ({outgoingRequests.length})
        </button>
      </div>

      {/* TAB 1: TEAMS & ROSTERS */}
      {activeTab === 'roster' && (
        <div>
          {teams.length === 0 ? (
            <div className="text-center py-20 bg-navy-800/40 rounded-2xl border border-navy-700/60 p-8">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No active teams yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                Create a team to lead an idea, or browse open teams to apply as a specialist.
              </p>
              <div className="flex gap-3 justify-center">
                <MotionButton onClick={() => setCreateModalOpen(true)} size="md">
                  Create Team
                </MotionButton>
                <a href="/app/teams">
                  <MotionButton variant="secondary" size="md">
                    Browse Teams
                  </MotionButton>
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => {
                const isLeader = team.leaderId === currentUser?.uid;
                const members = team.members || [];

                return (
                  <MotionCard
                    key={team.id}
                    interactive={false}
                    className="p-6 md:p-8 bg-navy-800/90 border border-navy-700 shadow-xl"
                  >
                    {/* Team Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-navy-700/60">
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                          {isLeader && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-blue-accent font-medium flex items-center gap-1.5 mt-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{team.hackathon}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{team.college || 'Collegiate'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-navy-900 border border-navy-700 text-white">
                          Roster: {members.length} / {team.maxSize || 6}
                        </span>

                        {isLeader ? (
                          <MotionButton
                            size="sm"
                            variant="secondary"
                            onClick={() => setConfirmDeleteTeam(team)}
                            className="text-xs py-1.5 px-3 gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Dismantle Team</span>
                          </MotionButton>
                        ) : (
                          <MotionButton
                            size="sm"
                            variant="secondary"
                            onClick={() => setConfirmLeaveTeam(team)}
                            className="text-xs py-1.5 px-3 gap-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border-amber-500/30"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Leave Team</span>
                          </MotionButton>
                        )}
                      </div>
                    </div>

                    {/* Problem Statement & Info */}
                    <div className="py-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Problem Statement
                      </div>
                      <p className="text-sm text-slate-200">{team.problemStatement}</p>
                    </div>

                    {/* Member Roster Grid */}
                    <div className="pt-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Team Members ({members.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {members.map((member, idx) => (
                          <div
                            key={member.uid || idx}
                            className="p-3.5 bg-navy-900 rounded-xl border border-navy-700/80 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 text-navy-900 font-bold flex items-center justify-center shrink-0">
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-bold text-white truncate">
                                    {member.name}
                                  </span>
                                  {member.isLeader && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-blue-accent truncate">{member.role}</p>
                              </div>
                            </div>

                            {isLeader && !member.isLeader && (
                              <button
                                onClick={() => setConfirmRemoveMember({ team, member })}
                                title="Remove member"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </MotionCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING REQUESTS */}
      {activeTab === 'incoming' && (
        <div>
          {incomingRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-navy-800/40 rounded-2xl border border-navy-700/60 p-8">
              <Clock className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No incoming requests</p>
              <p className="text-xs mt-0.5">
                When students apply to your team, their applications will appear here for review.
              </p>
            </div>
          ) : (
            <AnimatedList className="space-y-4">
              {incomingRequests.map((req, index) => {
                const isPending = req.status === 'pending';

                return (
                  <AnimatedListItem key={req.id} index={index}>
                    <MotionCard
                      interactive={false}
                      className="p-5 md:p-6 bg-navy-800/90 border border-navy-700 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{req.senderName}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-accent/10 text-blue-accent border border-blue-accent/20">
                            {req.role || 'Applicant'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Applied to join <strong className="text-white">"{req.teamName}"</strong>
                        </p>
                        {req.message && (
                          <p className="text-xs text-slate-400 italic bg-navy-900 p-2.5 rounded-lg border border-navy-700/60 mt-2 max-w-xl">
                            "{req.message}"
                          </p>
                        )}
                        {req.senderEmail && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{req.senderEmail}</span>
                          </p>
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isPending ? (
                          <>
                            <MotionButton
                              size="sm"
                              onClick={() => handleAccept(req)}
                              disabled={processingId === req.id}
                              className="text-xs py-1.5 px-3.5 gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-navy-900"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </MotionButton>
                            <MotionButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleReject(req)}
                              disabled={processingId === req.id}
                              className="text-xs py-1.5 px-3.5 gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </MotionButton>
                          </>
                        ) : req.status === 'accepted' ? (
                          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Accepted
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Declined
                          </span>
                        )}
                      </div>
                    </MotionCard>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          )}
        </div>
      )}

      {/* TAB 3: OUTGOING APPLICATIONS */}
      {activeTab === 'outgoing' && (
        <div>
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-navy-800/40 rounded-2xl border border-navy-700/60 p-8">
              <Send className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No outgoing requests</p>
              <p className="text-xs mt-0.5">
                When you apply to teams or invite teammates, track your requests here.
              </p>
            </div>
          ) : (
            <AnimatedList className="space-y-4">
              {outgoingRequests.map((req, index) => (
                <AnimatedListItem key={req.id} index={index}>
                  <MotionCard
                    interactive={false}
                    className="p-5 md:p-6 bg-navy-800/90 border border-navy-700 shadow-md flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{req.teamName}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-navy-900 text-slate-300 border border-navy-700">
                          {req.type === 'join_request' ? 'Application' : 'Invitation'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Applied as <span className="text-blue-accent font-medium">{req.role}</span>
                      </p>
                    </div>

                    <div>
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Review
                          </span>
                          <MotionButton
                            size="sm"
                            variant="secondary"
                            onClick={() => setConfirmWithdrawRequest(req)}
                            className="text-xs py-1 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                          >
                            <Undo2 className="w-3 h-3 mr-1" />
                            <span>Withdraw</span>
                          </MotionButton>
                        </div>
                      ) : req.status === 'accepted' ? (
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Accepted & Joined
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Declined
                        </span>
                      )}
                    </div>
                  </MotionCard>
                </AnimatedListItem>
              ))}
            </AnimatedList>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Confirm Remove Member Modal */}
      {confirmRemoveMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Remove Team Member</h3>
                <p className="text-xs text-slate-400">Confirmation required</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to remove <strong className="text-white">{confirmRemoveMember.member.name}</strong> from team <strong className="text-white">"{confirmRemoveMember.team.name}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmRemoveMember(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <MotionButton
                size="sm"
                onClick={handleExecuteRemoveMember}
                disabled={!!processingId}
                className="bg-red-500 hover:bg-red-400 text-white text-xs"
              >
                {processingId ? 'Removing...' : 'Confirm Remove'}
              </MotionButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Team Modal */}
      {confirmDeleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dismantle & Delete Team</h3>
                <p className="text-xs text-slate-400">Irreversible Action</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to dismantle team <strong className="text-white">"{confirmDeleteTeam.name}"</strong>? This will permanently delete the team and notify all members.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteTeam(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <MotionButton
                size="sm"
                onClick={handleExecuteDeleteTeam}
                disabled={!!processingId}
                className="bg-red-600 hover:bg-red-500 text-white text-xs"
              >
                {processingId ? 'Deleting...' : 'Delete Team'}
              </MotionButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Leave Team Modal */}
      {confirmLeaveTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Leave Team</h3>
                <p className="text-xs text-slate-400">Confirmation required</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to leave team <strong className="text-white">"{confirmLeaveTeam.name}"</strong>? You will no longer be listed on the roster.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmLeaveTeam(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <MotionButton
                size="sm"
                onClick={handleExecuteLeaveTeam}
                disabled={!!processingId}
                className="bg-amber-500 hover:bg-amber-400 text-navy-900 text-xs font-bold"
              >
                {processingId ? 'Leaving...' : 'Confirm Leave'}
              </MotionButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Withdraw Request Modal */}
      {confirmWithdrawRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Undo2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Withdraw Application</h3>
                <p className="text-xs text-slate-400">Cancel pending application</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Are you sure you want to withdraw your application for <strong className="text-white">"{confirmWithdrawRequest.teamName}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmWithdrawRequest(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Keep Application
              </button>
              <MotionButton
                size="sm"
                onClick={handleExecuteWithdrawRequest}
                disabled={!!processingId}
                className="bg-red-500 hover:bg-red-400 text-white text-xs"
              >
                {processingId ? 'Withdrawing...' : 'Withdraw Application'}
              </MotionButton>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
