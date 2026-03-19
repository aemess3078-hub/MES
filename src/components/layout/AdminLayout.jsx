import { useState } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppSider from './AppSider'
import AppHeader from './AppHeader'
import AiAgentPanel from './AiAgentPanel'

const { Content } = Layout

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSider collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        style={{
          transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginRight: aiOpen ? 360 : 0,
        }}
      >
        <AppHeader
          collapsed={collapsed}
          onCollapse={setCollapsed}
          aiOpen={aiOpen}
          onAiToggle={() => setAiOpen(prev => !prev)}
        />
        <Content style={{ margin: '16px', minHeight: 'calc(100vh - 96px)' }}>
          <Outlet />
        </Content>
      </Layout>
      <AiAgentPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </Layout>
  )
}
