import { useNavigate } from 'react-router-dom'

export default function BackButton({ fallback = '/' }) {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  return (
    <button type="button" className="secondary-btn" onClick={handleBack}>
      ← Indietro
    </button>
  )
}