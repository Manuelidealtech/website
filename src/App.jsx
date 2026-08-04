import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProductsPage from './pages/ProductsPage'
import PublicStorePage from './pages/PublicStorePage'
import ServicesPage from './pages/ServicesPage'
import ContactsPage from './pages/ContactsPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import MachineFormPage from './pages/MachineFormPage'
import MachineDetailPage from './pages/MachineDetailPage'
import AdminMachinesPage from './pages/AdminMachinesPage'
import AdminNewsPage from './pages/AdminNewsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminContactsPage from './pages/AdminContactsPage'
import NewsPage from './pages/NewsPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminOnlyRoute from './components/AdminOnlyRoute'
import PublicLayout from './layouts/PublicLayout'
import LegalPage from './pages/LegalPage'
import ScrollToTop from './components/ScrollToTop'
import AutoTranslate from './i18n/AutoTranslate'
import DrumLinePage from './products/DrumLinePage'
import ExtruderLinePage from './products/ExtruderLinePage'
import AssyLinePage from './products/AssyLinePage'
import CoatingHeadsPage from './products/CoatingHeadsPage'
import CustomMachinesPage from './products/CustomMachinesPage'
import IdealMeltPage from './products/IdealMeltPage'
import IdmGpPage from './products/IdmGpPage'
import GunLinePage from './products/GunLinePage'
import HoseLinePage from './products/HoseLinePage'
import ColdLinePage from './products/ColdLinePage'
import HandGunPage from './products/HandGunPage'
import SparePartsPage from './products/SparePartsPage'

export default function App() {
  return (
    <>
      <AutoTranslate />
      <ScrollToTop />

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

        <Route path="/termini-e-privacy" element={<LegalPage />} />

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

        <Route
          path="/admin/contatti"
          element={
            <AdminOnlyRoute>
              <AdminContactsPage />
            </AdminOnlyRoute>
          }
        />

        <Route
          path="/admin/utenti"
          element={
            <AdminOnlyRoute>
              <AdminUsersPage />
            </AdminOnlyRoute>
          }
        />
        
        <Route
          path="/prodotti/drum-line"
          element={
            <PublicLayout>
              <DrumLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/extruder-line"
          element={
            <PublicLayout>
              <ExtruderLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/assy-line"
          element={
            <PublicLayout>
              <AssyLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/coating-heads"
          element={
            <PublicLayout>
              <CoatingHeadsPage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/custom-machines"
          element={
            <PublicLayout>
              <CustomMachinesPage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/ideal-melt"
          element={
            <PublicLayout>
              <IdealMeltPage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/idm-gp"
          element={
            <PublicLayout>
              <IdmGpPage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/gun-line"
          element={
            <PublicLayout>
              <GunLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/hose-line"
          element={
            <PublicLayout>
              <HoseLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/cold-line"
          element={
            <PublicLayout>
              <ColdLinePage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/hand-gun"
          element={
            <PublicLayout>
              <HandGunPage />
            </PublicLayout>
          }
        />

        <Route
          path="/prodotti/spare-parts"
          element={
            <PublicLayout>
              <SparePartsPage />
            </PublicLayout>
          }
        />


      </Routes>
      
    </>
  )
}