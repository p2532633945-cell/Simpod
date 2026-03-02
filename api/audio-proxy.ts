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

    try {
        const targetUrl = new URL(url);
        const client = targetUrl.protocol === 'https:' ? https : http;
        const range = req.headers.range;

        const options: https.RequestOptions = {
            method: 'GET',
            headers: {
                'User-Agent': 'Simpod-Audio-Proxy/1.0',
            }
        };

        if (range) {
            options.headers!['Range'] = range;
        }

        const proxyReq = client.request(targetUrl, options, (proxyRes) => {
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

        // Set a timeout to prevent hanging connections (Vercel has its own limits, but good practice)
        proxyReq.setTimeout(10000, () => {
            proxyReq.destroy();
        });

        proxyReq.end();

    } catch (error: any) {
        console.error('Proxy Setup Error:', error);
        res.status(500).send(`Server Error: ${error.message}`);
    }
}
