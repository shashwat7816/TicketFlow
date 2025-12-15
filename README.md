# 🎟️ TicketFlow

TicketFlow is a modern, full-featured event ticketing system built with the MERN stack (MongoDB, Express, React, Node.js). It allows users to browse events, book tickets (seated or general admission), and manage their orders. Administrators have a dedicated dashboard to create and manage events, view sales analytics, and more.

## ✨ Features

- **Event Management**: Create and edit events with details like banners, capacity, ticket types (Seated/General), and pricing.
- **Booking System**: Secure ticket booking with atomic transactions to prevent double-booking.
- **Seat Selection**: Interactive seating charts for seated events.
- **User Dashboard**: View booking history and manage profile.
- **Admin Dashboard**: Comprehensive analytics, event management, and system oversight.
- **Authentication**: Secure Login/Register functionality with JWT.
- **Modern UI/UX**: Designed with Tailwind CSS, featuring glassmorphism effects, animated backgrounds, and a responsive layout.

## 🛠️ Tech Stack

- **Frontend**: Vite + React, Tailwind CSS, Lucide React (Icons)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (for database)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/shashwat7816/TicketFlow.git
    cd TicketFlow
    ```

2.  **Backend Setup**
    
    Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```

    Create a `.env` file in the `backend` directory with the following variables:
    ```env
    PORT=4000
    MONGO_URI=your_mongodb_atlas_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```
    
    *To get your `MONGO_URI`, create a cluster in MongoDB Atlas, click "Connect", choose "Drivers", and copy the connection string.*

    Start the backend server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**

    Open a new terminal, navigate to the frontend directory, and install dependencies:
    ```bash
    cd frontend
    npm install
    ```

    Create a `.env` file in the `frontend` directory:
    ```env
    VITE_API_URL=http://localhost:4000/api
    ```

    Start the frontend development server:
    ```bash
    npm run dev
    ```

4.  **Database Seeding (Optional)**
    
    To populate the database with initial test data:
    ```bash
    cd backend
    npm run seed
    ```

### 🌐 Usage

- Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).
- Register a new account to book tickets.
- Use the Admin credentials (or create an admin user via database) to access the Admin Dashboard.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.
