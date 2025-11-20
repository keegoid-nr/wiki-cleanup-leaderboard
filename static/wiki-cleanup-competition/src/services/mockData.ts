import type { PageUpdate, BonusSession, UserInfo } from '../types';
import type { ContestConfig } from './config';

const mockUsers: UserInfo[] = [
    { name: 'Ada Lovelace', username: 'alovelace', avatar: 'https://i.pravatar.cc/150?u=ada' },
    { name: 'Grace Hopper', username: 'ghopper', avatar: 'https://i.pravatar.cc/150?u=grace' },
    { name: 'Margaret Hamilton', username: 'mhamilton', avatar: 'https://i.pravatar.cc/150?u=margaret' },
    { name: 'Katherine Johnson', username: 'kjohnson', avatar: 'https://i.pravatar.cc/150?u=katherine' },
    { name: 'Dorothy Vaughan', username: 'dvaughan', avatar: 'https://i.pravatar.cc/150?u=dorothy' },
    { name: 'Mary Jackson', username: 'mjackson', avatar: 'https://i.pravatar.cc/150?u=mary' },
    { name: 'Hedy Lamarr', username: 'hlamarr', avatar: 'https://i.pravatar.cc/150?u=hedy' },
    { name: 'Radia Perlman', username: 'rperlman', avatar: 'https://i.pravatar.cc/150?u=radia' },
    { name: 'Annie Easley', username: 'aeasley', avatar: 'https://i.pravatar.cc/150?u=annie' },
    { name: 'Shafi Goldwasser', username: 'sgoldwasser', avatar: 'https://i.pravatar.cc/150?u=shafi' },
    { name: 'John von Neumann', username: 'jneumann', avatar: 'https://i.pravatar.cc/150?u=john' },
    { name: 'Vint Cerf', username: 'vcerf', avatar: 'https://i.pravatar.cc/150?u=vint' },
];

export const getMockBonusSessions = async (): Promise<BonusSession[]> => {
    console.log('[MOCK] Generating mock bonus sessions...');
    const now = new Date();
    const sessions: BonusSession[] = [];
    const sessionCount = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < sessionCount; i++) {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const startTime = new Date(now.getTime() - (Math.random() * 110 + 10) * 60000);
        const endTime = new Date(startTime.getTime() + 60 * 60000);
        if (!sessions.some(s => s.user === user.username)) {
            sessions.push({ user: user.username, startTime, endTime });
        }
    }
    return sessions;
};

export const generateMockUpdates = (bonusSessions: BonusSession[], config: ContestConfig): Omit<PageUpdate, 'multiplier' | 'bonusType'>[] => {
    const pages = {
        'page-1': 'How to improve your workflow skills', 'page-2': 'Documentation best practices',
        'page-3': 'Advanced coding techniques', 'page-4': 'Onboarding New Support Engineers',
        'page-5': 'How to Use the Zendesk API', 'page-6': 'Internal Tooling Guide',
        'page-7': 'Customer Communication Guidelines', 'page-8': 'Incident Response Protocol',
        'page-9': 'Product X Troubleshooting', 'page-10': 'Performance Monitoring with New Relic',
    };
    const pageKeys = Object.keys(pages);
    const updates: Omit<PageUpdate, 'multiplier' | 'bonusType'>[] = [];
    
    // Minimal mock generation for brevity
    const [week1] = config.contests;
    if (week1) {
        for (let i = 0; i < 10; i++) {
            const user = mockUsers[i % mockUsers.length];
            const pageKey = pageKeys[i % pageKeys.length];
            updates.push({ 
                id: `update-${i}`, 
                pageId: pageKey, 
                pageTitle: pages[pageKey as keyof typeof pages], 
                pageUrl: '#', 
                user, 
                timestamp: new Date().toISOString(), 
                editCharacterCount: 1 
            });
        }
    }
    return updates;
};
