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

export interface AdminSkillScoreEvent {
  id: string;
  userId: string;
  positionId: string;
  skillId: string;
  sourceType: string;
  sourceId: string | null;
  scoreDelta: number;
  scoreBefore: number;
  scoreAfter: number;
  confidence: number | null;
  reason: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  position: {
    id: string;
    name: string;
  };
  skill: {
    id: string;
    name: string;
  };
}

export interface AdminSkillScoreEventFilters {
  page?: number;
  limit?: number;
  userId?: string;
  positionId?: string;
  skillId?: string;
  sourceType?: string;
  search?: string;
}

export interface AdminSkillScoreEventPage {
  items: AdminSkillScoreEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface QuestionSkillMappingPayload {
  skillId: string;
  weight?: number;
}

export interface QuestionSkillSuggestion {
  skillId: string;
  skillName: string;
  positionId: string;
  positionName: string;
  confidence: number;
  reason: string;
  weight: number;
}

export interface PositionSkillSuggestion {
  name: string;
  description: string;
  keywords: string[];
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

export interface CareerAlignment {
  position: string;
  level: string;
  alignmentScore: number;
  strengths: string[];
  description: string;
  nextSteps: string[];
  generatedBy: "ai" | "fallback";
}
