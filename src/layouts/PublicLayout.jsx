import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="site-shell">
      <Navbar />

      <main className="site-main">
        {children}
      </main>

      <Footer />
    </div>
  )
}