import { createHash } from 'crypto';

export const MATCH_ALGORITHM_VERSION = 'v1';

export interface CandidateMatchInput {
  id: string;
  skills?: string | null;
  certificates?: string | null;
  experience?: string | null;
  experienceYears?: number | null;
  education?: string | null;
  preferredLocation?: string | null;
  preferredJobType?: string | null;
  expectedSalary?: number | null;
}

export interface JobMatchInput {
  id: string;
  skillsRequired?: string | null;
  tags?: string | string[] | null;
  description?: string | null;
  location?: string | null;
  type?: string | null;
  salary?: number | null;
  minExperienceYears?: number | null;
  educationRequirement?: string | null;
}

export interface MatchBreakdown {
  skills: number;
  experience: number;
  education: number;
  preferences: number;
}

export interface CalculatedMatch {
  candidateId: string;
  jobPostId: string;
  totalScore: number;
  algorithmVersion: string;
  breakdown: MatchBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
  inputFingerprint: string;
}

const aliases: Record<string, string> = {
  js: 'javascript',
  node: 'nodejs',
  'node.js': 'nodejs',
  'node js': 'nodejs',
  nodejs: 'nodejs',
  ts: 'typescript',
  reactjs: 'react',
  'react.js': 'react',
  'react js': 'react',
  'c#': 'csharp',
  csharp: 'csharp',
  'c++': 'cpp',
  '.net': 'dotnet',
  dotnet: 'dotnet',
  'asp.net': 'aspnet',
  'asp net': 'aspnet',
  aspnet: 'aspnet',
  postgres: 'postgresql',
  'sql server': 'sqlserver',
  mssql: 'sqlserver',
};

function withoutDiacritics(value: string): string {
  return value
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSkill(value: string): string {
  const normalized = withoutDiacritics(value)
    .toLowerCase()
    .replace(/c\s*#/g, 'csharp')
    .replace(/c\s*\+\+/g, 'cpp')
    .replace(/\.net/g, 'dotnet')
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return aliases[normalized] ?? normalized;
}

export function splitSkills(value?: string | string[] | null): string[] {
  if (!value) return [];
  let source: string[];
  if (Array.isArray(value)) {
    source = value;
  } else {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        source = Array.isArray(parsed) ? parsed : [value];
      } catch {
        source = [value];
      }
    } else {
      source = value.split(/[,;|\n/]+/);
    }
  }
  return [...new Set(source.map(String).map(normalizeSkill).filter(Boolean))];
}

function parseYears(value?: string | null): number | null {
  if (!value) return null;
  const match = withoutDiacritics(value)
    .toLowerCase()
    .match(/(\d+(?:[.,]\d+)?)\s*\+?\s*(?:years?|yrs?|nam)/);
  if (!match) return null;
  const years = Number(match[1].replace(',', '.'));
  return Number.isFinite(years) ? years : null;
}

function containsNormalized(haystack: string | null | undefined, needle: string | null | undefined): boolean {
  if (!haystack || !needle) return false;
  return normalizeSkill(haystack).includes(normalizeSkill(needle));
}

function calculatePreferences(candidate: CandidateMatchInput, job: JobMatchInput): number {
  let score = 0;
  if (candidate.preferredLocation && job.location) {
    if (containsNormalized(candidate.preferredLocation, job.location) || containsNormalized(job.location, candidate.preferredLocation)) {
      score += 4;
    }
  }
  if (candidate.preferredJobType && job.type && containsNormalized(candidate.preferredJobType, job.type)) {
    score += 3;
  }
  if (candidate.expectedSalary != null && job.salary != null && job.salary >= candidate.expectedSalary) {
    score += 3;
  }
  return score;
}

export function calculateMatch(candidate: CandidateMatchInput, job: JobMatchInput): CalculatedMatch {
  const requiredSkills = splitSkills(job.skillsRequired).length > 0
    ? splitSkills(job.skillsRequired)
    : splitSkills(job.tags);
  const candidateSkills = new Set([
    ...splitSkills(candidate.skills),
    ...splitSkills(candidate.certificates),
  ]);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.has(skill));
  const missingSkills = requiredSkills.filter((skill) => !candidateSkills.has(skill));
  const skills = requiredSkills.length === 0
    ? 0
    : Math.round((matchedSkills.length / requiredSkills.length) * 60);

  const requiredYears = job.minExperienceYears ?? parseYears(job.description);
  const candidateYears = candidate.experienceYears ?? parseYears(candidate.experience);
  const experience = requiredYears == null || candidateYears == null
    ? 0
    : requiredYears <= 0
      ? 20
      : Math.round(Math.min(candidateYears / requiredYears, 1) * 20);

  const education = job.educationRequirement && candidate.education &&
    containsNormalized(candidate.education, job.educationRequirement) ? 10 : 0;
  const preferences = calculatePreferences(candidate, job);
  const breakdown = { skills, experience, education, preferences };
  const totalScore = skills + experience + education + preferences;
  const reasonParts = [
    requiredSkills.length > 0
      ? `Khớp ${matchedSkills.length}/${requiredSkills.length} kỹ năng`
      : 'Tin chưa khai báo kỹ năng bắt buộc',
    requiredYears != null
      ? candidateYears != null
        ? `${candidateYears} năm kinh nghiệm trên yêu cầu ${requiredYears} năm`
        : 'Chưa có dữ liệu số năm kinh nghiệm'
      : 'Tin chưa khai báo yêu cầu kinh nghiệm',
    job.educationRequirement
      ? education > 0 ? 'Đạt yêu cầu học vấn' : 'Chưa khớp yêu cầu học vấn'
      : 'Tin chưa khai báo yêu cầu học vấn',
    preferences > 0 ? 'Có điểm phù hợp về ưu tiên cá nhân' : 'Chưa có dữ liệu ưu tiên cá nhân phù hợp',
  ];
  const fingerprintSource = JSON.stringify({
    algorithmVersion: MATCH_ALGORITHM_VERSION,
    candidate: {
      id: candidate.id,
      skills: candidate.skills ?? null,
      certificates: candidate.certificates ?? null,
      experience: candidate.experience ?? null,
      experienceYears: candidate.experienceYears ?? null,
      education: candidate.education ?? null,
      preferredLocation: candidate.preferredLocation ?? null,
      preferredJobType: candidate.preferredJobType ?? null,
      expectedSalary: candidate.expectedSalary ?? null,
    },
    job: {
      id: job.id,
      skillsRequired: job.skillsRequired ?? null,
      tags: job.tags ?? null,
      description: job.description ?? null,
      location: job.location ?? null,
      type: job.type ?? null,
      salary: job.salary ?? null,
      minExperienceYears: job.minExperienceYears ?? null,
      educationRequirement: job.educationRequirement ?? null,
    },
  });

  return {
    candidateId: candidate.id,
    jobPostId: job.id,
    totalScore,
    algorithmVersion: MATCH_ALGORITHM_VERSION,
    breakdown,
    matchedSkills,
    missingSkills,
    reason: reasonParts.join('; '),
    inputFingerprint: createHash('sha256').update(fingerprintSource).digest('hex'),
  };
}
