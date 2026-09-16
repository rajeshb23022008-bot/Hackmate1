import React from 'react';
import { X, Crown, MessageSquare, Shield } from 'lucide-react';
import type { TeamMember } from '../../services/firestoreService';

interface TeamMemberListModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  members: TeamMember[];
  currentUserId?: string;
  onStartDM: (member: TeamMember) => void;
}

export const TeamMemberListModal: React.FC<TeamMemberListModalProps> = ({
  isOpen,
  onClose,
  teamName,
  members,
  currentUserId,
  onStartDM,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-800 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-navy-700/80 flex items-center justify-between bg-navy-900/50">
          <div>
            <h3 className="text-lg font-extrabold text-white">{teamName} Members</h3>
            <p className="text-xs text-slate-400">{members.length} team members</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {members.map((m) => {
            const isSelf = m.uid === currentUserId;
            const initial = m.name ? m.name.charAt(0).toUpperCase() : '?';

            return (
              <div
                key={m.uid}
                className="p-3 bg-navy-900/80 border border-navy-700/60 rounded-xl flex items-center justify-between gap-3 hover:border-navy-600 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-accent to-blue-600 flex items-center justify-center text-navy-900 font-bold text-sm shadow-sm">
                      {initial}
                    </div>
                    {/* Active green dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-navy-900 rounded-full" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">{m.name}</span>
                      {m.isLeader && (
                        <span title="Team Leader">
                          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        </span>
                      )}
                      {isSelf && (
                        <span className="text-[10px] bg-blue-accent/20 text-blue-accent px-1.5 py-0.5 rounded-md font-bold shrink-0">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3 text-slate-500" />
                      <span>{m.role || (m.isLeader ? 'Leader' : 'Member')}</span>
                    </div>
                  </div>
                </div>

                {!isSelf && (
                  <button
                    onClick={() => {
                      onStartDM(m);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-blue-accent/10 border border-blue-accent/30 text-blue-accent hover:bg-blue-accent hover:text-navy-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
