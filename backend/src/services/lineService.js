const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken
});

// ─── Send flex message when a ticket is created ────────────────────────────────
const sendTicketConfirmation = async (target, ticket) => {
  const destination = target || ticket.lineUserId;

  if (!destination) {
    console.warn('[LINE] sendTicketConfirmation: No destination (no groupId and no lineUserId)');
    return;
  }

  try {
    const flexMessage = {
      type: 'flex',
      altText: `Ticket ${ticket.ticketNo} Created`,
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#FFCC00',
          contents: [
            {
              type: 'text',
              text: '🎫 New Ticket Created',
              weight: 'bold',
              size: 'xl',
              color: '#333333'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: 'Ticket No:', color: '#aaaaaa', size: 'sm', flex: 2 },
                { type: 'text', text: ticket.ticketNo, wrap: true, color: '#333333', size: 'sm', flex: 5, weight: 'bold' }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'sm',
              contents: [
                { type: 'text', text: 'Machine:', color: '#aaaaaa', size: 'sm', flex: 2 },
                { type: 'text', text: `${ticket.machineType} - ${ticket.machineModel}`, wrap: true, color: '#666666', size: 'sm', flex: 5 }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'sm',
              contents: [
                { type: 'text', text: 'Branch:', color: '#aaaaaa', size: 'sm', flex: 2 },
                { type: 'text', text: ticket.branchName, wrap: true, color: '#666666', size: 'sm', flex: 5 }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'sm',
              contents: [
                { type: 'text', text: 'Date:', color: '#aaaaaa', size: 'sm', flex: 2 },
                { type: 'text', text: `${new Date(ticket.installDate).toLocaleDateString('th-TH')} ${ticket.installTime}`, wrap: true, color: '#666666', size: 'sm', flex: 5 }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'sm',
              contents: [
                { type: 'text', text: 'Status:', color: '#aaaaaa', size: 'sm', flex: 2 },
                { type: 'text', text: ticket.status.toUpperCase(), wrap: true, color: '#FFA500', size: 'sm', weight: 'bold', flex: 5 }
              ]
            }
          ]
        }
      }
    };

    const result = await client.pushMessage({
      to: destination,
      messages: [flexMessage]
    });

    console.log('[LINE] sendTicketConfirmation success → destination:', destination);
    return result;
  } catch (err) {
    console.error('[LINE] sendTicketConfirmation ERROR:', err?.response?.data || err.message || err);
  }
};

module.exports = {
  config,
  client,
  sendTicketConfirmation
};
