import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import crypto from 'crypto';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

// Windows SSL inspection workaround — use https module directly with rejectUnauthorized: false
const devAgent = !isProd ? new https.Agent({ rejectUnauthorized: false }) : null;

function apiFetch(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    https.get({ hostname: opts.hostname, path: opts.pathname + opts.search, agent: devAgent }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const app = express();
const PORT = process.env.PORT || 3001;
const EBAY_APP_ID = process.env.EBAY_APP_ID;

if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

const EBAY_BASE = 'https://svcs.ebay.com/services/search/FindingService/v1';
const COMMON_PARAMS = `RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD`;

app.get('/api/ebay', async (req, res) => {
  const { query } = req.query;
  console.log('Request received — query:', query, '| App ID set:', !!EBAY_APP_ID);
  if (!query) return res.status(400).json({ error: 'Missing query' });
  if (!EBAY_APP_ID) return res.status(500).json({ error: 'EBAY_APP_ID not configured in .env' });

  const appParam = `SECURITY-APPNAME=${encodeURIComponent(EBAY_APP_ID)}`;
  const keywordsParam = `keywords=${encodeURIComponent(query)}&paginationInput.entriesPerPage=10`;

  try {
    // Run both in parallel; sold listings may fail independently if rate limited
    const [soldData, activeData] = await Promise.all([
      apiFetch(`${EBAY_BASE}?OPERATION-NAME=findCompletedItems&${appParam}&${COMMON_PARAMS}&${keywordsParam}&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true`).catch(() => null),
      apiFetch(`${EBAY_BASE}?OPERATION-NAME=findItemsByKeywords&${appParam}&${COMMON_PARAMS}&${keywordsParam}`)
    ]);

    const parse = (items, type) =>
      items.map(item => ({
        title: item.title?.[0] ?? 'Unknown',
        price: parseFloat(item.sellingStatus?.[0]?.convertedCurrentPrice?.[0]?.__value__ ?? 0),
        type
      }));

    const activeItems = activeData.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item ?? [];
    const activeListings = parse(activeItems, 'active').slice(0, 5);

    const soldRawItems = soldData?.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item ?? [];
    const soldFromEbay = parse(soldRawItems, 'sold').slice(0, 5);

    const avg = arr => arr.length ? arr.reduce((s, l) => s + l.price, 0) / arr.length : 0;
    const avgActive = avg(activeListings);

    // If sold data unavailable (rate limited), estimate from active price
    const soldListings = soldFromEbay.length > 0 ? soldFromEbay : activeListings.map(l => ({
      ...l,
      price: parseFloat((l.price * 0.87).toFixed(2)),
      type: 'sold'
    }));
    const soldEstimated = soldFromEbay.length === 0;

    const avgSoldPrice = soldFromEbay.length > 0 ? avg(soldFromEbay) : avgActive * 0.87;

    const category = soldRawItems[0]?.primaryCategory?.[0]?.categoryName?.[0]
      ?? activeItems[0]?.primaryCategory?.[0]?.categoryName?.[0]
      ?? 'General';

    res.json({
      product: query,
      soldListings,
      activeListings,
      avgSoldPrice,
      avgActivePrice: avgActive,
      sellThroughRate: soldFromEbay.length > 0
        ? soldFromEbay.length / (soldFromEbay.length + activeListings.length)
        : 0.55,
      category,
      soldEstimated
    });
  } catch (err) {
    console.error('eBay API error:', err.message, err.code, err.cause?.message);
    res.status(500).json({ error: err.message || 'Failed to fetch eBay data' });
  }
});

// eBay Marketplace Account Deletion — required for production API access
// GET: eBay sends a challenge_code to verify you own the endpoint
// POST: eBay notifies when a user deletes their account (we store no user data, so just 200 OK)
app.get('/ebay/deletion', (req, res) => {
  const { challenge_code } = req.query;
  const verificationToken = process.env.EBAY_VERIFICATION_TOKEN;
  const endpoint = process.env.EBAY_DELETION_ENDPOINT;

  if (!challenge_code) return res.status(400).json({ error: 'Missing challenge_code' });
  if (!verificationToken || !endpoint) {
    return res.status(500).json({ error: 'EBAY_VERIFICATION_TOKEN or EBAY_DELETION_ENDPOINT not set' });
  }

  const hash = crypto.createHash('sha256')
    .update(challenge_code + verificationToken + endpoint)
    .digest('hex');

  res.json({ challengeResponse: hash });
});

app.post('/ebay/deletion', express.json(), (req, res) => {
  // No user data stored — nothing to delete
  res.sendStatus(200);
});

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
