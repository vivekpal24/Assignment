

function validateReservation({ partnerId, seats }) {
  // Validate partnerId
  if (!partnerId || typeof partnerId !== 'string' || partnerId.trim() === '') {
    return {
      valid: false,
      statusCode: 400,
      error: 'partnerId is required'
    };
  }

  // Validate seats
  if (typeof seats !== 'number' || !Number.isInteger(seats)) {
    return {
      valid: false,
      statusCode: 400,
      error: 'seats must be an integer'
    };
  }

  // Seats must be 1 to 10 as per assignment
  if (seats < 1 || seats > 10) {
    return {
      valid: false,
      statusCode: 400,
      error: 'seats must be between 1 and 10'
    };
  }

  return { valid: true };
}

module.exports = { validateReservation };
