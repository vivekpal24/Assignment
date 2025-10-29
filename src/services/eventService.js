const { v4: uuidv4 } = require('uuid');
const EventModel = require('../models/EventModel');
const ReservationModel = require('../models/ReservationModel');

class EventService {

  // Initialize Event if not exists
  async initEvent() {
    try {
      let event = await EventModel.findOne({ eventId: 'node-meetup-2025' });

      if (!event) {
        event = new EventModel({
          eventId: 'node-meetup-2025',
          name: 'Node.js Meet-up',
          totalSeats: 500,
          availableSeats: 500,
          version: 0
        });

        await event.save();
        console.log('✅ Event initialized in database');
      } else {
        console.log('✅ Event loaded from database');
      }
    } catch (err) {
      console.error('❌ Failed to initialize event:', err.message);
    }
  }

  // Get Event Summary
  async getEventSummary() {
    const event = await EventModel.findOne({ eventId: 'node-meetup-2025' });

    if (!event) {
      throw new Error('EVENT_NOT_FOUND');
    }

    const reservationCount = await ReservationModel.countDocuments({
      eventId: event.eventId
    });

    return {
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount,
      version: event.version
    };
  }

  // Reserve Seats with Optimistic Concurrency
  async reserveSeats(partnerId, seats) {
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const event = await EventModel.findOne({ eventId: 'node-meetup-2025' });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      if (event.availableSeats < seats) {
        throw new Error('NOT_ENOUGH_SEATS');
      }

      const reservationId = uuidv4();
      const currentVersion = event.version;

      const updateResult = await EventModel.findOneAndUpdate(
        { eventId: 'node-meetup-2025', version: currentVersion },
        { $inc: { version: 1, availableSeats: -seats } },
        { new: true }
      );

      if (updateResult) {
        await ReservationModel.create({
          reservationId,
          partnerId,
          seats,
          eventId: 'node-meetup-2025'
        });

        return { reservationId, seats, status: 'confirmed' };
      }

      // Retry after small delay
      await new Promise(resolve =>
        setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt))
      );
    }

    throw new Error('CONCURRENCY_CONFLICT');
  }

  // Cancel Reservation
  async cancelReservation(reservationId) {
    const reservation = await ReservationModel.findOne({ reservationId });

    if (!reservation) {
      return false; // controller will return 404
    }

    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const event = await EventModel.findOne({ eventId: reservation.eventId });

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      const currentVersion = event.version;

      const updateResult = await EventModel.findOneAndUpdate(
        { eventId: reservation.eventId, version: currentVersion },
        { $inc: { version: 1, availableSeats: reservation.seats } },
        { new: true }
      );

      if (updateResult) {
        await ReservationModel.deleteOne({ reservationId });
        return true;
      }

      // Retry after delay
      await new Promise(resolve =>
        setTimeout(resolve, BASE_DELAY_MS * Math.pow(2, attempt))
      );
    }

    throw new Error('CONCURRENCY_CONFLICT');
  }
}

module.exports = new EventService();
