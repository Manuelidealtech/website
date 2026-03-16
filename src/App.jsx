import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProductsPage from './pages/ProductsPage'
import SpecialMachinesPage from './pages/SpecialMachinesPage'
import PublicStorePage from './pages/PublicStorePage'
import ServicesPage from './pages/ServicesPage'
import ContactsPage from './pages/ContactsPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import MachineFormPage from './pages/MachineFormPage'
import MachineDetailPage from './pages/MachineDetailPage'
import AdminMachinesPage from './pages/AdminMachinesPage'
import AdminNewsPage from './pages/AdminNewsPage'
import NewsPage from './pages/NewsPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />

      <Route path="/home" element={<Navigate to="/" replace />} />

      <Route
        path="/chi-siamo"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />

      <Route
        path="/prodotti"
        element={
          <PublicLayout>
            <ProductsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/special-machines"
        element={
          <PublicLayout>
            <SpecialMachinesPage />
          </PublicLayout>
        }
      />

      <Route
        path="/store"
        element={
          <PublicLayout>
            <PublicStorePage />
          </PublicLayout>
        }
      />

      <Route
        path="/servizi"
        element={
          <PublicLayout>
            <ServicesPage />
          </PublicLayout>
        }
      />

      <Route
        path="/contatti"
        element={
          <PublicLayout>
            <ContactsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/news"
        element={
          <PublicLayout>
            <NewsPage />
          </PublicLayout>
        }
      />

      <Route
        path="/macchinario/:slug"
        element={
          <PublicLayout>
            <MachineDetailPage />
          </PublicLayout>
        }
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/macchinari"
        element={
          <ProtectedRoute>
            <AdminMachinesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/macchinari/nuovo"
        element={
          <ProtectedRoute>
            <MachineFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/macchinari/:id/modifica"
        element={
          <ProtectedRoute>
            <MachineFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/news"
        element={
          <ProtectedRoute>
            <AdminNewsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}