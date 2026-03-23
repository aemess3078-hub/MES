import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ── 메뉴 데이터 ──────────────────────────────────────────
const menuGroups = [
  {
    key: '/dashboard',
    icon: '◈',
    label: '대시보드',
    desc: 'Overview',
    color: '#6366f1',
    grad: 'linear-gradient(135deg,#4f46e5,#818cf8)',
  },
  {
    key: 'sales',
    icon: '◉',
    label: '영업',
    desc: 'Sales',
    color: '#0ea5e9',
    grad: 'linear-gradient(135deg,#0284c7,#38bdf8)',
    children: [
      { key: '/production/orders', label: '생산오더 관리', icon: '📋', desc: 'Orders' },
      { key: '/shipment',          label: '출하 관리',     icon: '🚚', desc: 'Shipment' },
    ],
  },
  {
    key: 'production',
    icon: '◆',
    label: '생산',
    desc: 'Production',
    color: '#10b981',
    grad: 'linear-gradient(135deg,#059669,#34d399)',
    children: [
      { key: '/production/workorders', label: '작업지시',     icon: '📝', desc: 'Work Order' },
      { key: '/production/monitor',    label: '진행 현황',   icon: '📊', desc: 'Monitor' },
      { key: '/result',                label: '생산실적',     icon: '📈', desc: 'Results' },
    ],
  },
  {
    key: 'quality',
    icon: '◐',
    label: '품질',
    desc: 'Quality',
    color: '#f59e0b',
    grad: 'linear-gradient(135deg,#d97706,#fbbf24)',
    children: [
      { key: '/quality/defects', label: '불량현황', icon: '🔍', desc: 'Defects' },
    ],
  },
  {
    key: 'equipment',
    icon: '◎',
    label: '설비',
    desc: 'Equipment',
    color: '#ef4444',
    grad: 'linear-gradient(135deg,#dc2626,#f87171)',
    children: [
      { key: '/equipment/status', label: '설비현황',     icon: '🔧', desc: 'Status' },
      { key: '/equipment/check',  label: '일상점검',     icon: '✅', desc: 'Daily Check' },
      { key: '/equipment/cnc',    label: 'CNC 모니터링', icon: '🖥️', desc: 'CNC' },
    ],
  },
  {
    key: 'purchase',
    icon: '◇',
    label: '구매',
    desc: 'Purchase',
    color: '#8b5cf6',
    grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    children: [
      { key: '/purchase/orders',   label: '자재발주',  icon: '📦', desc: 'Orders' },
      { key: '/purchase/receipts', label: '입고 관리', icon: '📥', desc: 'Receipt' },
    ],
  },
  {
    key: '/inventory',
    icon: '▣',
    label: '재고',
    desc: 'Inventory',
    color: '#06b6d4',
    grad: 'linear-gradient(135deg,#0891b2,#22d3ee)',
  },
  {
    key: 'master',
    icon: '▤',
    label: '기준정보',
    desc: 'Master',
    color: '#64748b',
    grad: 'linear-gradient(135deg,#475569,#94a3b8)',
    children: [
      { key: '/master/partners',   label: '거래처',   icon: '🤝', desc: 'Partners' },
      { key: '/master/items',      label: '품목',     icon: '🏷️', desc: 'Items' },
      { key: '/master/bom',        label: 'BOM',      icon: '🌿', desc: 'BOM' },
      { key: '/master/processes',  label: '공정',     icon: '⚙️', desc: 'Process' },
      { key: '/master/routings',   label: '라우팅',   icon: '🔀', desc: 'Routing' },
      { key: '/master/equipments', label: '설비',     icon: '🔩', desc: 'Equipment' },
      { key: '/master/users',      label: '사용자',   icon: '👤', desc: 'Users' },
      { key: '/master/codes',      label: '공통코드', icon: '🗃️', desc: 'Codes' },
    ],
  },
]

export default function AppSider({ collapsed, onCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeGroup, setActiveGroup] = useState(null)
  const [hoveredChild, setHoveredChild] = useState(null)
  const containerRef = useRef(null)

  const selectedKey = location.pathname

  // 자식 없는 메뉴는 완전 일치, 자식 있는 메뉴는 자식 경로 중 하나와 완전 일치 또는 하위 경로
  const isChildMatch = (childKey, path) => {
    if (path === childKey) return true
    // 슬래시로 끝나지 않는 경우 정확한 prefix 매칭 (예: /result → /result/xxx 는 매칭, /results 는 미매칭)
    return path.startsWith(childKey + '/')
  }

  const isGroupActive = (g) => {
    if (!g.children) return g.key === selectedKey
    return g.children.some(c => isChildMatch(c.key, selectedKey))
  }

  const currentGroup = menuGroups.find(g => isGroupActive(g))

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveGroup(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openGroup = activeGroup
    ? menuGroups.find(g => g.key === activeGroup)
    : null

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 300 }}>
      {/* ─── 세로 사이드바 레일 ─── */}
      <div style={{
        width: 72,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0d1a 0%, #0f1629 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}>
        {/* 로고 */}
        <div
          onClick={() => { navigate('/dashboard'); setActiveGroup(null) }}
          style={{
            width: 72, height: 64,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(79,70,229,0.6), 0 4px 12px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 광택 효과 */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '12px 12px 0 0',
            }} />
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 17, letterSpacing: -1, position: 'relative', zIndex: 1 }}>M</span>
          </div>
        </div>

        {/* 메뉴 아이템들 */}
        <nav style={{ flex: 1, width: '100%', paddingTop: 8, paddingBottom: 8, overflowY: 'auto' }}>
          {menuGroups.map(g => {
            const active = isGroupActive(g)
            const isOpen = activeGroup === g.key
            const hasSub = !!g.children

            return (
              <div
                key={g.key}
                onClick={() => {
                  if (!hasSub) {
                    navigate(g.key)
                    setActiveGroup(null)
                  } else {
                    setActiveGroup(prev => prev === g.key ? null : g.key)
                  }
                }}
                style={{
                  width: '100%',
                  height: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s',
                  margin: '1px 0',
                }}
                onMouseEnter={e => {
                  if (!active && !isOpen) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active && !isOpen) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* 활성 배경 */}
                {(active || isOpen) && (
                  <div style={{
                    position: 'absolute',
                    inset: '4px 6px',
                    background: isOpen
                      ? `${g.color}20`
                      : `${g.color}18`,
                    borderRadius: 10,
                    border: `1px solid ${g.color}30`,
                  }} />
                )}

                {/* 왼쪽 인디케이터 바 */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: active ? 3 : 0,
                  height: 28,
                  background: g.grad,
                  borderRadius: '0 3px 3px 0',
                  boxShadow: active ? `0 0 10px ${g.color}80` : 'none',
                  transition: 'width 0.2s, box-shadow 0.2s',
                }} />

                {/* 아이콘 */}
                <div style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 9,
                  background: active
                    ? g.grad
                    : isOpen
                      ? `${g.color}25`
                      : 'transparent',
                  boxShadow: active ? `0 4px 12px ${g.color}50` : 'none',
                  transition: 'all 0.2s',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <span style={{
                    fontSize: active ? 15 : 13,
                    color: active ? '#fff' : isOpen ? g.color : '#4a5568',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    lineHeight: 1,
                  }}>
                    {g.icon}
                  </span>
                </div>

                {/* 라벨 */}
                <span style={{
                  fontSize: 9.5,
                  color: active ? g.color : isOpen ? '#94a3b8' : '#374151',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: 0.2,
                  position: 'relative',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                }}>
                  {g.label}
                </span>

                {/* 서브메뉴 있을 때 작은 화살표 */}
                {hasSub && (
                  <div style={{
                    position: 'absolute',
                    right: 6, top: '50%',
                    transform: `translateY(-50%) rotate(${isOpen ? 90 : 0}deg)`,
                    fontSize: 7,
                    color: isOpen ? g.color : '#2d3748',
                    transition: 'transform 0.2s, color 0.2s',
                  }}>
                    ▶
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* 하단 */}
        <div style={{
          width: '100%', paddingBottom: 12,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          paddingTop: 8,
        }}>
          {/* 현재 위치 표시 dot */}
          {currentGroup && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 0',
            }}>
              <div style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: currentGroup.grad,
                boxShadow: `0 0 8px ${currentGroup.color}`,
              }} />
              <span style={{ fontSize: 8, color: '#1e293b', letterSpacing: 0.5 }}>
                {currentGroup.desc || currentGroup.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── 플라이아웃 드로어 ─── */}
      <div style={{
        position: 'fixed',
        left: 72,
        top: 0,
        bottom: 0,
        width: openGroup ? 220 : 0,
        background: 'linear-gradient(180deg, #0d1117 0%, #111827 100%)',
        borderRight: openGroup ? '1px solid rgba(255,255,255,0.06)' : 'none',
        overflow: 'hidden',
        transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: openGroup ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
      }}>
        {openGroup && (
          <>
            {/* 드로어 헤더 */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
              minWidth: 220,
            }}>
              {/* 카테고리 배지 */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                background: `${openGroup.color}15`,
                border: `1px solid ${openGroup.color}30`,
                borderRadius: 20,
                marginBottom: 10,
              }}>
                <span style={{ fontSize: 12 }}>{openGroup.icon}</span>
                <span style={{
                  fontSize: 10,
                  color: openGroup.color,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  {openGroup.desc || openGroup.label}
                </span>
              </div>

              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: -0.5,
                lineHeight: 1.2,
              }}>
                {openGroup.label}
              </div>
              <div style={{ fontSize: 11, color: '#374151', marginTop: 3 }}>
                {openGroup.children?.length}개 하위 메뉴
              </div>
            </div>

            {/* 서브메뉴 목록 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px 12px',
              minWidth: 220,
            }}>
              {openGroup.children?.map((child, idx) => {
                const isSelected = isChildMatch(child.key, selectedKey)
                const isHov = hoveredChild === child.key

                return (
                  <div
                    key={child.key}
                    onClick={() => { navigate(child.key); setActiveGroup(null) }}
                    onMouseEnter={() => setHoveredChild(child.key)}
                    onMouseLeave={() => setHoveredChild(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 12px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      marginBottom: 4,
                      background: isSelected
                        ? `linear-gradient(135deg, ${openGroup.color}20, ${openGroup.color}08)`
                        : isHov
                          ? 'rgba(255,255,255,0.04)'
                          : 'transparent',
                      border: isSelected
                        ? `1px solid ${openGroup.color}25`
                        : '1px solid transparent',
                      transition: 'all 0.15s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* 선택 시 왼쪽 하이라이트 바 */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        left: 0, top: '20%', bottom: '20%',
                        width: 3,
                        background: openGroup.grad,
                        borderRadius: '0 3px 3px 0',
                        boxShadow: `0 0 8px ${openGroup.color}60`,
                      }} />
                    )}

                    {/* 아이콘 박스 */}
                    <div style={{
                      width: 34, height: 34,
                      borderRadius: 9,
                      background: isSelected
                        ? `${openGroup.color}20`
                        : isHov
                          ? `${openGroup.color}12`
                          : 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                      transition: 'all 0.15s',
                      border: isSelected ? `1px solid ${openGroup.color}30` : '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {child.icon}
                    </div>

                    {/* 텍스트 */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#f1f5f9' : isHov ? '#94a3b8' : '#4b5563',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'color 0.15s',
                        lineHeight: 1.3,
                      }}>
                        {child.label}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: isSelected ? openGroup.color : '#1f2937',
                        marginTop: 1,
                        transition: 'color 0.15s',
                      }}>
                        {child.desc}
                      </div>
                    </div>

                    {/* 선택 인디케이터 */}
                    {isSelected && (
                      <div style={{
                        width: 8, height: 8,
                        borderRadius: '50%',
                        background: openGroup.color,
                        boxShadow: `0 0 6px ${openGroup.color}`,
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* 하단 색상 그라데이션 라인 */}
            <div style={{
              height: 2,
              background: `linear-gradient(90deg, transparent, ${openGroup.color}, transparent)`,
              opacity: 0.5,
              flexShrink: 0,
              minWidth: 220,
            }} />
          </>
        )}
      </div>

      {/* 드로어 열릴 때 overlay (모바일 대응) */}
      {openGroup && (
        <div
          onClick={() => setActiveGroup(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 190,
            background: 'transparent',
          }}
        />
      )}

      <style>{`
        [data-sidebar-nav]::-webkit-scrollbar { width: 2px; }
        [data-sidebar-nav]::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }
      `}</style>
    </div>
  )
}
