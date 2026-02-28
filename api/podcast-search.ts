import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "q" query parameter' });
  }

  const apiKey = process.env.PODCAST_INDEX_KEY;
  const apiSecret = process.env.PODCAST_INDEX_SECRET;
  const userAgent = 'Simpod/1.0 (Contact: your-email)'; // Hardcoded for politeness as requested

  if (!apiKey || !apiSecret) {
    console.error('Missing Podcast Index API keys in environment variables');
    return res.status(500).json({ error: 'Server configuration error: Missing API keys' });
  }

  // Podcast Index Auth Logic
  // Header: "X-Auth-Date": Unix timestamp
  // Header: "Authorization": SHA1(apiKey + apiSecret + timestamp)
  const apiHeaderTime = Math.floor(Date.now() / 1000);
  const data4Hash = apiKey + apiSecret + apiHeaderTime;
  const hash = crypto.createHash('sha1').update(data4Hash).digest('hex');

  const headers = {
    'User-Agent': userAgent,
    'X-Auth-Key': apiKey,
    'X-Auth-Date': apiHeaderTime.toString(),
    'Authorization': hash,
  };

  try {
    const searchUrl = `https://api.podcastindex.org/api/1.0/search/byterm?q=${encodeURIComponent(q)}`;
    console.log(`Searching Podcast Index: ${searchUrl}`);
    
    const response = await fetch(searchUrl, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Podcast Index API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Podcast Search Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
