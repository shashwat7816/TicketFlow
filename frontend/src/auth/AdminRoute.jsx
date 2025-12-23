import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function AdminRoute() {
    const { user, loading } = useAuth()

    if (loading) return null // or a loading spinner

    if (!user || !user.roles.includes('admin')) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
