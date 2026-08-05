import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminOnlyRoute from './components/AdminOnlyRoute'
import ScrollToTop from './components/ScrollToTop'
import SeoManager from './components/SeoManager'
import AutoTranslate from './i18n/AutoTranslate'
import PublicLayout from './layouts/PublicLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const PublicStorePage = lazy(() => import('./pages/PublicStorePage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const MachineDetailPage = lazy(() => import('./pages/MachineDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const MachineFormPage = lazy(() => import('./pages/MachineFormPage'))
const AdminMachinesPage = lazy(() => import('./pages/AdminMachinesPage'))
const AdminNewsPage = lazy(() => import('./pages/AdminNewsPage'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminContactsPage = lazy(() => import('./pages/AdminContactsPage'))
const AdminSeoPage = lazy(() => import('./pages/AdminSeoPage'))

const DrumLinePage = lazy(() => import('./products/DrumLinePage'))
const ExtruderLinePage = lazy(() => import('./products/ExtruderLinePage'))
const AssyLinePage = lazy(() => import('./products/AssyLinePage'))
const CoatingHeadsPage = lazy(() => import('./products/CoatingHeadsPage'))
const CustomMachinesPage = lazy(() => import('./products/CustomMachinesPage'))
const IdealMeltPage = lazy(() => import('./products/IdealMeltPage'))
const IdmGpPage = lazy(() => import('./products/IdmGpPage'))
const GunLinePage = lazy(() => import('./products/GunLinePage'))
const HoseLinePage = lazy(() => import('./products/HoseLinePage'))
const ColdLinePage = lazy(() => import('./products/ColdLinePage'))
const HandGunPage = lazy(() => import('./products/HandGunPage'))
const SparePartsPage = lazy(() => import('./products/SparePartsPage'))

function PublicPage({ children }) {
  return <PublicLayout>{children}</PublicLayout>
}

function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="route-loader__spinner" aria-hidden="true" />
      <span>Caricamento...</span>
    </div>
  )
}

export default function App() {
  return (
    <>
      <AutoTranslate />
      <ScrollToTop />
      <SeoManager />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<PublicPage><HomePage /></PublicPage>} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/chi-siamo" element={<PublicPage><AboutPage /></PublicPage>} />
          <Route path="/prodotti" element={<PublicPage><ProductsPage /></PublicPage>} />
          <Route path="/store" element={<PublicPage><PublicStorePage /></PublicPage>} />
          <Route path="/servizi" element={<PublicPage><ServicesPage /></PublicPage>} />
          <Route path="/contatti" element={<PublicPage><ContactsPage /></PublicPage>} />
          <Route path="/news" element={<PublicPage><NewsPage /></PublicPage>} />
          <Route path="/termini-e-privacy" element={<LegalPage />} />
          <Route path="/macchinario/:slug" element={<PublicPage><MachineDetailPage /></PublicPage>} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/macchinari" element={<ProtectedRoute><AdminMachinesPage /></ProtectedRoute>} />
          <Route path="/admin/macchinari/nuovo" element={<ProtectedRoute><MachineFormPage /></ProtectedRoute>} />
          <Route path="/admin/macchinari/:id/modifica" element={<ProtectedRoute><MachineFormPage /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><AdminNewsPage /></ProtectedRoute>} />
          <Route path="/admin/contatti" element={<AdminOnlyRoute><AdminContactsPage /></AdminOnlyRoute>} />
          <Route path="/admin/utenti" element={<AdminOnlyRoute><AdminUsersPage /></AdminOnlyRoute>} />
          <Route path="/admin/seo" element={<AdminOnlyRoute><AdminSeoPage /></AdminOnlyRoute>} />

          <Route path="/prodotti/drum-line" element={<PublicPage><DrumLinePage /></PublicPage>} />
          <Route path="/prodotti/extruder-line" element={<PublicPage><ExtruderLinePage /></PublicPage>} />
          <Route path="/prodotti/assy-line" element={<PublicPage><AssyLinePage /></PublicPage>} />
          <Route path="/prodotti/coating-heads" element={<PublicPage><CoatingHeadsPage /></PublicPage>} />
          <Route path="/prodotti/custom-machines" element={<PublicPage><CustomMachinesPage /></PublicPage>} />
          <Route path="/prodotti/ideal-melt" element={<PublicPage><IdealMeltPage /></PublicPage>} />
          <Route path="/prodotti/idm-gp" element={<PublicPage><IdmGpPage /></PublicPage>} />
          <Route path="/prodotti/gun-line" element={<PublicPage><GunLinePage /></PublicPage>} />
          <Route path="/prodotti/hose-line" element={<PublicPage><HoseLinePage /></PublicPage>} />
          <Route path="/prodotti/cold-line" element={<PublicPage><ColdLinePage /></PublicPage>} />
          <Route path="/prodotti/hand-gun" element={<PublicPage><HandGunPage /></PublicPage>} />
          <Route path="/prodotti/spare-parts" element={<PublicPage><SparePartsPage /></PublicPage>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
