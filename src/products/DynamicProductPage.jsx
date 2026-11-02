import { Navigate, useParams } from 'react-router-dom'
import EditableProductDetailPage from '../components/EditableProductDetailPage'
import { useSiteContent } from '../context/SiteContentContext'
import { defaultProductPageDetails } from '../lib/productPageDefaults'
import '../products_styles/ExtruderLinePage.css'

export default function DynamicProductPage() {
  const { productSlug } = useParams()
  const { get } = useSiteContent()
  const pages = get('products.details', defaultProductPageDetails) || defaultProductPageDetails
  const match = Object.entries(pages).find(([productId, page]) => {
    const slug = String(page?.slug || productId).replace(/^\/prodotti\//, '').replace(/^\/+|\/+$/g, '')
    return slug === productSlug
  })

  if (!match) return <Navigate to="/prodotti" replace />
  return <EditableProductDetailPage productId={match[0]} />
}
