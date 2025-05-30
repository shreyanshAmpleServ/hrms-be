const express = require("express");
const router = express.Router();
const helpdeskTicket = require("../controller/helpdeskTicketController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

// Create helpdesk ticket routes
router.post(
  "/helpdesk-ticket",
  authenticateToken,
  helpdeskTicket.createHelpdeskTicket
);

// Get all helpdesk tickets routes
router.get(
  "/helpdesk-ticket",
  authenticateToken,
  helpdeskTicket.getAllHelpdeskTickets
);

// Get a single helpdesk ticket by ID routes
router.get(
  "/helpdesk-ticket/:id",
  authenticateToken,
  helpdeskTicket.findHelpdeskTicket
);

// Update a helpdesk ticket by ID routes
router.put(
  "/helpdesk-ticket/:id",
  authenticateToken,
  helpdeskTicket.updateHelpdeskTicket
);

// Delete  helpdesk ticket by ID routes
router.delete(
  "/helpdesk-ticket/:id",
  authenticateToken,
  helpdeskTicket.deleteHelpdeskTicket
);

module.exports = router;
