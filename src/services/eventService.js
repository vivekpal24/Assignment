const { v4: uuidv4 } = require('uuid');
const EventModel = require('../models/EventModel');
const ReservationModel = require('../models/ReservationModel');

class EventService {
  constructor() {
    this.initEvent();
  }

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
        console.log('✅ Event initialized and saved to MongoDB');
      } else {
        console.log('✅ Event loaded from MongoDB');
      }

      this.event = event;
    } catch (err) {
      console.error('❌ Failed to initialize event:', err.message);
    }
  }

  async getEventSummary() {
    const event = await EventModel.findOne({ eventId: 'node-meetup-2025' });
    if (!event) throw new Error('EVENT_NOT_FOUND');

    const reservationCount = await ReservationModel.countDocuments({ eventId: event.eventId });

    return {
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount,
      version: event.version
    };
  }

  async reserveSeats(partnerId, seats) {
    const MAX_RETRIES = 5;
    const BASE_DELAY = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const event = await EventModel.findOne({ eventId: 'node-meetup-2025' });

      if (!event) throw new Error('EVENT_NOT_FOUND');
      if (event.availableSeats < seats) {
        throw new Error('NOT_ENOUGH_SEATS');
      }

      const reservationId = uuidv4();
      const currentVersion = event.version;

      // Optimistic concurrency update
      const updated = await EventModel.findOneAndUpdate(
        {
          eventId: 'node-meetup-2025',
          version: currentVersion,
        },
        {
          $inc: { version: 1, availableSeats: -seats },
        },
        { new: true }
      );

      if (updated) {
        const reservation = new ReservationModel({
          reservationId,
          partnerId,
          seats,
          eventId: event.eventId,
        });
        await reservation.save();

        return { reservationId, seats, status: 'confirmed' };
      }

      const delay = BASE_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('CONCURRENCY_CONFLICT');
  }

  async cancelReservation(reservationId) {
    const reservation = await ReservationModel.findOne({ reservationId });
    if (!reservation) {
      throw new Error('RESERVATION_NOT_FOUND');
    }

    const MAX_RETRIES = 5;
    const BASE_DELAY = 10;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const event = await EventModel.findOne({ eventId: reservation.eventId });
      if (!event) throw new Error('EVENT_NOT_FOUND');

      const currentVersion = event.version;

      const updated = await EventModel.findOneAndUpdate(
        {
          eventId: reservation.eventId,
          version: currentVersion,
        },
        {
          $inc: { version: 1, availableSeats: reservation.seats },
        },
        { new: true }
      );

      if (updated) {
        await ReservationModel.deleteOne({ reservationId });
        return true;
      }

      const delay = BASE_DELAY * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error('CONCURRENCY_CONFLICT');
  }
}

module.exports = new EventService();
