require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const connectDB = require('./src/config/db');
const apiRoutes = require('./src/routes/api');

const app = express();

// Connect to database
connectDB();

// Apply CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

// ─── LINE Signature Verifier ────────────────────────────────────────────────────
function verifyLineSignature(rawBody, signature) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const hmac = crypto.createHmac('SHA256', channelSecret);
  hmac.update(rawBody);
  return hmac.digest('base64') === signature;
}

// ─── Webhook route (MUST come before express.json) ──────────────────────────────
// Use express.raw() to get the Buffer, then verify LINE signature manually.
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }), // receives raw Buffer, not parsed JSON
  (req, res) => {
    console.log('\n========== [WEBHOOK HIT] ==========');

    const signature = req.headers['x-line-signature'];
    const rawBody   = req.body; // Buffer from express.raw()

    // ── 1. Signature check ───────────────────────────────────────────────────────
    if (!signature) {
      console.error('[WEBHOOK] ❌ Missing x-line-signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    if (!verifyLineSignature(rawBody, signature)) {
      console.error('[WEBHOOK] ❌ Signature mismatch!');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('[WEBHOOK] ✅ Signature OK');

    // ── 2. Parse body ────────────────────────────────────────────────────────────
    let body;
    try {
      body = JSON.parse(rawBody.toString('utf8'));
    } catch (e) {
      console.error('[WEBHOOK] ❌ JSON parse error:', e.message);
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    console.log('[WEBHOOK] Body:', JSON.stringify(body, null, 2));

    // ── 3. Route to webhook controller ──────────────────────────────────────────
    req.body = body;
    require('./src/controllers/lineWebhookController').webhook(req, res);
  }
);

// ─── Health check (GET /api/webhook) for easy testing ───────────────────────────
app.get('/api/webhook', (req, res) => {
  res.json({ status: 'ok', message: 'Webhook endpoint is running (POST only for LINE)' });
});

// ─── JSON body parser for all other routes ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Other API routes ───────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`   Webhook URL  : http://localhost:${PORT}/api/webhook`);
  console.log(`   CHANNEL_SECRET: ${process.env.LINE_CHANNEL_SECRET ? '***SET***' : '❌ NOT SET'}`);
  console.log(`   ACCESS_TOKEN  : ${process.env.LINE_CHANNEL_ACCESS_TOKEN ? '***SET***' : '❌ NOT SET'}`);
  console.log(`   LIFF_ID       : ${process.env.LIFF_ID || '❌ NOT SET'}\n`);
});
