import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Contact from './pages/Contact'
import About from './pages/About'
import Fleet from './pages/Fleet'
import FleetDetails from "./pages/FleetDetails";
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute, PublicOnlyRoute } from './context/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminVehiclesPage from './pages/admin/AdminFleetPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCarEditorPage from './pages/admin/AdminCarEditorPage'
import AdminCalendarPage from './pages/admin/AdminCalendarPage'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'



export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/fleet/:slug" element={<FleetDetails />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="fleet" element={<AdminVehiclesPage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="fleet/new" element={<AdminCarEditorPage />} />
          <Route path="fleet/:id" element={<AdminCarEditorPage />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}