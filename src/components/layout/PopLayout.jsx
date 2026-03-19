import { Layout, Button, Space, Typography, Avatar } from 'antd'
import { ArrowLeftOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { signOut } from '../../services/authService'

const { Header, Content } = Layout
const { Text } = Typography

export default function PopLayout() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
    clearAuth()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header
        style={{
          background: '#1677ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: '#fff', fontSize: 18 }}
        />
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>MES v0 POP</Text>
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <Text style={{ color: '#fff' }}>{user?.email ?? '작업자'}</Text>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#fff' }}
          />
        </Space>
      </Header>
      <Content style={{ padding: 16 }}>
        <Outlet />
      </Content>
    </Layout>
  )
}
