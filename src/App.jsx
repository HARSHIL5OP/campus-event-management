import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { Toaster } from "sonner"
import AuthLayout from "./layouts/AuthLayout"
import DashboardLayout from "./layouts/DashboardLayout"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import Home from "./pages/Home"
import CreateEvent from "./pages/organizer/CreateEvent"
import OrganizerRoute from "./components/auth/OrganizerRoute"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import StudentRoute from "./components/auth/StudentRoute"
import EventListing from "./pages/student/EventListing"
import EventDetails from "./pages/student/EventDetails"
import StudentDashboard from "./pages/student/Dashboard"
import OrganizerDashboard from "./pages/organizer/Dashboard"
import MyEvents from "./pages/organizer/MyEvents"
import OrganizerEventDetails from "./pages/organizer/EventDetails"
import { Loader2 } from "lucide-react"

// Redirects to the appropriate dashboard based on role
const RootRedirect = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // If not logged in, you might want to show a public landing page or login
    // For this app, we'll redirect to login
    return <Navigate to="/login" replace />;
  }

  if (userProfile?.role === "organizer") {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  // Default to student dashboard
  return <Navigate to="/student/dashboard" replace />;
}

const PublicRoute = () => {
  const { user, loading } = useAuth()

  if (loading) return null;

  // If already logged in, let the RootRedirect handle where they go
  return !user ? <Outlet /> : <RootRedirect />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors theme="light" />
        <Routes>
          {/* Public Authentication Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
            {/* Optional Public Home if needed, for now we redirect root to Dashboard logic */}
            {/* <Route path="/home" element={<Home />} /> */}
          </Route>

          {/* Main App Layout (Sidebar + Content) - Protected */}
          <Route element={<DashboardLayout />}>

            {/* Student Routes */}
            <Route element={<StudentRoute />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/events" element={<EventListing />} />
              <Route path="/event/:id" element={<EventDetails />} />
              {/* Alias for cleaner url if desired, but user asked for specific routes */}
            </Route>

            {/* Organizer Routes */}
            <Route element={<OrganizerRoute />}>
              <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
              <Route path="/organizer/events/create" element={<CreateEvent />} />
              <Route path="/organizer/events" element={<MyEvents />} />
              <Route path="/organizer/events/:eventId" element={<OrganizerEventDetails />} />
            </Route>

          </Route>

          {/* Root Path Handling */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/home" element={<RootRedirect />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
