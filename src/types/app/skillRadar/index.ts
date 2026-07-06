export interface SkillRadarPosition {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface SkillRadarSkillScore {
  id: string;
  name: string;
  description: string | null;
  score: number;
  evidenceCount: number;
}

export interface UserSkillRadar {
  position: SkillRadarPosition;
  skills: SkillRadarSkillScore[];
}
