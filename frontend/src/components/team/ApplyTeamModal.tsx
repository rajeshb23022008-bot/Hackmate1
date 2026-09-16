import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Award, Check } from 'lucide-react';
import { MotionButton } from '../ui/MotionButton';
import { sendTeamRequest, type Team } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface ApplyTeamModalProps {
  isOpen: boolean;
  team: Team | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyTeamModal({ isOpen, team, onClose, onSuccess }: ApplyTeamModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setLoading(true);

    try {
      await sendTeamRequest({
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || currentUser.displayName || 'Applicant',
        senderEmail: currentUser.email || '',
        receiverId: team.leaderId,
        receiverName: team.leaderName,
        teamId: team.id!,
        teamName: team.name,
        role: role || (team.missingRoles?.[0] ?? 'Developer'),
        message: message.trim() || 'Hi! I would love to join your team for this hackathon.',
        type: 'join_request',
      });

      setSent(true);
      setLoading(false);
      setTimeout(() => {
        setSent(false);
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error applying to team:', err);
      setError(err.message || 'Failed to submit application');
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
              Apply to Join
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{team.name}</h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{team.hackathon}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {sent ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Application Sent!</h3>
              <p className="text-xs text-slate-400 mt-1">
                The team leader has been notified of your request.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Target Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all cursor-pointer"
                >
                  {team.missingRoles?.length ? (
                    team.missingRoles.map((r) => (
                      <option key={r} value={r} className="bg-navy-900 text-white">
                        {r}
                      </option>
                    ))
                  ) : (
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Introduction & Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Introduce yourself, your key skills, and why you are a great fit for this team..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500 resize-none"
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
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Submit Application'}</span>
                </MotionButton>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
