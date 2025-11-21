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

const STATIC_CONTESTS: Contest[] = [
    { name: 'Week 1', start: new Date('2025-11-19T16:00:00.000Z'), end: new Date('2025-11-26T15:59:59.999Z'), prize: 'Three $100 Prizes for Top Editors!' },
    { name: 'Week 2', start: new Date('2025-11-26T16:00:00.000Z'), end: new Date('2025-12-05T01:00:00.000Z'), prize: 'Three $100 Prizes for Top Editors!' },
    { name: 'Overall', start: new Date('2025-11-19T16:00:00.000Z'), end: new Date('2025-12-05T01:00:00.000Z'), prize: '$250 Grand Prize Drawing' },
];

const STATIC_CRITICAL_CONTENT_DATE = new Date('2025-12-02T00:00:00Z');

const getDynamicContestConfig = (): ContestConfig => {
    return {
        contests: STATIC_CONTESTS,
        criticalContent: {
            pageIds: new Set(['page-1', 'page-4', 'page-8']),
            date: STATIC_CRITICAL_CONTENT_DATE,
        },
    };
};

const getStaticContestConfig = (): ContestConfig => {
    return {
        contests: STATIC_CONTESTS,
        criticalContent: {
            pageIds: new Set(CRITICAL_CONTENT_PAGE_IDS),
            date: STATIC_CRITICAL_CONTENT_DATE,
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
