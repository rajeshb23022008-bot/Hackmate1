import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, MessageSquare, UserPlus, Trophy, Zap } from 'lucide-react';
import { calculateCompatibility } from '../../services/compatibilityService';
import type { UserProfile } from '../../context/AuthContext';
import type { Team } from '../../services/firestoreService';

interface CompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Partial<UserProfile> | null | undefined;
  team: Partial<Team> | null | undefined;
  onInvite?: () => void;
  onMessage?: () => void;
}

export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({
  isOpen,
  onClose,
  user,
  team,
  onInvite,
  onMessage,
}) => {
  if (!isOpen || !team || !user) return null;

  const result = calculateCompatibility(user, team);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-800 border border-navy-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-navy-700/80 flex items-center justify-between bg-navy-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-accent/10 border border-blue-accent/30 flex items-center justify-center text-blue-accent">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AI Synergy & Compatibility</h3>
              <p className="text-xs text-slate-400">
                {user.displayName || 'Candidate'} &bull; {team.name || 'Team'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Main Score Hero Gauge */}
          <div className="p-6 bg-navy-900/90 border border-navy-700/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner">
            <div className="relative flex items-center justify-center shrink-0">
              {/* SVG Radial Gauge Ring */}
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-navy-700"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-blue-accent transition-all duration-1000 ease-out"
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 - (301.59 * result.totalScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{result.totalScore}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${result.tierColor} bg-navy-950/60 border-navy-700`}>
                <Zap className="w-3.5 h-3.5" />
                {result.tierLabel}
              </span>
              <h4 className="text-base font-bold text-white leading-snug pt-1">
                Synergy Score Analysis
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluated against hackathon requirements, missing roles, and technical stack fit.
              </p>
            </div>
          </div>

          {/* Category Breakdown Sliders */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Profile Breakdown Metrics
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Skill Match */}
              <div className="p-3 bg-navy-900/60 border border-navy-700/60 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">🛠️ Skill Complementarity</span>
                  <span className="text-blue-accent">{result.skillScore}%</span>
                </div>
                <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-accent transition-all duration-700"
                    style={{ width: `${result.skillScore}%` }}
                  />
                </div>
              </div>

              {/* Role Fit */}
              <div className="p-3 bg-navy-900/60 border border-navy-700/60 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">🎯 Role Gap Alignment</span>
                  <span className="text-emerald-400">{result.roleScore}%</span>
                </div>
                <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-700"
                    style={{ width: `${result.roleScore}%` }}
                  />
                </div>
              </div>

              {/* Academic & Domain */}
              <div className="p-3 bg-navy-900/60 border border-navy-700/60 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">🎓 Academic & Domain Synergy</span>
                  <span className="text-amber-400">{result.academicScore}%</span>
                </div>
                <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${result.academicScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Matched vs Needed Skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Technical Skill Analysis
            </h4>

            {result.matchingSkills.length > 0 && (
              <div>
                <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
                  Direct Matching Tech Stack:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-accent/10 border border-blue-accent/30 text-blue-accent text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-slate-400 font-semibold mb-1.5 block">
                  Additional Skills Wanted by Team:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-700 text-slate-400 text-xs font-medium flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendation Summary */}
          <div className="p-4 bg-blue-accent/5 border border-blue-accent/20 rounded-xl space-y-1">
            <h5 className="text-xs font-bold text-blue-accent flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              AI Recommendation
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-navy-700/80 bg-navy-900/60 flex items-center justify-end gap-3">
          {onMessage && (
            <button
              onClick={() => {
                onMessage();
                onClose();
              }}
              className="py-2 px-4 bg-navy-900 border border-navy-700 hover:border-blue-accent/50 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-accent" />
              <span>Message</span>
            </button>
          )}

          {onInvite && (
            <button
              onClick={() => {
                onInvite();
                onClose();
              }}
              className="py-2 px-4 bg-blue-accent text-navy-950 hover:bg-blue-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Candidate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
