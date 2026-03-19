import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  ScheduleOutlined,
  BugOutlined,
  ToolOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  SendOutlined,
  ShopOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

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
      { key: '/equipment/check',  label: '일상점검' },
      { key: '/equipment/cnc',    label: 'CNC 모니터링' },
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

  const selectedKey = location.pathname
  const openKeys = menuItems
    .filter((m) => m.children?.some((c) => selectedKey.startsWith(c.key)))
    .map((m) => m.key)

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={220}
      style={{ overflow: 'auto', height: '100vh', position: 'sticky', top: 0, left: 0 }}
    >
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 700,
          letterSpacing: 1,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
        }}
      >
        {collapsed ? 'MES' : 'MES v0'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  )
}
