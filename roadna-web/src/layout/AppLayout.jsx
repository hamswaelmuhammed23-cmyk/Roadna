import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'

export default function AppLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('userProfile')
    if (!user) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}
