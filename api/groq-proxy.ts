import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle FormData stream manually
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
  const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error('Missing GROQ_API_KEY');
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  try {
    const groqReq = https.request(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': req.headers['content-type'] || 'multipart/form-data',
      },
    }, (groqRes: IncomingMessage) => {
      res.status(groqRes.statusCode || 200);
      
      // Forward headers
      const contentType = groqRes.headers['content-type'];
      if (contentType) res.setHeader('Content-Type', contentType);

      groqRes.pipe(res);
    });

    groqReq.on('error', (e) => {
      console.error('Groq Proxy Request Error:', e);
      res.status(500).json({ error: `Groq Proxy Error: ${e.message}` });
    });

    // Pipe the client request body directly to Groq
    req.pipe(groqReq);

  } catch (error: any) {
    console.error('Groq Proxy Setup Error:', error);
    res.status(500).json({ error: error.message });
  }
}
