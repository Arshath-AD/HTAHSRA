import ogs from 'open-graph-scraper';

/**
 * Extract metadata from a URL using Open Graph Scraper
 */
export async function extractMetadata(url) {
    try {
        const options = {
            url,
            timeout: 15000,
            fetchOptions: {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        };

        const { result } = await ogs(options);

        return {
            title: result.ogTitle || result.dcTitle || result.twitterTitle || '',
            description: result.ogDescription || result.dcDescription || result.twitterDescription || '',
            siteName: result.ogSiteName || '',
            favicon: result.favicon || '',
            ogImage: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || '',
            type: result.ogType || 'website'
        };
    } catch (error) {
        console.error(`⚠️ Failed to extract metadata for ${url}:`, error.message);
        return {
            title: '',
            description: '',
            siteName: '',
            favicon: '',
            ogImage: '',
            type: 'website'
        };
    }
}
