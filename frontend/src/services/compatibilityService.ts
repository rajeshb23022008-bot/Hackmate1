import type { UserProfile } from '../context/AuthContext';
import type { Team } from './firestoreService';

export interface CompatibilityResult {
  totalScore: number; // 0 to 100
  tierLabel: string;
  tierColor: string;
  skillScore: number;
  roleScore: number;
  academicScore: number;
  goalScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

/**
 * Calculates dynamic compatibility score between a User Profile and a Team
 */
export const calculateCompatibility = (
  user: Partial<UserProfile> | null | undefined,
  team: Partial<Team> | null | undefined
): CompatibilityResult => {
  if (!user || !team) {
    return {
      totalScore: 50,
      tierLabel: 'Moderate Fit',
      tierColor: 'text-amber-400',
      skillScore: 50,
      roleScore: 50,
      academicScore: 50,
      goalScore: 50,
      matchingSkills: [],
      missingSkills: team?.requiredSkills || [],
      recommendation: 'Complete your profile skills to unlock accurate AI compatibility scores.',
    };
  }

  const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
  const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const missingRoles = (team.missingRoles || []).map((r) => r.toLowerCase().trim());

  // 1. SKILL MATCH (40% Weight)
  const matchedSkillsSet = new Set<string>();
  const missingSkillsSet = new Set<string>();

  requiredSkills.forEach((req) => {
    const isMatch = userSkills.some((us) => us.includes(req) || req.includes(us));
    if (isMatch) {
      matchedSkillsSet.add(req);
    } else {
      missingSkillsSet.add(req);
    }
  });

  // Also check if any of user's skills match keywords in team description or problem statement
  const teamText = `${team.description || ''} ${team.problemStatement || ''}`.toLowerCase();
  userSkills.forEach((us) => {
    if (teamText.includes(us) && us.length > 2) {
      matchedSkillsSet.add(us);
    }
  });

  const matchingSkills = Array.from(matchedSkillsSet);
  const missingSkills = Array.from(missingSkillsSet);

  let skillScore = 60; // base score if no explicit required skills defined
  if (requiredSkills.length > 0) {
    const matchRatio = matchingSkills.length / Math.max(1, requiredSkills.length);
    skillScore = Math.min(100, Math.round(matchRatio * 100));
  } else if (matchingSkills.length > 0) {
    skillScore = 85;
  }

  // 2. ROLE GAP FIT (25% Weight)
  let roleScore = 60;
  const userRole = (user.role || '').toLowerCase();
  if (missingRoles.length > 0 && userRole) {
    const matchesRole = missingRoles.some(
      (mr) => mr.includes(userRole) || userRole.includes(mr)
    );
    roleScore = matchesRole ? 95 : 65;
  } else if (userRole) {
    roleScore = 80;
  }

  // 3. ACADEMIC & DOMAIN FIT (20% Weight)
  let academicScore = 70;
  const userCollege = (user.college || '').toLowerCase();
  const teamCollege = (team.college || '').toLowerCase();

  if (userCollege && teamCollege && (userCollege.includes(teamCollege) || teamCollege.includes(userCollege))) {
    academicScore = 95; // Same institute bonus!
  } else if (user.year || user.department) {
    academicScore = 80;
  }

  // 4. GOAL & BIO SYNERGY (15% Weight)
  let goalScore = 65;
  const userBio = (user.bio || '').toLowerCase();
  if (userBio && teamText) {
    // Check overlap of meaningful words
    const bioWords = userBio.split(/\W+/).filter((w) => w.length > 3);
    const overlapCount = bioWords.filter((w) => teamText.includes(w)).length;
    if (overlapCount > 2) {
      goalScore = 95;
    } else if (overlapCount > 0) {
      goalScore = 80;
    }
  }

  // Weighted Total Score
  const totalScore = Math.min(
    99,
    Math.max(
      35,
      Math.round(
        skillScore * 0.4 + roleScore * 0.25 + academicScore * 0.2 + goalScore * 0.15
      )
    )
  );

  // Determine Tier Label & Color
  let tierLabel = 'Moderate Fit 👍';
  let tierColor = 'text-amber-400';

  if (totalScore >= 88) {
    tierLabel = 'Perfect Match 🔥';
    tierColor = 'text-emerald-400';
  } else if (totalScore >= 75) {
    tierLabel = 'Strong Synergy ⚡';
    tierColor = 'text-blue-accent';
  } else if (totalScore < 55) {
    tierLabel = 'Skill Growth Potential 🚀';
    tierColor = 'text-slate-400';
  }

  // Generate dynamic recommendation insights
  let recommendation = '';
  if (totalScore >= 88) {
    recommendation = `Outstanding fit! ${user.displayName || 'This hacker'} brings key skills (${matchingSkills.join(', ') || 'specialized tech'}) that align directly with team "${team.name || 'this team'}". Highly recommended to team up!`;
  } else if (totalScore >= 75) {
    recommendation = `Great synergy. ${user.displayName || 'This candidate'} fits the team's core technical requirements with strong potential for collaboration on "${team.hackathon || 'the hackathon project'}".`;
  } else {
    recommendation = `Solid potential. Team up to combine complementary skill sets and accelerate project delivery for "${team.hackathon || 'the event'}".`;
  }

  return {
    totalScore,
    tierLabel,
    tierColor,
    skillScore,
    roleScore,
    academicScore,
    goalScore,
    matchingSkills,
    missingSkills,
    recommendation,
  };
};
