export interface SkillRadarPosition {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface SkillRadarSkill {
  id: string;
  positionId: string;
  name: string;
  description: string | null;
  keywords: string[];
  weight: number;
  isActive: boolean;
}

export interface AdminSkillRadarPosition extends SkillRadarPosition {
  skills: SkillRadarSkill[];
}

export interface PositionPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface PositionSkillPayload {
  name: string;
  description?: string;
  keywords?: string[];
  weight?: number;
  isActive?: boolean;
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
