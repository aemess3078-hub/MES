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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AppSider collapsed={collapsed} onCollapse={setCollapsed} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'margin-right 0.3s cubic-bezier(0.4,0,0.2,1)',
        marginRight: aiOpen ? 360 : 0,
        minWidth: 0,
        marginLeft: 0,
      }}>
        <AppHeader
          collapsed={collapsed}
          onCollapse={setCollapsed}
          aiOpen={aiOpen}
          onAiToggle={() => setAiOpen(prev => !prev)}
        />
        <main style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}>
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <AiAgentPanel open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
