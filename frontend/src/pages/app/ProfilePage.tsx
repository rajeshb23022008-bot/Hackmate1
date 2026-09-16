import React, { useState, useEffect } from 'react';
import { PageTransition } from '../../components/ui/PageTransition';
import { MotionCard } from '../../components/ui/MotionCard';
import { MotionButton } from '../../components/ui/MotionButton';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/firestoreService';
import {
  User,
  Building2,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Tag,
  Briefcase,
  Target,
  BookOpen,
} from 'lucide-react';

const DOMAIN_OPTIONS = ['AI/ML', 'Web/Cloud', 'UI/UX Design', 'Web3 & Blockchain', 'Hardware & IoT', 'Mobile App Dev'];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgrad / Alumni'];
const LOOKING_FOR_OPTIONS = [
  'Actively seeking team',
  'Forming a team (Leader)',
  'Open to invitations',
  'Not available',
];

export default function ProfilePage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    college: '',
    department: '',
    year: '3rd Year',
    role: '',
    bio: '',
    targetHackathon: 'Smart India Hackathon 2026',
    lookingForStatus: 'Actively seeking team',
    skills: '',
    domains: [] as string[],
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        college: userProfile.college || '',
        department: userProfile.department || '',
        year: userProfile.year || '3rd Year',
        role: userProfile.role || 'Full-Stack Developer',
        bio: userProfile.bio || '',
        targetHackathon: userProfile.targetHackathon || 'Smart India Hackathon 2026',
        lookingForStatus: userProfile.lookingForStatus || 'Actively seeking team',
        skills: (userProfile.skills || []).join(', '),
        domains: userProfile.domains || ['AI/ML', 'Web/Cloud'],
      });
    }
  }, [userProfile]);

  const handleDomainToggle = (domain: string) => {
    setFormData((prev) => {
      const exists = prev.domains.includes(domain);
      const updated = exists
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain];
      return { ...prev, domains: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateUserProfile(currentUser.uid, {
        displayName: formData.displayName.trim(),
        college: formData.college.trim(),
        department: formData.department.trim(),
        year: formData.year,
        role: formData.role.trim(),
        bio: formData.bio.trim(),
        targetHackathon: formData.targetHackathon.trim(),
        lookingForStatus: formData.lookingForStatus,
        skills: skillsArray,
        domains: formData.domains,
      });

      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Edit Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Keep your hacker profile up to date so potential teammates and team leaders can evaluate your fit
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <MotionCard interactive={false} className="p-6 md:p-8 bg-navy-800/90 border border-navy-700 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity & Contact Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-navy-700/60">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-accent to-blue-600 text-navy-900 font-extrabold text-2xl flex items-center justify-center shadow-lg">
              {(formData.displayName || 'H').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {formData.displayName || 'Hacker Profile'}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser?.email}</p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-accent/10 text-blue-accent border border-blue-accent/20">
                {formData.lookingForStatus}
              </span>
            </div>
          </div>

          {/* Grid 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                  placeholder="e.g. Kane Williamson"
                />
              </div>
            </div>

            {/* Primary Role / Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Primary Role / Title *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                  placeholder="e.g. AI Specialist & PyTorch Engineer"
                />
              </div>
            </div>
          </div>

          {/* Grid 2: Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* College */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                College / Institution
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                  placeholder="e.g. IIT Madras"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                  placeholder="e.g. Computer Science & Engg"
                />
              </div>
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Year of Study
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y} className="bg-navy-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid 3: Status & Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Availability & Status
              </label>
              <select
                value={formData.lookingForStatus}
                onChange={(e) => setFormData({ ...formData, lookingForStatus: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-accent cursor-pointer"
              >
                {LOOKING_FOR_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-navy-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Hackathon
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.targetHackathon}
                  onChange={(e) => setFormData({ ...formData, targetHackathon: e.target.value })}
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                  placeholder="e.g. Smart India Hackathon 2026"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Bio & Hackathon Experience
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-blue-accent transition-all placeholder:text-slate-500 resize-none"
              placeholder="Tell potential teammates about your previous projects, hackathon wins, or tech interests..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tech Stack & Skills (comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-blue-accent transition-all"
                placeholder="React, PyTorch, FastAPI, OpenCV, TailwindCSS, Docker"
              />
            </div>
          </div>

          {/* Interested Domains Multiselect Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Interested Domains
            </label>
            <div className="flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map((domain) => {
                const selected = formData.domains.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => handleDomainToggle(domain)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      selected
                        ? 'bg-blue-accent text-navy-900 border-blue-accent font-bold shadow-md'
                        : 'bg-navy-900 text-slate-300 border-navy-700 hover:border-slate-500'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '} {domain}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-navy-700/60 flex items-center justify-end gap-3">
            <MotionButton type="submit" disabled={loading} size="md" className="gap-2 px-6">
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile'}</span>
            </MotionButton>
          </div>
        </form>
      </MotionCard>
    </PageTransition>
  );
}
