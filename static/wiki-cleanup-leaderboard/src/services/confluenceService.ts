

import type { PageUpdate, UserInfo, BonusSession, BonusType, Contest } from '../types';

// --- CONFIGURATION ---

let isForgeEnvironmentPromise: Promise<boolean> | null = null;
/**
 * Determines if the app runs with mock data or live Confluence data.
 * Checks for the presence of the Forge bridge, which is more reliable than
 * checking for a global `window.forge` object.
 */
export const detectForgeEnvironment = (): Promise<boolean> => {
    if (!isForgeEnvironmentPromise) {
        isForgeEnvironmentPromise = (async () => {
            try {
                // The dynamic import will fail in a non-Forge environment.
                const { view } = await import('@forge/bridge');
                // getContext will throw if not in a Forge context.
                await view.getContext();
                return true;
            } catch (e) {
                console.warn('Not in a Forge environment, falling back to mock data.');
                return false;
            }
        })();
    }
    return isForgeEnvironmentPromise;
};

let isProductionPromise: Promise<boolean> | null = null;
/**
 * Determines if the app is running in the production Confluence environment.
 * This is used to hide debug tools.
 * @returns {Promise<boolean>} - True if in production, false for sandbox or local dev.
 */
export const isProductionEnvironment = (): Promise<boolean> => {
    if (isProductionPromise) {
        return isProductionPromise;
    }

    isProductionPromise = (async () => {
        const isForge = await detectForgeEnvironment();
        if (!isForge) {
            return false; // Local development is not production
        }
        try {
            const { view } = await import('@forge/bridge');
            const context = await view.getContext();
            const siteUrl = context.siteUrl || '';
            // Production is defined as being in Forge AND NOT being in the sandbox.
            return !siteUrl.includes('newrelic-sandbox.atlassian.net');
        } catch (e) {
            console.warn('Could not determine production environment, assuming false.', e);
            return false;
        }
    })();
    return isProductionPromise;
};


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
        { name: 'Week 1', start: lastWeekStart, end: lastWeekEnd, prize: 'Three $100 Prizes for Top Editors!' },
        { name: 'Week 2', start: thisWeekStart, end: thisWeekEnd, prize: 'Three $100 Prizes for Top Editors!' },
        { name: 'Overall', start: lastWeekStart, end: overallEndDate, prize: '$250 Grand Prize Drawing' },
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
        { name: 'Week 1', start: new Date('2024-11-19T16:00:00.000Z'), end: new Date('2024-11-26T15:59:59.999Z'), prize: 'Three $100 Prizes for Top Editors!' },
        { name: 'Week 2', start: new Date('2024-11-26T16:00:00.000Z'), end: new Date('2024-12-05T01:00:00.000Z'), prize: 'Three $100 Prizes for Top Editors!' },
        { name: 'Overall', start: new Date('2024-11-19T16:00:00.000Z'), end: new Date('2024-12-05T01:00:00.000Z'), prize: '$250 Grand Prize Drawing' },
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
    const isForge = await detectForgeEnvironment();
    if (!isForge) {
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
    console.log('[MOCK] Generating mock bonus sessions...');
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
    console.log(`[MOCK] Generated ${sessions.length} unique bonus sessions.`);
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
    console.log('[MOCK] Getting mock competition updates...');
    await new Promise(resolve => setTimeout(resolve, 800));
    const bonusSessions = await getMockBonusSessions();
    const updates = generateMockUpdates(bonusSessions, config);
    return applyBonuses(updates, bonusSessions, config.criticalContent);
};

// --- LIVE IMPLEMENTATION FOR CONFLUENCE ENVIRONMENT ---

const getBonusSessions = async (): Promise<BonusSession[]> => {
    try {
        // Dynamic import to avoid breaking local dev server
        const { invoke } = await import('@forge/bridge');
        console.log('Invoking backend resolver to fetch bonus sessions CSV...');
        const csv = await invoke<string>('fetch-csv');
        
        if (typeof csv !== 'string' || !csv) {
          console.warn('CSV data from backend is empty or not a string.');
          return [];
        }
        
        const lines = csv.split('\n').slice(1); // skip header
        
        // Using a map to store only the first session per user per day to adhere to the "once per day" rule.
        const userSessions: { [key: string]: Date } = {};

        lines.forEach(line => {
            const [user, slackLink, timestamp] = line.split(',');
            if (user && timestamp) {
                const username = user.trim().replace(/^@/, '');
                const sessionDate = new Date(timestamp.trim());

                if (isNaN(sessionDate.getTime())) {
                    console.warn(`Invalid timestamp found in bonus sheet: "${timestamp.trim()}" for user "${username}"`);
                    return;
                }
                
                const userDayKey = `${username}-${sessionDate.getUTCFullYear()}-${sessionDate.getUTCMonth()}-${sessionDate.getUTCDate()}`;
                if (!userSessions[userDayKey]) {
                    userSessions[userDayKey] = sessionDate;
                }
            }
        });
        
        const sessions = Object.entries(userSessions).map(([key, startTime]) => {
            const username = key.substring(0, key.indexOf('-'));
            return {
                user: username,
                startTime: startTime,
                endTime: new Date(startTime.getTime() + 60 * 60 * 1000), // 60 minutes
            };
        });
        
        console.log(`Successfully parsed ${sessions.length} unique bonus sessions from backend.`);
        return sessions;
    } catch (error) {
        console.error('Failed to invoke resolver or parse bonus sessions:', error);
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch bonus sessions from backend. Details: ${message}`);
    }
};

const handleConfluenceResponse = async (response: Response, errorMessage: string) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error(`Confluence API request failed with status ${response.status} (Unauthorized/Forbidden). Please ensure you have permission to view content in the 'SE' space on this Confluence site.`);
        }
        const errorText = await response.text();
        throw new Error(`${errorMessage}: ${response.status} ${errorText}`);
    }
    return response.json();
}

const getLiveCompetitionUpdates = async (config: ContestConfig): Promise<PageUpdate[]> => {
    const { requestConfluence, view } = await import('@forge/bridge');
    const { siteUrl } = await view.getContext();
    const { contests, criticalContent } = config;

    const competitionStartDate = contests[0].start.toISOString().split('T')[0];
    const competitionEndDate = contests[contests.length-1].end.toISOString().split('T')[0];
    const cql = `space = "SE" AND lastModified >= "${competitionStartDate}" AND lastModified < "${competitionEndDate}"`;
    
    console.log(`[LIVE] Fetching pages with CQL: ${cql}`);
    const searchResponse = await requestConfluence(`/rest/api/content/search?cql=${cql}&limit=1000`);
    
    const searchResult = await handleConfluenceResponse(searchResponse, 'Confluence search failed');
    const pages = searchResult.results || [];
    console.log(`[LIVE] Found ${pages.length} pages updated during the competition.`);
    
    const stripHtml = (html: string) => html ? html.replace(/<[^>]*>?/gm, '') : '';
    
    const allPageUpdatesPromises = pages.map(async (page: any) => {
        console.log(`[LIVE] Processing page ID: ${page.id} ('${page.title}')`);
        const versionResponse = await requestConfluence(`/rest/api/content/${page.id}/version?limit=200`);
        
        if (!versionResponse.ok) {
            console.warn(`Could not fetch versions for page ${page.id}. Status: ${versionResponse.status} - ${await versionResponse.text()}`);
            if (versionResponse.status === 401 || versionResponse.status === 403) {
                // Silently fail for individual pages, as the user might not have access to all pages.
                return [];
            }
        }

        const versionResult = await versionResponse.json();
        const versions = versionResult.results || [];

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
                if (!currentRes.ok || !prevRes.ok) {
                    console.warn(`Failed to fetch content for page ${page.id}, version ${version.number}. Current status: ${currentRes.status}, Prev status: ${prevRes.status}`);
                    return null;
                };
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

// --- EXPORTED ROUTER FUNCTIONS ---

export const getCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    try {
        const config = await getConfig();
        const isForge = await detectForgeEnvironment();
        if (!isForge) {
            return getMockCompetitionUpdates(config);
        }
        return getLiveCompetitionUpdates(config);
    } catch (err) {
        console.error("Error in getCompetitionUpdates:", err);
        throw err;
    }
};

export const getBonusSessionsData = async (): Promise<BonusSession[]> => {
    try {
        const isForge = await detectForgeEnvironment();
        if (!isForge) {
          return getMockBonusSessions();
        }
        return getBonusSessions();
    } catch(err) {
        console.error("Error in getBonusSessionsData:", err);
        throw err;
    }
};
