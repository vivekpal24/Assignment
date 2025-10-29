const eventService = require('../services/eventService');
const { validateReservation } = require('../utils/validator');

class ReservationController {
  
  // Get event summary
  async getEventSummary(req, res, next) {
    try {
      const summary = await eventService.getEventSummary();
      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }

  // Reserve seats
  async reserveSeats(req, res, next) {
    try {
      const validation = validateReservation(req.body);
      if (!validation.valid) {
        return res.status(validation.statusCode).json({ error: validation.error });
      }

      const { partnerId, seats } = req.body;
      const result = await eventService.reserveSeats(partnerId, seats);

      return res.status(201).json({
        reservationId: result.reservationId,
        seats: result.seats,
        status: 'confirmed'
      });

    } catch (error) {
      if (error.message === 'NOT_ENOUGH_SEATS') {
        return res.status(409).json({ error: 'Not enough seats left' });
      }

      if (error.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'High demand - please try again' });
      }

      next(error);
    }
  }

  // Cancel reservation
  async cancelReservation(req, res, next) {
    try {
      const { reservationId } = req.params;

      if (!reservationId || reservationId.trim() === '') {
        return res.status(400).json({ error: 'Invalid reservation ID' });
      }

      const result = await eventService.cancelReservation(reservationId);

      if (!result) {
        return res.status(404).json({ error: 'Reservation not found or already cancelled' });
      }

      // ✅ Assignment requirement: 204 No Content (NO response body)
      return res.status(204).send();

    } catch (error) {
      if (error.message === 'CONCURRENCY_CONFLICT') {
        return res.status(409).json({ error: 'High demand - please try again' });
      }

      next(error);
    }
  }
}

module.exports = new ReservationController();
