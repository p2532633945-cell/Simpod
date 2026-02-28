import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers - Allow all origins for MVP, restrict in production if needed
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" query parameter' });
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Simpod/1.0 (Contact: your-email)',
        }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();

    // Set content type to XML
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(data);
  } catch (error: any) {
    console.error('RSS Proxy Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
