export interface User {
  name: string;
  score: number;
  avatar: string;
}

export interface UserInfo {
    name: string;
    avatar: string;
}

export type BonusType = 'Focused Flow' | 'Critical Content Blitz';

export interface PageUpdate {
  id: string;
  pageId: string;
  pageTitle: string;
  pageUrl: string;
  user: UserInfo;
  timestamp: string;
  editCharacterCount: number;
  multiplier: number;
  bonusType?: BonusType;
}

export interface BonusSession {
  user: string;
  startTime: Date;
  endTime: Date;
}
