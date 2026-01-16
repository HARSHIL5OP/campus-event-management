import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import AuthLayout from "./layouts/AuthLayout"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import Home from "./pages/Home"
import CreateEvent from "./pages/organizer/CreateEvent"
import OrganizerRoute from "./components/auth/OrganizerRoute"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import StudentRoute from "./components/auth/StudentRoute"
import EventDetails from "./pages/student/EventDetails"

import EventListing from "./pages/student/EventListing"

const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

const PublicRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return !user ? <Outlet /> : <Navigate to="/home" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" richColors theme="light" />
        <Routes>
          {/* Public Routes - Redirect to Home if logged in */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* Protected Routes - Redirect to Login if not logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            {/* Event Details is accessible to all authenticated users, but actions are restricted by role within the page */}
            <Route path="/event/:id" element={<EventDetails />} />
          </Route>

          {/* Student Routes - Protected by Role */}
          <Route element={<StudentRoute />}>
            <Route path="/events" element={<EventListing />} />
          </Route>

          {/* Organizer Routes - Protected by Role */}
          <Route element={<OrganizerRoute />}>
            <Route path="/organizer/events/create" element={<CreateEvent />} />
          </Route>

          {/* Fallback route */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
