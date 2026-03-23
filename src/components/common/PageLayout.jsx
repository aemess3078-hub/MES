/**
 * 공통 페이지 레이아웃 컴포넌트
 * - PageHeader: 제목 + 부제목 + 우측 액션 버튼
 * - FilterBar: 검색/필터 영역
 * - DataCard: 테이블 래퍼 카드
 */

// ─── PageHeader ───────────────────────────────────────────
export function PageHeader({ title, subtitle, extra, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 12,
    }}>
      <div>
        <h2 style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 800,
          color: '#111827',
          letterSpacing: -0.4,
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {extra && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {extra}
        </div>
      )}
    </div>
  )
}

// ─── FilterBar ────────────────────────────────────────────
export function FilterBar({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── DataCard ─────────────────────────────────────────────
export function DataCard({ children, style, title, extra }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      ...style,
    }}>
      {title && (
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{title}</span>
          {extra}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────
export function StatCard({ icon, label, value, color = '#4f46e5', bg = '#eef2ff', suffix }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: bg, color, fontSize: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
          {value}
          {suffix && <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4, fontWeight: 500 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  )
}
