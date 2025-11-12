
import type { PageUpdate, EditType, BonusType, UserInfo } from '../types';

const MOCK_USERS: UserInfo[] = [
  { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=bob' },
  { name: 'Charlie Brown', avatar: 'https://i.pravatar.cc/150?u=charlie' },
  { name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=diana' },
  { name: 'Ethan Davis', avatar: 'https://i.pravatar.cc/150?u=ethan' },
  { name: 'Fiona Garcia', avatar: 'https://i.pravatar.cc/150?u=fiona' },
];

const MOCK_PAGES: string[] = [
  'Troubleshooting Guide: API Gateway',
  'Onboarding New Support Engineers',
  'Best Practices for Ticket Escalation',
  'SE Internal Knowledge Base Index',
  'How to Use the Staging Environment',
  'Customer Communication Templates',
  'Release Notes v2.5.1',
  'Common SQL Queries for Support',
  'Debugging Client-Side Performance Issues',
  'Product Feature Deep Dive: Analytics',
];

const EDIT_TYPES: EditType[] = ['Typo Fix', 'Link Update', 'Formatting', 'Minor Content'];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateMockUpdate = (index: number): PageUpdate => {
  const bonusRoll = Math.random();
  let bonusType: BonusType = null;
  if (bonusRoll > 0.9) {
    bonusType = 'CRITICAL_BLITZ';
  } else if (bonusRoll > 0.8) {
    bonusType = 'FOCUSED_FLOW';
  }

  const now = new Date();
  const randomMinutesAgo = Math.floor(Math.random() * 8 * 60); // Edits from the last 8 hours
  now.setMinutes(now.getMinutes() - randomMinutesAgo);
  
  const editCharacterCount = Math.floor(Math.random() * 50) + 1; // 1 to 50 chars to get some below 10

  return {
    id: `update-${Date.now()}-${index}`,
    pageTitle: getRandomElement(MOCK_PAGES),
    user: getRandomElement(MOCK_USERS),
    editType: getRandomElement(EDIT_TYPES),
    bonusType: bonusType,
    timestamp: now.toISOString(),
    editCharacterCount,
  };
};

export const getTodaysUpdates = (): Promise<PageUpdate[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const updateCount = Math.floor(Math.random() * 25) + 10; // 10 to 35 updates
      const updates = Array.from({ length: updateCount }, (_, i) => generateMockUpdate(i))
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(updates);
    }, 800); // Simulate network delay
  });
};