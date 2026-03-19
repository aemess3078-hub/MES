import { Layout, Dropdown, Avatar, Space, Typography, Button, Tooltip } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { signOut } from '../../services/authService'

const { Header } = Layout
const { Text } = Typography

export default function AppHeader({ collapsed, onCollapse, aiOpen, onAiToggle }) {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
    clearAuth()
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        padding: '0 16px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => onCollapse(!collapsed)}
        style={{ fontSize: 16 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Tooltip title={aiOpen ? 'AI Agent 닫기' : 'AI Agent 열기'}>
          <Button
            type={aiOpen ? 'primary' : 'default'}
            icon={<RobotOutlined />}
            onClick={onAiToggle}
            style={{
              borderRadius: 20,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              background: aiOpen
                ? 'linear-gradient(135deg, #1677ff, #0958d9)'
                : undefined,
              border: aiOpen ? 'none' : undefined,
              boxShadow: aiOpen ? '0 2px 8px rgba(22,119,255,0.4)' : undefined,
            }}
          >
            AI Agent
          </Button>
        </Tooltip>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} size="small" />
            <Text>{user?.email ?? '사용자'}</Text>
          </Space>
        </Dropdown>
      </div>
    </Header>
  )
}
