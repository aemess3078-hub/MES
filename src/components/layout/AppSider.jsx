import { useState } from 'react'
import { Tooltip } from 'antd'
import {
  DashboardOutlined,
  ScheduleOutlined,
  BugOutlined,
  ToolOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ShopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '대시보드',
  },
  {
    key: 'sales',
    icon: <ShopOutlined />,
    label: '영업관리',
    children: [
      { key: '/production/orders', label: '생산오더 관리' },
      { key: '/shipment', label: '출하 관리' },
    ],
  },
  {
    key: 'production',
    icon: <ScheduleOutlined />,
    label: '생산관리',
    children: [
      { key: '/production/workorders', label: '작업지시 관리' },
      { key: '/production/monitor', label: '진행 현황' },
      { key: '/result', label: '생산실적 조회' },
    ],
  },
  {
    key: 'quality',
    icon: <BugOutlined />,
    label: '품질관리',
    children: [
      { key: '/quality/defects', label: '불량현황' },
    ],
  },
  {
    key: 'equipment',
    icon: <ToolOutlined />,
    label: '설비관리',
    children: [
      { key: '/equipment/status', label: '설비현황' },
      { key: '/equipment/check', label: '일상점검' },
      { key: '/equipment/cnc', label: 'CNC 모니터링' },
    ],
  },
  {
    key: 'purchase',
    icon: <ShoppingCartOutlined />,
    label: '구매/입고',
    children: [
      { key: '/purchase/orders', label: '자재발주' },
      { key: '/purchase/receipts', label: '입고 관리' },
    ],
  },
  {
    key: '/inventory',
    icon: <InboxOutlined />,
    label: '재고현황',
  },
  {
    key: 'master',
    icon: <DatabaseOutlined />,
    label: '기준정보',
    children: [
      { key: '/master/partners', label: '거래처 관리' },
      { key: '/master/items', label: '품목 관리' },
      { key: '/master/bom', label: 'BOM 관리' },
      { key: '/master/processes', label: '공정 관리' },
      { key: '/master/routings', label: '공정 라우팅' },
      { key: '/master/equipments', label: '설비 관리' },
      { key: '/master/users', label: '사용자 관리' },
      { key: '/master/codes', label: '공통코드 관리' },
    ],
  },
]

export default function AppSider({ collapsed, onCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [openGroups, setOpenGroups] = useState(() => {
    const active = menuItems.find(m => m.children?.some(c => location.pathname.startsWith(c.key)))
    return active ? [active.key] : []
  })

  const selectedKey = location.pathname

  const toggleGroup = (key) => {
    setOpenGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const isChildActive = (item) =>
    item.children?.some(c => selectedKey.startsWith(c.key))

  return (
    <>
      <div
        style={{
          width: collapsed ? 64 : 220,
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 200,
          overflow: 'hidden',
        }}
      >
        {/* 로고 */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0' : '0 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {/* 로고 아이콘 */}
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: -0.5 }}>M</span>
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                MES
              </div>
              <div style={{ color: '#64748b', fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>
                제조실행시스템
              </div>
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0' }}>
          {menuItems.map(item => {
            const isActive = selectedKey === item.key
            const isGroupActive = isChildActive(item)
            const isOpen = openGroups.includes(item.key)

            if (!item.children) {
              // 단일 메뉴
              const menuEl = (
                <div
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '10px 16px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    margin: '1px 8px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                      : 'transparent',
                    color: isActive ? '#fff' : '#94a3b8',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.35)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; if (!isActive) e.currentTarget.style.color = '#94a3b8' }}
                >
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
              )
              return collapsed ? (
                <Tooltip key={item.key} title={item.label} placement="right">
                  {menuEl}
                </Tooltip>
              ) : menuEl
            }

            // 그룹 메뉴
            return (
              <div key={item.key}>
                {collapsed ? (
                  <Tooltip title={item.label} placement="right">
                    <div
                      onClick={() => { onCollapse(false); setOpenGroups([item.key]) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px 0',
                        margin: '1px 8px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: isGroupActive ? '#818cf8' : '#94a3b8',
                        background: isGroupActive ? 'rgba(79,70,229,0.15)' : 'transparent',
                        fontSize: 15,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => { if (!isGroupActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
                      onMouseLeave={e => { if (!isGroupActive) e.currentTarget.style.background = 'transparent'; if (!isGroupActive) e.currentTarget.style.color = '#94a3b8' }}
                    >
                      {item.icon}
                    </div>
                  </Tooltip>
                ) : (
                  <>
                    <div
                      onClick={() => toggleGroup(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 16px',
                        margin: '1px 8px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        color: isGroupActive ? '#818cf8' : '#94a3b8',
                        fontWeight: isGroupActive ? 600 : 400,
                        fontSize: 13,
                        background: isGroupActive ? 'rgba(79,70,229,0.12)' : 'transparent',
                        transition: 'all 0.15s ease',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => { if (!isGroupActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#c8d0e0' }}
                      onMouseLeave={e => { if (!isGroupActive) e.currentTarget.style.background = 'transparent'; if (!isGroupActive) e.currentTarget.style.color = '#94a3b8' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 15 }}>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <RightOutlined style={{
                        fontSize: 10,
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        opacity: 0.6,
                      }} />
                    </div>
                    {/* 서브메뉴 */}
                    <div style={{
                      overflow: 'hidden',
                      maxHeight: isOpen ? `${item.children.length * 38}px` : '0',
                      transition: 'max-height 0.25s ease',
                    }}>
                      {item.children.map(child => {
                        const isChildSelected = selectedKey.startsWith(child.key)
                        return (
                          <div
                            key={child.key}
                            onClick={() => navigate(child.key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 16px 8px 46px',
                              margin: '1px 8px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: isChildSelected ? 600 : 400,
                              color: isChildSelected ? '#fff' : '#64748b',
                              background: isChildSelected
                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                : 'transparent',
                              transition: 'all 0.15s ease',
                              boxShadow: isChildSelected ? '0 2px 8px rgba(79,70,229,0.3)' : 'none',
                              position: 'relative',
                            }}
                            onMouseEnter={e => { if (!isChildSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#cbd5e1' } }}
                            onMouseLeave={e => { if (!isChildSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
                          >
                            {child.label}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </nav>

        {/* 하단 접기 버튼 */}
        <div
          onClick={() => onCollapse(!collapsed)}
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            padding: collapsed ? 0 : '0 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
            color: '#475569',
            fontSize: 14,
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      <style>{`
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </>
  )
}
