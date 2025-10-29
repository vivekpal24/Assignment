# TicketBoss – Event Ticketing API

TicketBoss is a lightweight event ticketing API designed to handle real-time seat reservations with **Optimistic Concurrency Control** to prevent overbooking.  
This project is built as part of a backend assignment and follows clean code, modular architecture, and RESTful best practices.

---

## 📌 Features

- Real-time seat reservation (1–10 seats per request)
- Prevents overbooking using **Optimistic Concurrency Control**
- Cancel reservations and restore seats to pool
- Event summary with reservation count and seat availability
- Modular folder structure for scalability
- Input validation and centralized error handling

---

## 🚀 Tech Stack

| Technology | Usage |
|------------|--------|
| Node.js | Runtime |
| Express.js | REST API Framework |
| MongoDB + Mongoose | Database & ODM |
| UUID | Unique reservation IDs |
| Dotenv | Environment variables |

---

## 📂 Project Structure

```
TICKETBOSS
│
├─ src
│  ├─ config
│  │  └─ db.js
│  ├─ controllers
│  │  └─ reservationController.js
│  ├─ middleware
│  │  └─ errorHandler.js
│  ├─ models
│  │  ├─ EventModel.js
│  │  └─ ReservationModel.js
│  ├─ services
│  │  └─ eventService.js
│  ├─ utils
│  │  └─ validator.js
│  ├─ app.js
│  └─ server.js
│
├─ tests
├─ .env
├─ .gitignore
├─ package.json
└─ README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/vivekpal24/Assignment.git
cd Assignment
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory:

```
MONGO_URI=mongodb+srv://<user_name>:<password>@ticketboss.hoohh3f.mongodb.net/ticketboss
PORT=3000

```

### 4️⃣ Start the Server
```bash
npm start
```

Server will start at:  
`http://localhost:3000`

---

## 🧪 API Documentation

### ✅ **POST /reservations**

Create a reservation for 1–10 seats.

**Request Body**
```json
{
  "partnerId": "abc-corp",
  "seats": 3
}
```

**201 Created**
```json
{
  "reservationId": "xxxxx-xxxx-xxxx",
  "seats": 3,
  "status": "confirmed"
}
```

**400 Bad Request**
```json
{ "error": "seats must be between 1 and 10" }
```

**409 Conflict**
```json
{ "error": "Not enough seats left" }
```

---

### ❌ **DELETE /reservations/:reservationId**

Cancel a reservation and restore seats back to pool.

**204 No Content**  
Reservation cancelled successfully.

**404 Not Found**
```json
{ "error": "Reservation not found" }
```

---

### 📍 **GET /reservations**

Returns all reservations.

**200 OK**
```json
[
  {
    "reservationId": "xxxxx",
    "partnerId": "abc-corp",
    "seats": 3,
    "status": "confirmed"
  }
]
```

---

### 📊 **GET /event-summary**

Returns current event stats.

**200 OK**
```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 42,
  "reservationCount": 458,
  "version": 14
}
```

---

## 🧠 How Optimistic Concurrency is Handled

To avoid overbooking during simultaneous requests:

1. System reads event document with its current `version`
2. Attempts atomic update using:
   ```js
   findOneAndUpdate(
     { eventId, version },
     { $inc: { version: 1, availableSeats: -seats } }
   )
   ```
3. If version mismatch → another request updated it first → retry
4. Ensures two users cannot book the same seats at the same time

**Result:** No race-conditions, no double booking ✅

---

## 🧱 Technical Decisions & Assumptions

| Decision | Reason |
|----------|--------|
| Separate Reservation & Event collections | Keeps event document small and clean |
| Version field in Event | Enables optimistic concurrency control |
| Max 10 seats per request | Matches assignment requirement |
| Centralized error handler | Standard response format |
| UUID for reservationId | Ensures uniqueness across partners |

---

## 🚀 Future Enhancements

- Add Idempotency Key to avoid duplicate bookings from retries
- Add Redis or MongoDB Transactions for stronger guarantees
- Add Authentication & Partner API Keys
- Add Rate Limiting to avoid misuse
- Create Postman Collection for easier testing

---

## ✅ Status

This project fulfills all the core requirements of the assignment:

✔ Event bootstrap  
✔ Seat reservation (1–10 seats)  
✔ Prevent overbooking  
✔ Cancel reservations  
✔ Event summary endpoint  
✔ Clean code, validation, comments, and documentation  
