import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { OrganizerLayout } from '../layouts/OrganizerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { Home } from '../pages/public/Home';
import { EventsDiscovery } from '../pages/public/EventsDiscovery';
import { EventDetails } from '../pages/public/EventDetails';
import { Clubs } from '../pages/public/Clubs';
import { ClubDetails } from '../pages/public/ClubDetails';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentTickets } from '../pages/student/StudentTickets';
import { StudentHistory } from '../pages/student/StudentHistory';
import { StudentProfile } from '../pages/student/StudentProfile';

// Organizer Pages
import { OrganizerDashboard } from '../pages/organizer/OrganizerDashboard';
import { OrganizerEvents } from '../pages/organizer/OrganizerEvents';
import { CreateEvent } from '../pages/organizer/CreateEvent';
import { OrganizerEventManage } from '../pages/organizer/OrganizerEventManage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminClubs } from '../pages/admin/AdminClubs';
import { AdminEvents } from '../pages/admin/AdminEvents';

// Route Guards
import { RequireAuth, RequireRole } from './ProtectedRoutes';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsDiscovery />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Portal (Protected: STUDENT, ORGANIZER, ADMIN) */}
        <Route
          path="/student/dashboard"
          element={
            <RequireAuth>
              <StudentDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/student/tickets"
          element={
            <RequireAuth>
              <StudentTickets />
            </RequireAuth>
          }
        />
        <Route
          path="/student/history"
          element={
            <RequireAuth>
              <StudentHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/student/profile"
          element={
            <RequireAuth>
              <StudentProfile />
            </RequireAuth>
          }
        />
      </Route>

      {/* Organizer Portal with OrganizerLayout */}
      <Route
        element={
          <RequireAuth>
            <RequireRole roles={['ORGANIZER', 'ADMIN']}>
              <OrganizerLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route path="/organizer/events/create" element={<CreateEvent />} />
        <Route path="/organizer/events/:id" element={<OrganizerEventManage />} />
      </Route>

      {/* Admin Portal with AdminLayout */}
      <Route
        element={
          <RequireAuth>
            <RequireRole roles={['ADMIN']}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/clubs" element={<AdminClubs />} />
        <Route path="/admin/events" element={<AdminEvents />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
