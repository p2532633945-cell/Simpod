import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url } = req.query;
    if (!url || typeof url !== 'string') {
        return res.status(400).send('Missing url parameter');
    }

    // Helper to follow redirects manually (since https.request doesn't follow redirects by default)
    const fetchWithRedirects = (targetUrlStr: string, options: https.RequestOptions, redirectCount = 0): void => {
        if (redirectCount > 5) {
            if (!res.headersSent) res.status(502).send('Too many redirects');
            return;
        }

        try {
            const targetUrl = new URL(targetUrlStr);
            const client = targetUrl.protocol === 'https:' ? https : http;
            
            const reqOptions: https.RequestOptions = {
                ...options,
                method: 'GET',
                hostname: targetUrl.hostname,
                port: targetUrl.port,
                path: targetUrl.pathname + targetUrl.search,
                headers: {
                    ...options.headers,
                    'Host': targetUrl.hostname // Update Host header for redirects
                }
            };

            const proxyReq = client.request(reqOptions, (proxyRes) => {
                // Handle Redirects (301, 302, 303, 307, 308)
                if (proxyRes.statusCode && [301, 302, 303, 307, 308].includes(proxyRes.statusCode)) {
                    const location = proxyRes.headers['location'];
                    if (location) {
                        // Resolve relative URLs
                        const nextUrl = new URL(location, targetUrlStr).toString();
                        console.log(`[Proxy] Following redirect (${proxyRes.statusCode}) to: ${nextUrl}`);
                        
                        // Clean up current response and retry
                        proxyRes.resume(); 
                        fetchWithRedirects(nextUrl, options, redirectCount + 1);
                        return;
                    }
                }

                // Forward status code
                res.status(proxyRes.statusCode || 200);
                
                // Forward critical headers for audio streaming
                const forwardHeaders = [
                    'content-type',
                    'content-length',
                    'content-range',
                    'accept-ranges',
                    'content-encoding',
                    'content-disposition',
                    'cache-control',
                    'last-modified',
                    'etag'
                ];

                forwardHeaders.forEach(key => {
                    const val = proxyRes.headers[key];
                    if (val) {
                        res.setHeader(key, val);
                    }
                });

                // Pipe the data directly to the response
                proxyRes.pipe(res);

                proxyRes.on('error', (err) => {
                    console.error('Proxy Response Error:', err);
                    res.end();
                });
            });

            proxyReq.on('error', (e) => {
                console.error('Proxy Request Error:', e);
                if (!res.headersSent) {
                    res.status(500).send(`Proxy Error: ${e.message}`);
                }
            });

            // Set a timeout
            proxyReq.setTimeout(15000, () => {
                proxyReq.destroy();
            });

            proxyReq.end();

        } catch (error: any) {
             console.error('Proxy URL Error:', error);
             if (!res.headersSent) res.status(500).send(`Server Error: ${error.message}`);
        }
    };

    // Initial Request Options
    const initialOptions: https.RequestOptions = {
        headers: {
            'User-Agent': 'Simpod-Audio-Proxy/1.0',
        }
    };
    
    if (req.headers.range) {
        initialOptions.headers!['Range'] = req.headers.range;
    }

    // Start the request chain
    fetchWithRedirects(url, initialOptions);
}
