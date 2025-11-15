import type { PageUpdate, UserInfo, BonusSession, BonusType } from '../types';

// --- CONFIGURATION - PASTE YOUR DATA HERE ---

// To get this URL: In Google Sheets, go to File > Share > Publish to web.
// Select "Entire Document" and "Comma-separated values (.csv)", then publish.
const FOCUSED_FLOW_GOOGLE_SHEET_URL = 'YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE';

// A list of Confluence page IDs that qualify for the Critical Content Blitz.
const CRITICAL_CONTENT_PAGE_IDS = ['12345678', '87654321', '55555555'];

// The date for the Critical Content Blitz (YYYY-MM-DD format).
const CRITICAL_CONTENT_BLITZ_DATE = '2024-12-02';


// --- MOCK IMPLEMENTATION FOR LOCAL DEVELOPMENT ---

const mockUsers: UserInfo[] = [
    { name: 'Ada Lovelace', avatar: 'https://i.pravatar.cc/150?u=ada' },
    { name: 'Grace Hopper', avatar: 'https://i.pravatar.cc/150?u=grace' },
    { name: 'Margaret Hamilton', avatar: 'https://i.pravatar.cc/150?u=margaret' },
    { name: 'Katherine Johnson', avatar: 'https://i.pravatar.cc/150?u=katherine' },
    { name: 'Dorothy Vaughan', avatar: 'https://i.pravatar.cc/150?u=dorothy' },
    { name: 'Mary Jackson', avatar: 'https://i.pravatar.cc/150?u=mary' },
    { name: 'Hedy Lamarr', avatar: 'https://i.pravatar.cc/150?u=hedy' },
    { name: 'Radia Perlman', avatar: 'https://i.pravatar.cc/150?u=radia' },
    { name: 'Annie Easley', avatar: 'https://i.pravatar.cc/150?u=annie' },
    { name: 'Shafi Goldwasser', avatar: 'https://i.pravatar.cc/150?u=shafi' },
    { name: 'Joi Converse', avatar: 'https://i.pravatar.cc/150?u=joi' },
    { name: 'Keegan Mullaney', avatar: 'https://i.pravatar.cc/150?u=keegan' },
];

const getMockBonusSessions = async (): Promise<BonusSession[]> => {
    const now = new Date();
    const sessions: BonusSession[] = [];

    // Create 3-4 random sessions for different users in the last few hours
    const sessionCount = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < sessionCount; i++) {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        // Start time between 10 and 120 minutes ago
        const startTime = new Date(now.getTime() - (Math.random() * 110 + 10) * 60000); 
        const endTime = new Date(startTime.getTime() + 60 * 60000);
        
        // Avoid creating duplicate sessions for the same user on the same day
        if (!sessions.some(s => s.user === user.name && s.startTime.toDateString() === startTime.toDateString())) {
            sessions.push({ user: user.name, startTime, endTime });
        }
    }
    return sessions;
};

const getMockCriticalContent = () => ({
    pageIds: new Set(['page-1', 'page-4', 'page-8']), // Mark a few pages as critical
    date: new Date(`${CRITICAL_CONTENT_BLITZ_DATE}T00:00:00Z`),
});

const generateMockUpdates = (bonusSessions: BonusSession[]): Omit<PageUpdate, 'multiplier' | 'bonusType'>[] => {
    const pages = {
        'page-1': 'How to improve your workflow skills', // Critical page
        'page-2': 'Documentation best practices',
        'page-3': 'Advanced coding techniques',
        'page-4': 'Onboarding New Support Engineers', // Critical page
        'page-5': 'How to Use the Zendesk API',
        'page-6': 'Internal Tooling Guide',
        'page-7': 'Customer Communication Guidelines',
        'page-8': 'Incident Response Protocol', // Critical page
        'page-9': 'Product X Troubleshooting',
        'page-10': 'Performance Monitoring with New Relic',
    };
    const pageKeys = Object.keys(pages);
    const updates: Omit<PageUpdate, 'multiplier' | 'bonusType'>[] = [];
    const now = Date.now();

    // Generate a base of 50 random updates
    for (let i = 0; i < 50; i++) {
        const user = mockUsers[i % mockUsers.length];
        const pageKey = pageKeys[i % pageKeys.length];
        const timestamp = new Date(now - i * 300000); // Stagger updates every 5 minutes
        
        updates.push({
            id: `update-${i}`,
            pageId: pageKey,
            pageTitle: pages[pageKey as keyof typeof pages],
            pageUrl: '#',
            user: user,
            timestamp: timestamp.toISOString(),
            editCharacterCount: Math.floor(Math.random() * 400) + 10,
        });
    }

    // Generate specific updates that fall into bonus sessions
    bonusSessions.forEach((session, index) => {
        // Create an update that is 15 minutes into the session
        const bonusTimestamp = new Date(session.startTime.getTime() + 15 * 60000);
        updates.push({
            id: `bonus-update-${index}`,
            pageId: pageKeys[index % pageKeys.length],
            pageTitle: pages[pageKeys[index % pageKeys.length] as keyof typeof pages],
            pageUrl: '#',
            user: mockUsers.find(u => u.name === session.user) || mockUsers[0],
            timestamp: bonusTimestamp.toISOString(),
            editCharacterCount: Math.floor(Math.random() * 200) + 50,
        });
    });

    // Ensure there are a few updates on the blitz date for critical pages
    const criticalPageIds = getMockCriticalContent().pageIds;
    Array.from(criticalPageIds).forEach((pageId, i) => {
        updates.push({
            id: `blitz-update-${i}`,
            pageId: pageId,
            pageTitle: pages[pageId as keyof typeof pages],
            pageUrl: '#',
            user: mockUsers[i % mockUsers.length],
            timestamp: `${CRITICAL_CONTENT_BLITZ_DATE}T1${i}:00:00Z`,
            editCharacterCount: Math.floor(Math.random() * 500) + 100,
        });
    });
    
    return updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getMockCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (Math.random() < 0.1) throw new Error("Mock API Error.");

    const bonusSessions = await getMockBonusSessions();
    const updates = generateMockUpdates(bonusSessions);
    const criticalContent = getMockCriticalContent();

    return applyBonuses(updates, bonusSessions, criticalContent);
};


// --- LIVE IMPLEMENTATION FOR CONFLUENCE ENVIRONMENT ---

const getBonusSessions = async (): Promise<BonusSession[]> => {
    if (!FOCUSED_FLOW_GOOGLE_SHEET_URL || FOCUSED_FLOW_GOOGLE_SHEET_URL === 'YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE') {
        console.warn('Focused Flow Google Sheet URL is not configured.');
        return [];
    }
    try {
        const response = await fetch(FOCUSED_FLOW_GOOGLE_SHEET_URL);
        if (!response.ok) return [];

        const csv = await response.text();
        const lines = csv.split('\n').slice(1); // Skip header row
        const userSessions: { [key: string]: Date } = {};

        lines.forEach(line => {
            const [timestamp, user] = line.split(',');
            if (timestamp && user) {
                const sessionDate = new Date(timestamp);
                const userKey = `${user.trim()}-${sessionDate.toDateString()}`;
                // Keep only the first session per user per day
                if (!userSessions[userKey]) {
                    userSessions[userKey] = sessionDate;
                }
            }
        });

        return Object.values(userSessions).map(startTime => ({
            user: Object.keys(userSessions).find(key => userSessions[key] === startTime)!.split('-')[0],
            startTime,
            endTime: new Date(startTime.getTime() + 60 * 60000), // 60 minutes
        }));
    } catch (error) {
        console.error('Failed to fetch or parse bonus sessions:', error);
        return [];
    }
};

const getCriticalContent = () => ({
    pageIds: new Set(CRITICAL_CONTENT_PAGE_IDS),
    date: new Date(`${CRITICAL_CONTENT_BLITZ_DATE}T00:00:00Z`),
});


const getLiveCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    const { requestConfluence, view } = await import('@forge/bridge');
    const { siteUrl } = await view.getContext();

    const competitionStartDate = '2024-11-19';
    const competitionEndDate = '2024-12-05';

    const cql = `space = "SE" AND lastModified >= "${competitionStartDate}" AND lastModified < "${competitionEndDate}"`;
    const searchResponse = await requestConfluence(`/rest/api/content/search?cql=${cql}&limit=200`);
    const searchResult = await searchResponse.json();
    const pages = searchResult.results;
    
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, '') : '';
    
    const allPageUpdatesPromises = pages.map(async (page: any) => {
        const versionResponse = await requestConfluence(`/rest/api/content/${page.id}/version?limit=200`);
        const versionResult = await versionResponse.json();
        const versions = versionResult.results;

        const competitionVersions = versions.filter((v: any) => {
            const versionDate = new Date(v.when);
            return versionDate >= new Date(competitionStartDate) && versionDate < new Date(competitionEndDate);
        });

        if (competitionVersions.length === 0) return [];
        
        const contentFetchPromises = competitionVersions.map(async (version: any) => {
            if (version.number === 1) return null;
            try {
                const [currentRes, prevRes] = await Promise.all([
                    requestConfluence(`/rest/api/content/${page.id}?version=${version.number}&expand=body.storage,version.by`),
                    requestConfluence(`/rest/api/content/${page.id}?version=${version.number - 1}&expand=body.storage`)
                ]);

                if (!currentRes.ok || !prevRes.ok) return null;

                const currentData = await currentRes.json();
                const prevData = await prevRes.json();
                const charCount = Math.abs(stripHtml(currentData.body?.storage?.value).length - stripHtml(prevData.body?.storage?.value).length);
                
                const user: UserInfo = {
                    name: currentData.version?.by?.displayName ?? 'Unknown User',
                    avatar: `${siteUrl}${currentData.version?.by?.profilePicture?.path}` ?? ''
                };

                return {
                    id: `${page.id}-${version.number}`,
                    pageId: page.id,
                    pageTitle: page.title,
                    pageUrl: `${siteUrl}${page._links.webui}`,
                    user,
                    timestamp: version.when,
                    editCharacterCount: charCount,
                };
            } catch (error) {
                console.error(`Error processing version ${version.number} for page ${page.id}:`, error);
                return null;
            }
        });
        return (await Promise.all(contentFetchPromises)).filter(Boolean) as Omit<PageUpdate, 'multiplier' | 'bonusType'>[];
    });

    const [nestedUpdates, bonusSessions] = await Promise.all([
        Promise.all(allPageUpdatesPromises),
        getBonusSessions(),
    ]);

    const criticalContent = getCriticalContent();
    const allUpdates = nestedUpdates.flat();
    const updatesWithBonuses = applyBonuses(allUpdates, bonusSessions, criticalContent);
    
    return updatesWithBonuses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// --- SHARED BONUS LOGIC ---

/**
 * Compares two dates to see if they fall on the same day in UTC.
 * This prevents timezone issues when checking for the blitz day.
 */
const isSameUTCDate = (dateA: Date, dateB: Date): boolean => 
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate();

const applyBonuses = (
    updates: Omit<PageUpdate, 'multiplier' | 'bonusType'>[],
    bonusSessions: BonusSession[],
    criticalContent: { pageIds: Set<string>; date: Date }
): PageUpdate[] => {
    return updates.map(update => {
        let multiplier = 1;
        let bonusType: BonusType | undefined;
        const updateTimestamp = new Date(update.timestamp);

        // Check for Critical Content Blitz (3x points)
        if (
            criticalContent.pageIds.has(update.pageId) &&
            isSameUTCDate(updateTimestamp, criticalContent.date)
        ) {
            multiplier = 3;
            bonusType = 'Critical Content Blitz';
        }

        // Check for Focused Flow (2x points)
        const userSession = bonusSessions.find(
            session =>
                session.user === update.user.name &&
                updateTimestamp >= session.startTime &&
                updateTimestamp <= session.endTime
        );

        if (userSession) {
            // Apply Focused Flow bonus, but don't override the higher Critical Content bonus
            if (multiplier < 2) {
                multiplier = 2;
                bonusType = 'Focused Flow';
            }
        }
        
        return { ...update, multiplier, bonusType };
    });
};


// --- EXPORTED ROUTER FUNCTION ---

export const getCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return getMockCompetitionUpdates();
    }
    return getLiveCompetitionUpdates();
};
