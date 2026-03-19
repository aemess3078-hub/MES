import { Navigate, Outlet } from 'react-router-dom'
import { Spin } from 'antd'
import useAuthStore from '../../store/authStore'

export default function PrivateRoute() {
  const { session, loading } = useAuthStore()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
