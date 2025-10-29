function validateReservation(partnerId, seats) {
  // Validate partnerId
  if (!partnerId || typeof partnerId !== 'string' || partnerId.trim() === '') {
    return {
      valid: false,
      error: 'Partner ID is required and must be a non-empty string'
    };
  }

  // Validate seats
  if (typeof seats !== 'number' || !Number.isInteger(seats)) {
    return {
      valid: false,
      error: 'Seats must be an integer'
    };
  }

  // Ensure valid range
  if (seats < 1 || seats > 10) {
    return {
      valid: false,
      error: 'Seats must be between 1 and 10'
    };
  }

  return { valid: true };
}

module.exports = { validateReservation };
