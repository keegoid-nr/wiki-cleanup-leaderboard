import type { PageUpdate, BonusSession, BonusType } from '../types';
import { getConfig, detectForgeEnvironment, ContestConfig, isProductionEnvironment } from './config';
import { getMockBonusSessions, generateMockUpdates } from './mockData';
import { getUserDetailsV1, searchPagesV1, getPageVersionsV2, getPageVersionV2ByNumber } from './confluenceApi';

export { getConfig, detectForgeEnvironment, isProductionEnvironment };

// --- HELPERS ---

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

        const userSession = bonusSessions.find( session => {
            // Match logic:
            // 1. Email prefix match (e.g. kmullaney matches kmullaney@newrelic.com)
            // 2. Exact username/account ID match (fallback)
            // 3. Name fuzzy match (fallback)
            
            const sessionUser = session.user.toLowerCase();
            const authorEmail = (update.user.email || '').toLowerCase();
            const authorUsername = update.user.username.toLowerCase();
            const authorName = update.user.name.toLowerCase();

            // 1. Email prefix match
            const emailMatch = authorEmail.startsWith(sessionUser) || authorEmail.startsWith(sessionUser + '@');
            
            // 2. Exact username/account ID match
            const usernameMatch = authorUsername === sessionUser;
            
            // 3. Name fuzzy match
            // Check if full name contains the handle (e.g. "Keegan Mullaney" contains "mullaney")
            const nameContainsMatch = authorName.includes(sessionUser);
            
            // Check first initial + last name (e.g. "Keegan Mullaney" -> "kmullaney")
            const nameParts = authorName.split(' ');
            let firstInitialLastNameMatch = false;
            if (nameParts.length >= 2) {
                const firstInitial = nameParts[0][0];
                const lastName = nameParts[nameParts.length - 1];
                const constructedHandle = `${firstInitial}${lastName}`;
                firstInitialLastNameMatch = constructedHandle === sessionUser;
            }

            // 4. Full name match (remove spaces)
            // e.g. "Joi Converse" -> "joiconverse"
            const fullNameNoSpaces = authorName.replace(/\s+/g, '');
            const fullNameMatch = fullNameNoSpaces === sessionUser;

            const isMatch = emailMatch || usernameMatch || nameContainsMatch || firstInitialLastNameMatch || fullNameMatch;
            
            if (isMatch && updateTimestamp >= session.startTime && updateTimestamp <= session.endTime) {
                console.log(`[Bonus] Matched session user "${session.user}" to author "${update.user.name}" (email: ${update.user.email})`);
                return true;
            }
            return false;
        });

        if (userSession) {
            if (multiplier < 2) {
                multiplier = 2;
                bonusType = 'Focused Flow';
            }
        }
        return { ...update, multiplier, bonusType };
    });
};

// --- LIVE LOGIC ---

const getBonusSessions = async (): Promise<BonusSession[]> => {
    try {
        const { invoke } = await import('@forge/bridge');
        const csvData = (await invoke('fetch-csv')) as string;
        if (!csvData) return [];
        
        const lines = csvData.split('\n').slice(1);
        const userSessions: { [key: string]: Date } = {};

        lines.forEach(line => {
            const [user, ,timestamp] = line.split(',');
            if (user && timestamp) {
                const username = user.trim().replace(/^@/, '');
                const sessionDate = new Date(timestamp.trim());
                if (!isNaN(sessionDate.getTime())) {
                    const key = `${username}-${sessionDate.toISOString().split('T')[0]}`;
                    // Keep the earliest session for the day if multiple exist
                    if (!userSessions[key] || sessionDate < userSessions[key]) {
                        userSessions[key] = sessionDate;
                    }
                }
            }
        });
        
        return Object.entries(userSessions).map(([key, startTime]) => ({
            user: key.split('-')[0],
            startTime,
            endTime: new Date(startTime.getTime() + 60 * 60 * 1000),
        }));
    } catch (error) {
        console.error('Bonus sessions error:', error);
        return [];
    }
};

const getLiveCompetitionUpdates = async (config: ContestConfig): Promise<PageUpdate[]> => {
    const { view } = await import('@forge/bridge');
    const { siteUrl } = await view.getContext();
    const { contests, criticalContent } = config;
    
    // 1. Search for Pages
    const start = contests[0].start.toISOString().split('T')[0];
    const end = contests[contests.length-1].end.toISOString().split('T')[0];
    const cql = `space = "SE2" AND type = "page" AND lastModified >= "${start}" AND lastModified < "${end}"`;
    
    console.info(`[LIVE] Fetching pages with CQL: ${cql}`);
    
    const pages = await searchPagesV1(cql, 1000);
    
    console.info(`[LIVE] Found ${pages.length} pages updated during the competition.`);

    const updatesPromises = pages.map(async (page: any) => {
        // 2. Get Version List (V2)
        const versions = await getPageVersionsV2(page.id);

        if (versions.length === 0) return [];
        
        // Filter for versions within the competition window
        // AND strictly exclude version 1 (page creation)
        const relevantVersions = versions.filter((v: any) => {
            const d = new Date(v.createdAt);
            return d >= contests[0].start && d < contests[contests.length-1].end && v.number > 1;
        });

        console.debug(`[LIVE] Page ${page.id}: ${relevantVersions.length} qualifying edits found.`);

        const versionUpdates = await Promise.all(relevantVersions.map(async (v: any) => {
            try {
                const user = await getUserDetailsV1(v.authorId, siteUrl);

                // Calculate character diff
                let points = 0;
                // Only calculate points for updates (version > 1), not creation
                if (v.number > 1) {
                    try {
                        const currentVersion = await getPageVersionV2ByNumber(page.id, v.number);
                        const prevVersion = await getPageVersionV2ByNumber(page.id, v.number - 1);

                        if (currentVersion?.body?.storage?.value && prevVersion?.body?.storage?.value) {
                            const cleanText = (html: string) => html.replace(/<[^>]*>?/gm, '');
                            const currentText = cleanText(currentVersion.body.storage.value);
                            const prevText = cleanText(prevVersion.body.storage.value);
                            points = Math.abs(currentText.length - prevText.length);
                            console.log(`[Points] ${user.name} created p${page.id}-v${v.number} at ${v.createdAt}: ${currentText.length} - ${prevText.length} = ${points}`);
                        }
                    } catch (err) {
                        console.error(`[Points] Failed to calc diff: ${user.name} created p${page.id}-v${v.number} at ${v.createdAt}`, err);
                    }
                }

                return {
                    id: `${page.id}-${v.number}`,
                    pageId: page.id,
                    pageTitle: page.title,
                    pageUrl: `${siteUrl}/wiki/spaces/${page.spaceId || 'SE2'}/pages/${page.id}`,
                    user,
                    timestamp: v.createdAt,
                    editCharacterCount: points
                };

            } catch (e) {
                console.error(`Error processing ${page.id} v${v.number}`, e);
                return null;
            }
        }));

        return versionUpdates.filter(Boolean);
    });

    const nested = await Promise.all(updatesPromises);
    const flatUpdates = nested.flat() as Omit<PageUpdate, 'multiplier' | 'bonusType'>[];
    const sessions = await getBonusSessions();
    
    return applyBonuses(flatUpdates, sessions, criticalContent);
};

// --- EXPORTS ---

export const getCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    const config = await getConfig();
    const isForge = await detectForgeEnvironment();
    return isForge ? getLiveCompetitionUpdates(config) : getMockCompetitionUpdates(config);
};

export const getBonusSessionsData = async (): Promise<BonusSession[]> => {
    const isForge = await detectForgeEnvironment();
    return isForge ? getBonusSessions() : getMockBonusSessions();
};

const getMockCompetitionUpdates = async (config: ContestConfig): Promise<PageUpdate[]> => {
    const sessions = await getMockBonusSessions();
    const updates = generateMockUpdates(sessions, config);
    return applyBonuses(updates, sessions, config.criticalContent);
};
