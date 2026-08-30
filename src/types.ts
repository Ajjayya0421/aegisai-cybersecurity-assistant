export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AnalysisCategory = 'message' | 'url' | 'log' | 'question';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  lastLoginAt: number;
  role?: string;
  securityScore: number;
  mfaEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  tags?: string[];
  suggestedFollowups?: string[];
  isSecurityWarning?: boolean;
}

export interface SecurityAnalysisResult {
  id: string;
  userId: string;
  category: AnalysisCategory;
  rawInput: string;
  riskLevel: RiskLevel;
  threatType: string;
  summary: string;
  explanation: string;
  warningSigns: string[];
  defensiveActions: {
    action: string;
    completed?: boolean;
  }[];
  technicalIndicators?: string[];
  mitreAttackTags?: string[];
  timestamp: number;
  bookmarked?: boolean;
}

export interface HistoryFilter {
  category?: AnalysisCategory | 'all';
  riskLevel?: RiskLevel | 'all';
  searchQuery: string;
}

export interface SecurityMetric {
  totalAnalyses: number;
  criticalThreatsBlocked: number;
  activeShieldStatus: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  postureScore: number;
}
