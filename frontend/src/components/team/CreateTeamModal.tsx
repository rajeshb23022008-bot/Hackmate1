import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, Users, Tag, Building2, Calendar } from 'lucide-react';
import { MotionButton } from '../ui/MotionButton';
import { createTeam } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (teamId: string) => void;
}

const HACKATHON_OPTIONS = [
  'Smart India Hackathon 2026',
  'ETHIndia 2026',
  'HackMIT India',
  'Polygon BUIDL Hackathon',
  'Google Cloud AI Challenge',
  'Other / College Hackathon',
];

export default function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    hackathon: 'Smart India Hackathon 2026',
    problemStatement: '',
    description: '',
    requiredSkills: '',
    missingRoles: '',
    maxSize: 6,
    college: userProfile?.college || '',
    deadline: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setLoading(true);

    try {
      const skillsArray = formData.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const rolesArray = formData.missingRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const leaderData = {
        uid: currentUser.uid,
        name: userProfile?.displayName || currentUser.displayName || 'Team Leader',
        email: currentUser.email || '',
      };

      const teamId = await createTeam(
        {
          name: formData.name.trim(),
          hackathon: formData.hackathon,
          problemStatement: formData.problemStatement.trim(),
          description: formData.description.trim(),
          requiredSkills: skillsArray.length ? skillsArray : ['React', 'Python'],
          missingRoles: rolesArray.length ? rolesArray : ['Developer'],
          maxSize: Number(formData.maxSize) || 6,
          college: formData.college.trim() || 'Collegiate',
          deadline: formData.deadline || '2026-10-30',
          leaderId: currentUser.uid,
          leaderName: leaderData.name,
          leaderEmail: leaderData.email,
        },
        leaderData
      );

      setLoading(false);
      onSuccess?.(teamId);
      onClose();
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.message || 'Failed to create team. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 my-8 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Create a Hackathon Team</h2>
              <p className="text-xs text-slate-400">
                You will automatically be assigned as Team Leader.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* Team Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ByteBrigade, Team Apex, NeuralSync"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Hackathon Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Target Hackathon *
                </label>
                <div className="relative">
                  <Trophy className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.hackathon}
                    onChange={(e) => setFormData({ ...formData, hackathon: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all cursor-pointer"
                  >
                    {HACKATHON_OPTIONS.map((h) => (
                      <option key={h} value={h} className="bg-navy-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  College / Institution
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. IIT Bombay, BITS Pilani"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Problem Statement / Track *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SIH 1420: AI Driven Autonomous Crop Disease Detection"
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Project Description & Vision
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what your team aims to build and what you expect from applicants..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* Required Skills & Missing Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Required Skills (comma separated) *
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="PyTorch, React, FastAPI, OpenCV"
                    value={formData.requiredSkills}
                    onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Missing Roles (comma separated) *
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="AI Specialist, Backend Dev, Pitch Lead"
                    value={formData.missingRoles}
                    onChange={(e) => setFormData({ ...formData, missingRoles: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Team Size & Application Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Max Team Size (e.g. SIH requires 6)
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={formData.maxSize}
                  onChange={(e) => setFormData({ ...formData, maxSize: parseInt(e.target.value) || 6 })}
                  className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Application Deadline
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-navy-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <MotionButton type="submit" disabled={loading} size="md">
                {loading ? 'Creating Team...' : 'Create Team'}
              </MotionButton>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
