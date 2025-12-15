import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './App'
import EventList from './pages/EventList'
import EventDetail from './pages/EventDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateEvent from './pages/CreateEvent'
import AdminDashboard from './pages/AdminDashboard'
import MyTickets from './pages/MyTickets'
import EditEvent from './pages/EditEvent'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<EventList />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              <Route path="my-tickets" element={<MyTickets />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="create-event" element={<CreateEvent />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
