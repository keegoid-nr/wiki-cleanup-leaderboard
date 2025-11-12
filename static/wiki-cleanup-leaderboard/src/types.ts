export interface User {
  name: string;
  score: number;
  avatar: string;
}

export interface UserInfo {
    name: string;
    avatar: string;
}

export interface PageUpdate {
  id: string;
  pageTitle: string;
  pageUrl: string;
  user: UserInfo;
  timestamp: string;
  editCharacterCount: number;
}
