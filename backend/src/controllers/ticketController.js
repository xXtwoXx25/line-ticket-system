const Ticket = require('../models/Ticket');
const generateTicketNo = require('../utils/generateTicketNo');
const { sendTicketConfirmation } = require('../services/lineService');

// @desc    Create a new ticket
// @route   POST /api/tickets
exports.createTicket = async (req, res) => {
  try {
    const ticketNo = await generateTicketNo();
    
    // We expect groupId to be passed if it was created from a group, 
    // to send back the flex message to that group
    const { groupId, ...ticketData } = req.body;

    const ticket = new Ticket({
      ticketNo,
      ...ticketData
    });

    await ticket.save();

    // Send confirmation to LINE
    await sendTicketConfirmation(groupId || ticket.lineUserId, ticket);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
exports.getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'assigned', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
