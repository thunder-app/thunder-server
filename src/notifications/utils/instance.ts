import { request } from 'undici';

export type Platform = 'lemmy' | 'piefed' | null;

/**
 * Determines the proper Platform by fetching software information from nodeinfo.
 *
 * Given a URL, fetches the .well-known/nodeinfo endpoint and parses the JSON response
 * to determine the underlying software platform (lemmy, piefed, etc.).
 *
 * Returns the detected Platform or null if detection fails.
 */
async function detectPlatformFromNodeInfo(url: string, timeout: number = 5000): Promise<Platform> {
  if (!url || url.trim() === '') return null;

  try {
    let uri: URL;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      uri = new URL(`https://${url}`);
    } else {
      uri = new URL(url);
    }

    const nodeInfoUrl = new URL('/.well-known/nodeinfo', uri);

    const response = await request(nodeInfoUrl.toString(), {
      method: 'GET',
      headersTimeout: timeout,
      bodyTimeout: timeout,
    });

    if (response.statusCode !== 200) return null;

    const responseBody = await response.body.json();
    const nodeInfo = responseBody as Record<string, any>;

    // Extract the nodeinfo link from the well-known response
    let actualNodeInfoUrl: string | null = null;

    if (nodeInfo.links && Array.isArray(nodeInfo.links) && nodeInfo.links.length > 0) {
      for (const link of nodeInfo.links) {
        const rel = link.rel?.toString();
        if (rel && rel.includes('nodeinfo.diaspora.software/ns/schema/')) {
          actualNodeInfoUrl = link.href?.toString() || null;
          break;
        }
      }
    }

    if (!actualNodeInfoUrl) return null;

    // Fetch the actual nodeinfo document
    const nodeInfoResponse = await request(actualNodeInfoUrl, {
      method: 'GET',
      headersTimeout: timeout,
      bodyTimeout: timeout,
    });

    if (nodeInfoResponse.statusCode !== 200) return null;

    const nodeInfoData = await nodeInfoResponse.body.json() as Record<string, any>;
    const softwareName = nodeInfoData.software?.name?.toString().toLowerCase();
    if (!softwareName) return null;

    switch (softwareName) {
      case 'lemmy':
        return 'lemmy';
      case 'piefed':
        return 'piefed';
      default:
        return null;
    }
  } catch (error) {
    // Return null if any error occurs during detection
    console.error('Error detecting platform from nodeinfo:', error);
    return null;
  }
}

export { detectPlatformFromNodeInfo };