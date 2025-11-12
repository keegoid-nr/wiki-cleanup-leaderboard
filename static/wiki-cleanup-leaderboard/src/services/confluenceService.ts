import type { PageUpdate, UserInfo } from '../types';

// --- MOCK IMPLEMENTATION FOR LOCAL DEVELOPMENT ---

// Helper data for generating mock updates
const mockUsers: UserInfo[] = [
    { name: 'Ada Lovelace', avatar: 'https://i.pravatar.cc/150?u=ada' },
    { name: 'Grace Hopper', avatar: 'https://i.pravatar.cc/150?u=grace' },
    { name: 'Margaret Hamilton', avatar: 'https://i.pravatar.cc/150?u=margaret' },
    { name: 'Katherine Johnson', avatar: 'https://i.pravatar.cc/150?u=katherine' },
    { name: 'Dorothy Vaughan', avatar: 'https://i.pravatar.cc/150?u=dorothy' },
    { name: 'Mary Jackson', avatar: 'https://i.pravatar.cc/150?u=mary' },
    { name: 'Hedy Lamarr', avatar: 'https://i.pravatar.cc/150?u=hedy' },
    { name: 'Radia Perlman', avatar: 'https://i.pravatar.cc/150?u=radia' },
    { name: 'Karen Spärck Jones', avatar: 'https://i.pravatar.cc/150?u=karen' },
    { name: 'Shafi Goldwasser', avatar: 'https://i.pravatar.cc/150?u=shafi' },
    { name: 'Silvio Micali', avatar: 'https://i.pravatar.cc/150?u=silvio' },
    { name: 'Judea Pearl', avatar: 'https://i.pravatar.cc/150?u=judea' },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateMockUpdate = (id: number): PageUpdate => {
    const user = getRandomElement(mockUsers);
    const editCharacterCount = Math.random() > 0.2 ? Math.floor(Math.random() * 100) + 10 : Math.floor(Math.random() * 9) + 1;

    return {
        id: `update-${id}-${Date.now()}`,
        pageTitle: `How to improve your ${getRandomElement(['workflow', 'documentation', 'coding', 'teamwork'])} skills`,
        pageUrl: '#',
        user: user,
        timestamp: new Date().toISOString(),
        editCharacterCount: editCharacterCount,
    };
};

const getMockCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (Math.random() < 0.1) {
        throw new Error("Failed to fetch data from Confluence API.");
    }

    const mockUpdates: PageUpdate[] = Array.from({ length: 40 }, (_, i) => generateMockUpdate(i + 1));

    return mockUpdates;
};

// --- LIVE IMPLEMENTATION FOR CONFLUENCE ENVIRONMENT ---

const getLiveCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    // Dynamically import bridge to avoid breaking local dev
    const { requestConfluence, view } = await import('@forge/bridge');

    const { siteUrl } = await view.getContext();

    // 1. Fetch pages updated in the SE space within the competition window, expanding necessary fields
    const competitionStartDate = '2024-11-19';
    const competitionEndDate = '2024-12-05';
    const cql = `space = "SE" AND lastModified >= "${competitionStartDate}" AND lastModified < "${competitionEndDate}"`;

    // Expand to get version, last updater's info, and latest body content all in one go
    const searchResponse = await requestConfluence(`/rest/api/content/search?cql=${cql}&expand=history.lastUpdated.by,body.storage,version`);
    const searchResult = await searchResponse.json();

    const results = searchResult.results;

    // 2. For each page, fetch its previous version's content in parallel
    const previousVersionPromises = results.map((page: any) => {
        const previousVersionNumber = page.version.number - 1;
        if (previousVersionNumber < 1) {
            return Promise.resolve(null); // No previous version
        }
        // Fetch the specific previous version and expand its body content
        return requestConfluence(`/rest/api/content/${page.id}?version=${previousVersionNumber}&expand=body.storage`)
            .then(res => res.json())
            .then(versionData => versionData.body.storage.value)
            .catch(() => null); // Handle cases where version is gone or other errors
    });

    const previousVersionContents = await Promise.all(previousVersionPromises);

    // 3. Calculate character count diff and map to PageUpdate
    const updates: PageUpdate[] = results.map((page: any, index: number) => {
        const previousVersionContent = previousVersionContents[index] ?? '';

        // Helper to strip HTML and get plain text for accurate diffing
        const stripHtml = (html: string) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        };

        const currentText = stripHtml(page.body.storage.value);
        const previousText = stripHtml(previousVersionContent);

        // Use Math.abs to count both added and removed characters
        const editCharacterCount = Math.abs(currentText.length - previousText.length);

        const user: UserInfo = {
            name: page.history.lastUpdated.by.displayName,
            avatar: `${siteUrl}${page.history.lastUpdated.by.profilePicture.path}`
        };

        return {
            id: page.id,
            pageTitle: page.title,
            pageUrl: `${siteUrl}${page._links.webui}`,
            user: user,
            timestamp: page.history.lastUpdated.when,
            editCharacterCount: editCharacterCount,
        };
    });

    return updates;
};

// --- EXPORTED ROUTER FUNCTION ---

export const getCompetitionUpdates = async (): Promise<PageUpdate[]> => {
    // Check if running locally for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return getMockCompetitionUpdates();
    }
    // Otherwise, fetch live data from Confluence
    return getLiveCompetitionUpdates();
};
