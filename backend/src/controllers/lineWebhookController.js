const { client } = require('../services/lineService');

// ─── Handle a single LINE event ────────────────────────────────────────────────
const handleEvent = async (event) => {
  console.log('[LINE] Event received:', JSON.stringify(event, null, 2));

  // Only handle text messages
  if (event.type !== 'message' || event.message.type !== 'text') {
    console.log('[LINE] Skipping non-text event, type:', event.type);
    return null;
  }

  const text = event.message.text.trim();
  const replyToken = event.replyToken;

  console.log('[LINE] Message text:', text);
  console.log('[LINE] Reply token:', replyToken);

  // ── Test reply: send simple text first to confirm webhook works ──────────────
  if (text === 'นกเหลือง') {
    console.log('[LINE] Keyword matched! Sending reply...');

    const groupId = event.source?.groupId || null;
    const userId = event.source?.userId || null;
    const liffUrl = `https://liff.line.me/${process.env.LIFF_ID}${groupId ? '?groupId=' + groupId : ''}`;

    console.log('[LINE] groupId:', groupId, '| userId:', userId);
    console.log('[LINE] LIFF URL:', liffUrl);

    const flexMessage = {
      type: 'flex',
      altText: 'เปิด Ticket ติดตั้งเครื่อง',
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: 'https://res.cloudinary.com/docoqdsh9/image/upload/v1781336321/ChatGPT_Image_Jun_13_2026_02_36_33_PM_zvvvvn.png',
          size: 'full',
          aspectRatio: '1:1',
          aspectMode: 'cover',
          action: {
            type: 'uri',
            uri: liffUrl
          }
        },
        body: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '8%',
          contents: [
            {
              type: 'text',
              text: 'แจ้งติดตั้งเครื่อง',
              weight: 'bold',
              size: 'xl',
              color: '#FFCC00',
              wrap: true
            },
            {
              type: 'text',
              text: 'ระบบพร้อมรับข้อมูลการติดตั้งของคุณแล้ว กรุณากดปุ่มด้านล่างเพื่อเปิด Ticket ค่ะ',
              size: 'sm',
              color: '#6B7280',
              margin: 'md',
              wrap: true
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '8%',
          paddingTop: '0px',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#FFCC00',
              height: 'sm',
              action: {
                type: 'uri',
                label: 'เปิดฟอร์มติดตั้ง',
                uri: liffUrl
              }
            }
          ]
        }
      }
    };

    try {
      const result = await client.replyMessage({
        replyToken,
        messages: [flexMessage]
      });
      console.log('[LINE] replyMessage success:', result);
      return result;
    } catch (err) {
      console.error('[LINE] replyMessage ERROR:', err?.response?.data || err.message || err);
      throw err;
    }
  }

  console.log('[LINE] No keyword match for:', text);
  return null;
};

// ─── Webhook entry point (called by Express route) ─────────────────────────────
exports.webhook = async (req, res) => {
  console.log('\n========== [WEBHOOK CALLED] ==========');
  console.log('[WEBHOOK] Headers:', JSON.stringify(req.headers, null, 2));
  console.log('[WEBHOOK] Body:', JSON.stringify(req.body, null, 2));

  try {
    const events = req.body?.events;

    if (!events || events.length === 0) {
      console.log('[WEBHOOK] No events in body (possibly a verify ping)');
      return res.status(200).json({ status: 'ok', message: 'No events' });
    }

    console.log(`[WEBHOOK] Processing ${events.length} event(s)...`);

    const results = await Promise.all(events.map(handleEvent));

    console.log('[WEBHOOK] All events processed successfully');
    return res.status(200).json({ status: 'ok', results });
  } catch (err) {
    console.error('[WEBHOOK] Fatal error:', err?.response?.data || err.message || err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
