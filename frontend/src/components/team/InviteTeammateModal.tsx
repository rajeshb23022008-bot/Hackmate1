import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Check } from 'lucide-react';
import { MotionButton } from '../ui/MotionButton';
import { sendTeamRequest, type Team } from '../../services/firestoreService';
import { useAuth, type UserProfile } from '../../context/AuthContext';

interface InviteTeammateModalProps {
  isOpen: boolean;
  teammate: UserProfile | null;
  userTeams: Team[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteTeammateModal({
  isOpen,
  teammate,
  userTeams,
  onClose,
  onSuccess,
}: InviteTeammateModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [selectedTeamId, setSelectedTeamId] = useState(userTeams[0]?.id || '');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen || !teammate) return null;

  const targetTeam = userTeams.find((t) => t.id === selectedTeamId) || userTeams[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !targetTeam) return;
    setError('');
    setLoading(true);

    try {
      await sendTeamRequest({
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'Team Leader',
        senderEmail: currentUser.email || '',
        receiverId: teammate.uid,
        receiverName: teammate.displayName || 'Teammate',
        teamId: targetTeam.id!,
        teamName: targetTeam.name,
        role: role || 'Teammate',
        message: message.trim() || `Hey ${teammate.displayName}! We would love to have you on ${targetTeam.name}.`,
        type: 'invite',
      });

      setSent(true);
      setLoading(false);
      setTimeout(() => {
        setSent(false);
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error sending invite:', err);
      setError(err.message || 'Failed to send invite');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 md:p-8 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-accent/10 text-blue-accent border border-blue-accent/20">
              Invite to Team
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">
              Invite {teammate.displayName || 'Teammate'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select one of your teams to send an invitation.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {userTeams.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              <p className="text-sm">You haven't created any teams yet.</p>
              <p className="text-xs mt-1">Create a team first before sending invitations.</p>
            </div>
          ) : sent ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Invitation Sent!</h3>
              <p className="text-xs text-slate-400 mt-1">
                {teammate.displayName} will be notified of your invite.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Select Team *
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all cursor-pointer"
                >
                  {userTeams.map((t) => (
                    <option key={t.id} value={t.id} className="bg-navy-900 text-white">
                      {t.name} ({t.hackathon})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Assigned Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI/ML Engineer, UI Specialist"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Personal Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Add a friendly invite note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all resize-none placeholder:text-slate-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <MotionButton type="submit" disabled={loading} size="md" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
                </MotionButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
