
export interface User {
  name: string;
  score: number;
  avatar: string;
}

export interface UserInfo {
    name: string;
    avatar: string;
}

export type EditType = 'Typo Fix' | 'Link Update' | 'Formatting' | 'Minor Content';

export type BonusType = 'FOCUSED_FLOW' | 'CRITICAL_BLITZ' | null;

export interface PageUpdate {
  id: string;
  pageTitle: string;
  user: UserInfo;
  editType: EditType;
  bonusType: BonusType;
  timestamp: string;
  editCharacterCount: number;
}