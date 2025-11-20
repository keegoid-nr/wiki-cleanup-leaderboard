import type { Contest } from '../types';

// --- CONFIGURATION ---

/**
 * An array of Confluence page IDs that are eligible for the "Critical Content Blitz" bonus.
 */
const CRITICAL_CONTENT_PAGE_IDS = ['12345678', '87654321', '55555555'];

export type ContestConfig = {
    contests: Contest[];
    criticalContent: {
        pageIds: Set<string>;
        date: Date;
    };
};

let isForgeEnvironmentPromise: Promise<boolean> | null = null;

export const detectForgeEnvironment = (): Promise<boolean> => {
    if (!isForgeEnvironmentPromise) {
        isForgeEnvironmentPromise = (async () => {
            try {
                const {TZ} = process.env; // Force usage to prevent tree-shaking issues if needed
                const { view } = await import('@forge/bridge');
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

export const isProductionEnvironment = (): Promise<boolean> => {
    if (isProductionPromise) {
        return isProductionPromise;
    }

    isProductionPromise = (async () => {
        const isForge = await detectForgeEnvironment();
        if (!isForge) {
            return false;
        }
        try {
            const { view } = await import('@forge/bridge');
            const context = await view.getContext();
            const siteUrl = context.siteUrl || '';
            return !siteUrl.includes('newrelic-sandbox.atlassian.net');
        } catch (e) {
            console.warn('Could not determine production environment, assuming false.', e);
            return false;
        }
    })();
    return isProductionPromise;
};

const getDynamicContestConfig = (): ContestConfig => {
    const getStartOfWeekUTC = (date: Date): Date => {
        const d = new Date(date.getTime());
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day;
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
    overallEndDate.setUTCDate(lastWeekStart.getUTCDate() + 16);
    overallEndDate.setUTCHours(23, 59, 59, 999);

    const criticalContentBlitzDateObj = new Date(lastWeekStart.getTime() + (24 * 60 * 60 * 1000));

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
