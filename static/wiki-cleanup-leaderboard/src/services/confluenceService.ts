import type { PageUpdate, UserInfo, BonusSession, BonusType, Contest } from '../types';

// --- CONFIGURATION ---

/**
 * Determines if the app runs with mock data or live Confluence data.
 * This is automatically determined by the hostname.
 */
const IS_MOCK = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/**
 * URL for the Google Sheet that tracks "Focused Flow" bonus sessions.
 * To get this URL:
 * 1. In your Google Sheet, go to `File > Share > Publish to web`.
 * 2. Select the correct sheet tab.
 * 3. Choose "Comma-separated values (.csv)".
 * 4. Click "Publish" and copy the generated link here.
 * IMPORTANT: The sheet must have three columns in this order: "User", "slack link", "timestamp".
 */
const FOCUSED_FLOW_GOOGLE_SHEET_URL: string = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRgZHTLRhCJm38SqzQOpmU7_z4OeT-UNsEVGxF1K3WN6UkmCBbFASEqeXN9Yyf89ShrWHnbckVkBhou/pub?gid=0&single=true&output=csv';

/**
 * An array of Confluence page IDs that are eligible for the "Critical Content Blitz" bonus.
 * To find a page ID:
 * 1. Go to the Confluence page.
 * 2. Click `... > Page Information`.
 * 3. The page ID is in the URL (e.g., `pageId=12345678`).
 */
const CRITICAL_CONTENT_PAGE_IDS = ['12345678', '87654321', '55555555'];

// --- END OF CONFIGURATION ---

export type ContestConfig = {
    contests: Contest[];
    criticalContent: {
        pageIds: Set<string>;
        date: Date;
    };
};

const getDynamicContestConfig = (): ContestConfig => {
    const getStartOfWeekUTC = (date: Date): Date => {
        const d = new Date(date.getTime());
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day; // adjust to Sunday
        const startOfWeek = new Date(d.setUTCDate(diff));
        startOfWeek.setUTCHours(0, 0, 0, 0);
        return startOfWeek;
    };

    const now = new Date();
    const thisWeekStart = getStartOfWeekUTC(now);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setUTCDate(thisWeekStart.getUTCDate() + 6);
    thisWeekEnd.setUTCHours(23, 59, 59, 999);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setUTCDate(thisWeekStart.getUTCDate() - 7);
    const lastWeekEnd = new Date(lastWeekStart);
    lastWeekEnd.setUTCDate(lastWeekStart.getUTCDate() + 6);
    lastWeekEnd.setUTCHours(23, 59, 59, 999);

    const overallEndDate = new Date(lastWeekStart);
    overallEndDate.setUTCDate(lastWeekStart.getUTCDate() + 16); // 17 days total
    overallEndDate.setUTCHours(23, 59, 59, 999);

    const criticalContentBlitzDateObj = new Date(lastWeekStart.getTime() + (24 * 60 * 60 * 1000)); // Monday of "Week 1"

    const contests: Contest[] = [
        { name: 'Week 1', start: lastWeekStart, end: lastWeekEnd, prize: '$100 Weekly Prize' },
        { name: 'Week 2', start: thisWeekStart, end: thisWeekEnd, prize: '$100 Weekly Prize' },
        { name: 'Overall', start: lastWeekStart, end: overallEndDate, prize: '$250 Grand Prize' },
    ];

    return {
        contests,
        criticalContent: {
            pageIds: new Set(['page-1', 'page-4', 'page-8']),
            date: criticalContentBlitzDateObj,
        },
    };
};

const getStaticContestConfig = (): ContestConfig => {
    const contests: Contest[] = [
        { name: 'Week 1', start: new Date('2024-11-19T00:00:00.000Z'), end: new Date('2024-11-25T23:59:59.999Z'), prize: '$100 Weekly Prize' },
        { name: 'Week 2', start: new Date('2024-11-26T00:00:00.000Z'), end: new Date('2024-12-02T23:59:59.999Z'), prize: '$100 Weekly Prize' },
        { name: 'Overall', start: new Date('2024-11-19T00:00:00.000Z'), end: new Date('2024-12-05T23:59:59.999Z'), prize: '$250 Grand Prize' },
    ];

    const criticalContentBlitzDateObj = new Date('2024-12-02T00:00:00Z');

    return {
        contests,
        criticalContent: {
            pageIds: new Set(CRITICAL_CONTENT_PAGE_IDS),
            date: criticalContentBlitzDateObj,
        },
    };
};

let configPromise: Promise<ContestConfig> | null = null;

const fetchAndSetConfig = async (): Promise<ContestConfig> => {
    if (IS_MOCK) {
        return getDynamicContestConfig();
    }

    // Using a dynamic import for the Forge bridge to prevent it from being loaded in a non-Forge environment (like localhost)
    const { view } = await import('@forge/bridge');
    const context = await view.getContext();
    const siteUrl = context.siteUrl || '';

    if (siteUrl.includes('newrelic-sandbox.atlassian.net')) {
        return getDynamicContestConfig();
    }

    return getStaticContestConfig();
};


export const getConfig = (): Promise<ContestConfig> => {
    if (!configPromise) {
        configPromise = fetchAndSetConfig();
    }
    return configPromise;
};

// --- MOCK IMPLEMENTATION FOR LOCAL DEVELOPMENT ---

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

const getMockBonusSessions = async (): Promise<BonusSession[]> => {
    const now = new Date();
    const sessions: BonusSession[] = [];
    const sessionCount = Math.floor(Math.random() * 2) + 3;
    for (let i = 0; i < sessionCount; i++) {
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const startTime = new Date(now.getTime() - (Math.random() * 110 + 10) * 60000);
        const endTime = new Date(startTime.getTime() + 60 * 60000);
        if (!sessions.some(s => s.user === user.username && s.startTime.toDateString() === startTime.toDateString())) {
            sessions.push({ user: user.username, startTime, endTime });
        }
    }
    return sessions;
};

const generateMockUpdates = (bonusSessions: BonusSession[], config: ContestConfig): Omit<PageUpdate, 'multiplier' | 'bonusType'>[] => {
    const pages = {
        'page-1': 'How to improve your workflow skills', 'page-2': 'Documentation best practices',
        'page-3': 'Advanced coding techniques', 'page-4': 'Onboarding New Support Engineers',
        'page-5': 'How to Use the Zendesk API', 'page-6': 'Internal Tooling Guide',
        'page-7': 'Customer Communication Guidelines', 'page-8': 'Incident Response Protocol',
        'page-9': 'Product X Troubleshooting', 'page-10': 'Performance Monitoring with New Relic',
    };
    const pageKeys = Object.keys(pages);
    const updates: Omit<PageUpdate, 'multiplier' | 'bonusType'>[] = [];
    const [week1, week2] = config.contests;

    if (week1) {
        for (let i = 0; i < 30; i++) {
            const user = mockUsers[i % mockUsers.length];
            const pageKey = pageKeys[i % pageKeys.length];
            const timestamp = new Date(week1.start.getTime() + Math.random() * (week1.end.getTime() - week1.start.getTime()));
            updates.push({ id: `update-week1-${i}`, pageId: pageKey, pageTitle: pages[pageKey as keyof typeof pages], pageUrl: '#', user, timestamp: timestamp.toISOString(), editCharacterCount: Math.floor(Math.random() * 400) + 10 });
        }
    }

    if (week2) {
        const now = new Date();
        for (let i = 0; i < 20; i++) {
            const user = mockUsers[(i + 5) % mockUsers.length];
            const pageKey = pageKeys[(i + 3) % pageKeys.length];
            const timeSoFar = now.getTime() > week2.start.getTime() ? now.getTime() - week2.start.getTime() : 0;
            const timestamp = new Date(week2.start.getTime() + Math.random() * timeSoFar);
            updates.push({ id: `update-week2-${i}`, pageId: pageKey, pageTitle: pages[pageKey as keyof typeof pages], pageUrl: '#', user, timestamp: timestamp.toISOString(), editCharacterCount: Math.floor(Math.random() * 400) + 10 });
        }
    }

    bonusSessions.forEach((session, index) => {
        const bonusTimestamp = new Date(session.startTime.getTime() + 15 * 60000);
        updates.push({ id: `bonus-update-${index}`, pageId: pageKeys[index % pageKeys.length], pageTitle: pages[pageKeys[index % pageKeys.length] as keyof typeof pages], pageUrl: '#', user: mockUsers.find(u => u.username === session.user) || mockUsers[0], timestamp: bonusTimestamp.toISOString(), editCharacterCount: Math.floor(Math.random() * 200) + 50 });
    });

    const { pageIds, date } = config.criticalContent;
    Array.from(pageIds).forEach((pageId, i) => {
        updates.push({ id: `blitz-update-${i}`, pageId: pageId, pageTitle: pages[pageId as keyof typeof pages], pageUrl: '#', user: mockUsers[i % mockUsers.length], timestamp: `${date.toISOString().split('T')[0]}T1${i}:00:00Z`, editCharacterCount: Math.floor(Math.random() * 500) + 100 });
    });

    return updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const getMockCompetitionUpdates = async (config: ContestConfig): Promise<PageUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const bonusSessions = await getMockBonusSessions();
    const updates = generateMockUpdates(bonusSessions, config);
    return applyBonuses(updates, bonusSessions, config.criticalContent);
};

// --- LIVE IMPLEMENTATION FOR CONFLUENCE ENVIRONMENT ---

const getBonusSessions = async (): Promise<BonusSession[]> => {
    if (!FOCUSED_FLOW_GOOGLE_SHEET_URL) {
        console.warn('Focused Flow Google Sheet URL is not configured.');
        return [];
    }
    try {
        const response = await fetch(FOCUSED_FLOW_GOOGLE_SHEET_URL);
        if (!response.ok) return [];
        const csv = await response.text();
        const lines = csv.split('\n').slice(1); // skip header

        // Using a map to store only the first session per user per day to adhere to the "once per day" rule.
        const userSessions: { [key: string]: Date } = {};

        lines.forEach(line => {
            const [user, slackLink, timestamp] = line.split(',');
            if (user && timestamp) {
                const username = user.trim().replace(/^@/, '');
                const sessionDate = new Date(timestamp.trim());

                if (isNaN(sessionDate.getTime())) {
                    console.warn(`Invalid timestamp found in bonus sheet: "${timestamp.trim()}"`);
                    return;
                }

                const userDayKey = `${username}-${sessionDate.getUTCFullYear()}-${sessionDate.getUTCMonth()}-${sessionDate.getUTCDate()}`;
                if (!userSessions[userDayKey]) {
                    userSessions[userDayKey] = sessionDate;
                }
            }
        });

        return Object.entries(userSessions).map(([key, startTime]) => {
            const username = key.substring(0, key.indexOf('-'));
            return {
                user: username,
                startTime: startTime,
                endTime: new Date(startTime.getTime() + 60 * 60 * 1000), // 60 minutes
            };
        });
    } catch (error) {
        console.error('Failed to fetch or parse bonus sessions:', error);
        return [];
    }
};

const getLiveCompetitionUpdates = async (config: ContestConfig): Promise<PageUpdate[]> => {
    const { requestConfluence, view } = await import('@forge/bridge');
    const { siteUrl } = await view.getContext();
    const { contests, criticalContent } = config;

    const competitionStartDate = contests[0].start.toISOString().split('T')[0];
    const competitionEndDate = contests[contests.length-1].end.toISOString().split('T')[0];
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
            return versionDate >= contests[0].start && versionDate < contests[contests.length-1].end;
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

                const avatarPath = currentData.version?.by?.profilePicture?.path;
                const user: UserInfo = {
                    name: currentData.version?.by?.displayName ?? 'Unknown User',
                    username: currentData.version?.by?.username ?? '',
                    avatar: avatarPath ? `${siteUrl}${avatarPath}` : ''
                };

                return { id: `${page.id}-${version.number}`, pageId: page.id, pageTitle: page.title, pageUrl: `${siteUrl}${page._links.webui}`, user, timestamp: version.when, editCharacterCount: charCount };
            } catch (error) {
                console.error(`Error processing version ${version.number} for page ${page.id}:`, error);
                return null;
            }
        });
        return (await Promise.all(contentFetchPromises)).filter(Boolean) as Omit<PageUpdate, 'multiplier' | 'bonusType'>[];
    });

    const [nestedUpdates, bonusSessions] = await Promise.all([ Promise.all(allPageUpdatesPromises), getBonusSessions() ]);
    const allUpdates = nestedUpdates.flat();
    const updatesWithBonuses = applyBonuses(allUpdates, bonusSessions, criticalContent);
    return updatesWithBonuses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// --- SHARED BONUS LOGIC ---

const isSameUTCDate = (dateA: Date, dateB: Date): boolean =>
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate();

const applyBonuses = ( updates: Omit<PageUpdate, 'multiplier' | 'bonusType'>[], bonusSessions: BonusSession[], criticalContent: { pageIds: Set<string>; date: Date } ): PageUpdate[] => {
    return updates.map(update => {
        let multiplier = 1;
        let bonusType: BonusType | undefined;
        const updateTimestamp = new Date(update.timestamp);

        if ( criticalContent.pageIds.has(update.pageId) && isSameUTCDate(updateTimestamp, criticalContent.date) ) {
            multiplier = 3;
            bonusType = 'Critical Content Blitz';
        }

        const userSession = bonusSessions.find( session => session.user === update.user.username && updateTimestamp >= session.startTime && updateTimestamp <= session.endTime );
        if (userSession) {
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
    const config = await getConfig();
    if (IS_MOCK) {
        return getMockCompetitionUpdates(config);
    }
    return getLiveCompetitionUpdates(config);
};
