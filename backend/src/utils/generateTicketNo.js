const Ticket = require('../models/Ticket');

const generateTicketNo = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = `TK-${dateStr}-`;

  // Find the last ticket of the day
  const lastTicket = await Ticket.findOne({
    ticketNo: { $regex: `^${prefix}` }
  }).sort({ ticketNo: -1 });

  let sequence = 1;
  if (lastTicket) {
    const lastSeqStr = lastTicket.ticketNo.substring(lastTicket.ticketNo.lastIndexOf('-') + 1);
    sequence = parseInt(lastSeqStr, 10) + 1;
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
};

module.exports = generateTicketNo;
