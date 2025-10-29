const eventService = require('../services/eventService');
const { validateReservation } = require('../utils/validator');

class ReservationController {
  // Get event summary from MongoDB
  async getEventSummary(req, res, next) {
    try {
      const summary = await eventService.getEventSummary();
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  // Reserve seats
  async reserveSeats(req, res, next) {
    try {
      const { partnerId, seats } = req.body;

      // Validate input
      const validation = validateReservation(partnerId, seats);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }

      // Attempt reservation
      const reservation = await eventService.reserveSeats(partnerId, seats);

      res.status(201).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      if (error.message === 'NOT_ENOUGH_SEATS') {
        return res.status(409).json({
          success: false,
          error: 'Not enough seats left'
        });
      }
      if (error.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: 'High demand - please try again'
        });
      }
      next(error);
    }
  }

  // Cancel a reservation
  async cancelReservation(req, res, next) {
    try {
      const { reservationId } = req.params;

      if (!reservationId || reservationId.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reservation ID'
        });
      }

      const result = await eventService.cancelReservation(reservationId);

      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Reservation not found or already cancelled'
        });
      }

      // ✅ Send success response instead of 204 No Content
      return res.status(200).json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      if (error.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({
          success: false,
          error: 'Conflict during cancellation - please try again'
        });
      }
      next(error);
    }
  }
}

module.exports = new ReservationController();
