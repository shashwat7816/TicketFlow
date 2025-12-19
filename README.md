# 🎟️ TicketFlow — Premium Venue Ticketing System

> A modern, full-featured ticketing platform for venues to sell events, manage seating, and handle customer support.

## ✨ Key Features

-   **🤖 AI Chatbot Assistant**: Built-in intelligent assistant for user queries (Refunds, Hosting, Pricing).
-   **💎 Premium UI**: Modern Dark Mode with Glassmorphism aesthetics and smooth animations.
-   **📊 Real-Time Analytics**: Admin Dashboard with real revenue tracking from actual sales.
-   **🎫 Flexible Ticketing**: Support for both **Seated** (choose your seat) and **General Admission** events.
-   **🔐 Role-Based Access**: Secure Admin and User roles with JWT authentication.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS (Glassmorphism).
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Running locally or Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (copy from `.env.example`):
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/ticketflow
JWT_SECRET=your_super_secret_key
```

Start the server:
```bash
npm run seed  # (Optional) Populates DB with sample events & admin user
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to start booking!

## 🧪 Admin Access (Seeded)
-   **Email**: `admin@example.com`
-   **Password**: `admin123`

## 🤝 Contributing
1.  Fork the repo
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
