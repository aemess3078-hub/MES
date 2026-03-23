import { Layout, Dropdown, Avatar, Badge, Typography, Button, Tooltip, Breadcrumb } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  RobotOutlined,
  BellOutlined,
  SettingOutlined,
  HomeOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { signOut } from '../../services/authService'

const { Header } = Layout
const { Text } = Typography

// 경로 → 타이틀 맵
const routeTitles = {
  '/dashboard': '대시보드',
  '/production/orders': '생산오더 관리',
  '/production/workorders': '작업지시 관리',
  '/production/monitor': '진행 현황',
  '/result': '생산실적 조회',
  '/quality/defects': '불량현황',
  '/equipment/status': '설비현황',
  '/equipment/check': '일상점검',
  '/equipment/cnc': 'CNC 모니터링',
  '/purchase/orders': '자재발주',
  '/purchase/receipts': '입고 관리',
  '/inventory': '재고현황',
  '/shipment': '출하 관리',
  '/master/partners': '거래처 관리',
  '/master/items': '품목 관리',
  '/master/bom': 'BOM 관리',
  '/master/processes': '공정 관리',
  '/master/routings': '공정 라우팅',
  '/master/equipments': '설비 관리',
  '/master/users': '사용자 관리',
  '/master/codes': '공통코드 관리',
}

export default function AppHeader({ collapsed, onCollapse, aiOpen, onAiToggle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    await signOut()
    clearAuth()
    navigate('/login')
  }

  const currentTitle = routeTitles[location.pathname] ?? 'MES'
  const userEmail = user?.email ?? '사용자'
  const userInitial = userEmail.charAt(0).toUpperCase()

  const userMenuItems = [
    {
      key: 'email',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{userEmail}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>관리자</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined style={{ color: '#ef4444' }} />,
      label: <span style={{ color: '#ef4444', fontWeight: 500 }}>로그아웃</span>,
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        padding: '0 20px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 56,
        lineHeight: '56px',
      }}
    >
      {/* 왼쪽: 토글 + 현재 페이지 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => onCollapse(!collapsed)}
          style={{ color: '#6b7280', fontSize: 16, width: 36, height: 36, borderRadius: 8 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 4, height: 18,
            background: 'linear-gradient(180deg, #4f46e5, #7c3aed)',
            borderRadius: 4,
          }} />
          <Text style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
            {currentTitle}
          </Text>
        </div>
      </div>

      {/* 오른쪽: AI Agent + 알림 + 유저 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

        {/* AI Agent 버튼 */}
        <button
          onClick={onAiToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 14px',
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            background: aiOpen
              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
              : '#f1f5f9',
            color: aiOpen ? '#fff' : '#475569',
            boxShadow: aiOpen ? '0 4px 14px rgba(79,70,229,0.4)' : 'none',
            transition: 'all 0.2s ease',
            lineHeight: 1,
          }}
          onMouseEnter={e => {
            if (!aiOpen) {
              e.currentTarget.style.background = '#e0e7ff'
              e.currentTarget.style.color = '#4f46e5'
            }
          }}
          onMouseLeave={e => {
            if (!aiOpen) {
              e.currentTarget.style.background = '#f1f5f9'
              e.currentTarget.style.color = '#475569'
            }
          }}
        >
          <RobotOutlined style={{ fontSize: 14 }} />
          AI Agent
          {aiOpen && (
            <span style={{
              width: 7, height: 7,
              background: '#4ade80',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: '0 0 0 2px rgba(74,222,128,0.3)',
              animation: 'pulse 2s infinite',
            }} />
          )}
        </button>

        <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 4px' }} />

        {/* 유저 드롭다운 */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
          overlayStyle={{ minWidth: 200 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '5px 10px 5px 5px',
              borderRadius: 20,
              background: 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {userInitial}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail.split('@')[0]}
              </div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>관리자</div>
            </div>
          </div>
        </Dropdown>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 2px rgba(74,222,128,0.3); }
          50% { opacity: 0.8; box-shadow: 0 0 0 4px rgba(74,222,128,0.15); }
        }
      `}</style>
    </Header>
  )
}
