import { UserInfo } from '../types';

/**
 * Searches for pages using CQL via the V1 API.
 * V1 is used because V2 search capabilities are different/limited for this specific use case.
 */
export const searchPagesV1 = async (cql: string, limit: number = 100): Promise<any[]> => {
    const { requestConfluence } = await import('@forge/bridge');
    let searchRes;
    try {
        searchRes = await requestConfluence(`/rest/api/content/search?cql=${cql}&limit=${limit}`);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('Failed to fetch')) {
            throw new Error('Network error connecting to Confluence. This often happens if the App ID in manifest.yml does not match your installed app, or if the app needs to be re-installed.');
        }
        throw e;
    }

    if (!searchRes.ok) {
        console.warn(`[API] Search failed: ${searchRes.status}`);
        throw new Error(`Search failed: ${searchRes.status}`);
    }
    const data = await searchRes.json();
    return data.results || [];
};

/**
 * Fetches version history for a page using V2 API.
 */
export const getPageVersionsV2 = async (pageId: string, limit: number = 100): Promise<any[]> => {
    const { requestConfluence } = await import('@forge/bridge');
    const verRes = await requestConfluence(`/api/v2/pages/${pageId}/versions?sort=-modified-date&limit=${limit}`);
    
    if (!verRes.ok) {
        console.warn(`[API] Failed to fetch versions for page ${pageId}: ${verRes.status}`);
        return [];
    }
    
    const data = await verRes.json();
    return data.results || [];
};

/**
 * Fetches a specific version of a page using V2 API by version number, including body.
 * Uses the page endpoint with version parameter as it reliably returns the body.
 */
export const getPageVersionV2ByNumber = async (pageId: string, versionNumber: number): Promise<any> => {
    const { requestConfluence } = await import('@forge/bridge');
    
    // Fetch using the page endpoint with version parameter
    const res = await requestConfluence(`/api/v2/pages/${pageId}?version=${versionNumber}&body-format=storage`);
    
    if (!res.ok) {
        console.warn(`[API] Failed to fetch version ${versionNumber} for page ${pageId}: ${res.status}`);
        return null;
    }
    
    return await res.json();
};

/**
 * Fetches user details. 
 * Relies on V1 API as it is the most reliable for retrieving display names and avatars 
 * with the 'read:confluence-user' scope.
 */
export const getUserDetailsV1 = async (accountId: string, siteUrl: string): Promise<UserInfo> => {
    const { requestConfluence } = await import('@forge/bridge');

    try {
        const v1Res = await requestConfluence(`/rest/api/user?accountId=${accountId}`);
        if (v1Res.ok) {
             const v1Data = await v1Res.json();
             return {
                name: v1Data.displayName || 'Unknown User',
                username: v1Data.accountId || accountId,
                avatar: v1Data.profilePicture?.path ? `${siteUrl}${v1Data.profilePicture.path}` : ''
            };
        } else {
            console.warn(`[User API] V1 fetch failed for ${accountId}: ${v1Res.status}`);
        }
    } catch (e) {
        console.error(`[User API] Error fetching user ${accountId}:`, e);
    }
    
    return { name: 'Unknown User', username: accountId, avatar: '' };
};
