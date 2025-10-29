const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationId: {
    type: String,
    required: true,
    unique: true
  },
  partnerId: {
    type: String,
    required: true,
    trim: true
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  version: {
    type: Number,
    default: 0
  },
  reservations: [reservationSchema]
});

eventSchema.methods.getSummary = function () {
  return {
    eventId: this.eventId,
    name: this.name,
    totalSeats: this.totalSeats,
    availableSeats: this.availableSeats,
    reservationCount: this.reservations.length,
    version: this.version
  };
};

// Check seat availability
eventSchema.methods.canReserve = function (seats) {
  return this.availableSeats >= seats;
};

// Handle seat reservation
eventSchema.methods.reserve = function (reservationId, partnerId, seats) {
  if (!this.canReserve(seats)) {
    return { success: false, reason: 'insufficient_seats' };
  }

  this.availableSeats -= seats;
  this.version += 1;

  this.reservations.push({
    reservationId,
    partnerId,
    seats
  });

  return { success: true };
};

// Handle reservation cancellation
eventSchema.methods.cancel = function (reservationId) {
  const reservationIndex = this.reservations.findIndex(
    r => r.reservationId === reservationId
  );

  if (reservationIndex === -1) {
    return { success: false, reason: 'not_found' };
  }

  const reservation = this.reservations[reservationIndex];
  this.availableSeats += reservation.seats;
  this.version += 1;
  this.reservations.splice(reservationIndex, 1);

  return { success: true };
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
