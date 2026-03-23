import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App as AntApp, Spin, ConfigProvider } from 'antd'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import PrivateRoute from './components/layout/PrivateRoute'
import AdminLayout from './components/layout/AdminLayout'
import PopLayout from './components/layout/PopLayout'

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))

// Admin pages
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const ProductionOrderListPage = lazy(() => import('./pages/production/ProductionOrderListPage'))
const ProductionOrderDetailPage = lazy(() => import('./pages/production/ProductionOrderDetailPage'))
const WorkOrderListPage = lazy(() => import('./pages/production/WorkOrderListPage'))
const WorkOrderMonitorPage = lazy(() => import('./pages/production/WorkOrderMonitorPage'))
const WorkOrderDetailPage = lazy(() => import('./pages/production/WorkOrderDetailPage'))
const ProductionResultPage = lazy(() => import('./pages/result/ProductionResultPage'))
const DefectStatusPage = lazy(() => import('./pages/quality/DefectStatusPage'))
const EquipmentStatusPage = lazy(() => import('./pages/equipment/EquipmentStatusPage'))
const EquipmentCheckPage  = lazy(() => import('./pages/equipment/EquipmentCheckPage'))
const CncMonitorPage      = lazy(() => import('./pages/equipment/CncMonitorPage'))

// Purchase & Inventory
const PurchaseOrderPage = lazy(() => import('./pages/purchase/PurchaseOrderPage'))
const GoodsReceiptPage = lazy(() => import('./pages/purchase/GoodsReceiptPage'))
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage'))
const ShipmentPage = lazy(() => import('./pages/shipment/ShipmentPage'))

// Master
const BusinessPartnerPage = lazy(() => import('./pages/master/BusinessPartnerPage'))
const ItemPage = lazy(() => import('./pages/master/ItemPage'))
const BomPage = lazy(() => import('./pages/master/BomPage'))
const ProcessPage = lazy(() => import('./pages/master/ProcessPage'))
const ProcessRoutingPage = lazy(() => import('./pages/master/ProcessRoutingPage'))
const EquipmentPage = lazy(() => import('./pages/master/EquipmentPage'))
const UserPage = lazy(() => import('./pages/master/UserPage'))
const CommonCodePage = lazy(() => import('./pages/master/CommonCodePage'))

// POP
const PopWorkListPage = lazy(() => import('./pages/pop/PopWorkListPage'))
const PopWorkDetailPage = lazy(() => import('./pages/pop/PopWorkDetailPage'))
const PopResultInputPage = lazy(() => import('./pages/pop/PopResultInputPage'))
const PopDefectInputPage = lazy(() => import('./pages/pop/PopDefectInputPage'))
const PopDowntimeInputPage = lazy(() => import('./pages/pop/PopDowntimeInputPage'))

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
)

function AppRoutes() {
  const { setSession } = useAuthStore()

  const upsertUserProfile = (user) => {
    if (!user) return
    supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? '사용자',
    }, { onConflict: 'id' }).then(() => {})
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      upsertUserProfile(data.session?.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      upsertUserProfile(session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<PrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="production/orders" element={<ProductionOrderListPage />} />
            <Route path="production/orders/:id" element={<ProductionOrderDetailPage />} />
            <Route path="production/workorders" element={<WorkOrderListPage />} />
            <Route path="production/monitor" element={<WorkOrderMonitorPage />} />
            <Route path="production/workorders/:id" element={<WorkOrderDetailPage />} />
            <Route path="result" element={<ProductionResultPage />} />
            <Route path="quality/defects" element={<DefectStatusPage />} />
            <Route path="equipment/status" element={<EquipmentStatusPage />} />
            <Route path="equipment/check"  element={<EquipmentCheckPage />} />
            <Route path="equipment/cnc"   element={<CncMonitorPage />} />
            <Route path="purchase/orders" element={<PurchaseOrderPage />} />
            <Route path="purchase/receipts" element={<GoodsReceiptPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="shipment" element={<ShipmentPage />} />
            <Route path="master/partners" element={<BusinessPartnerPage />} />
            <Route path="master/items" element={<ItemPage />} />
            <Route path="master/bom" element={<BomPage />} />
            <Route path="master/processes" element={<ProcessPage />} />
            <Route path="master/routings" element={<ProcessRoutingPage />} />
            <Route path="master/equipments" element={<EquipmentPage />} />
            <Route path="master/users" element={<UserPage />} />
            <Route path="master/codes" element={<CommonCodePage />} />
          </Route>
        </Route>
        <Route path="pop" element={<PrivateRoute />}>
          <Route element={<PopLayout />}>
            <Route index element={<Navigate to="/pop/worklist" replace />} />
            <Route path="worklist" element={<PopWorkListPage />} />
            <Route path="work/:id" element={<PopWorkDetailPage />} />
            <Route path="result/:id" element={<PopResultInputPage />} />
            <Route path="defect/:id" element={<PopDefectInputPage />} />
            <Route path="downtime/:id" element={<PopDowntimeInputPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#4f46e5',
            colorPrimaryHover: '#6366f1',
            colorPrimaryActive: '#3730a3',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorError: '#ef4444',
            colorInfo: '#3b82f6',
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
            fontSize: 13,
            colorBgContainer: '#ffffff',
            colorBgLayout: '#f1f5f9',
            colorBorder: '#e5e7eb',
            colorBorderSecondary: '#f3f4f6',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
            colorTextTertiary: '#9ca3af',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
            boxShadowSecondary: '0 4px 16px rgba(0,0,0,0.10)',
            controlHeight: 36,
            controlHeightLG: 42,
            controlHeightSM: 28,
            paddingContentVertical: 10,
            paddingContentHorizontal: 14,
          },
          components: {
            Table: {
              headerBg: '#f8fafc',
              headerColor: '#6b7280',
              headerSortActiveBg: '#f1f5f9',
              rowHoverBg: '#f5f3ff',
              borderColor: '#f3f4f6',
              headerBorderRadius: 0,
              cellPaddingBlock: 10,
              cellPaddingInline: 14,
            },
            Card: {
              headerFontSize: 14,
              headerFontSizeSM: 13,
              paddingLG: 20,
            },
            Button: {
              fontWeight: 600,
              primaryShadow: '0 2px 8px rgba(79,70,229,0.25)',
            },
            Menu: {
              darkItemBg: '#0f172a',
              darkSubMenuItemBg: '#0f172a',
              darkItemSelectedBg: '#4f46e5',
            },
            Modal: {
              borderRadiusLG: 16,
              paddingMD: 24,
            },
            Select: {
              optionSelectedBg: '#eef2ff',
              optionSelectedColor: '#4f46e5',
            },
            Input: {
              activeShadow: '0 0 0 2px rgba(79,70,229,0.12)',
            },
            Tag: {
              borderRadiusSM: 6,
              fontSizeSM: 11,
            },
            Pagination: {
              itemActiveBg: '#4f46e5',
            },
            Statistic: {
              titleFontSize: 12,
              contentFontSize: 26,
            },
          },
        }}
      >
        <AntApp>
          <AppRoutes />
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
