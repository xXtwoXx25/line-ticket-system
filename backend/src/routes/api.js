const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Ticket routes
router.route('/tickets')
  .post(ticketController.createTicket)
  .get(ticketController.getTickets);

router.route('/tickets/:id')
  .get(ticketController.getTicket)
  .delete(ticketController.deleteTicket);

router.route('/tickets/:id/status')
  .put(ticketController.updateTicketStatus);

module.exports = router;
