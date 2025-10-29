require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🎟️ TicketBoss API running on port ${PORT}`);
    console.log(`📍 Base URL: http://localhost:${PORT}`);
    console.log(`\n📚 Available endpoints:`);
    console.log(`   GET    /reservations/           - Get event summary`);
    console.log(`   POST   /reservations/           - Reserve seats`);
    console.log(`   DELETE /reservations/:id        - Cancel reservation`);
  });
})();
