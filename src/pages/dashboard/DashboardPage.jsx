import { useEffect, useState } from 'react'
import { Row, Col, Card, Table, Tag, Spin, Space } from 'antd'
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  AlertOutlined,
} from '@ant-design/icons'
import { getDashboardData } from '../../services/dashboardService'
import { supabase } from '../../lib/supabase'
import { WorkStatusTag, EquipStatusBadge } from '../../components/common/StatusBadge'

const equipStatusColorMap = {
  running: { bg: '#dcfce7', text: '#16a34a', dot: '#22c55e', label: '가동중' },
  stopped: { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af', label: '정지' },
  standby: { bg: '#fef9c3', text: '#ca8a04', dot: '#eab308', label: '대기' },
  error:   { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444', label: '이상' },
}

function KpiCard({ icon, title, value, suffix, color, bg, trend, trendLabel, iconBg }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '20px 22px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* 아이콘 */}
      <div style={{
        width: 52, height: 52,
        background: iconBg || bg,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
        color: color,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      {/* 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 4 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{suffix}</span>
        </div>
        {trendLabel && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 3, fontSize: 11 }}>
            {trend >= 0
              ? <ArrowUpOutlined style={{ color: '#10b981' }} />
              : <ArrowDownOutlined style={{ color: '#ef4444' }} />}
            <span style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 500 }}>{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function EquipCard({ eq }) {
  const s = equipStatusColorMap[eq.status] ?? equipStatusColorMap.stopped
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      transition: 'box-shadow 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* 상태 점 */}
      <div style={{
        width: 10, height: 10,
        borderRadius: '50%',
        background: s.dot,
        flexShrink: 0,
        boxShadow: eq.status === 'running' ? `0 0 0 3px ${s.bg}` : 'none',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {eq.equip_name}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{eq.equip_code}</div>
      </div>
      <span style={{
        padding: '2px 9px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.text,
        flexShrink: 0,
      }}>
        {s.label}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const result = await getDashboardData()
      setData(result)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production_results' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(79,70,229,0.35)',
          animation: 'pulse 1.5s infinite',
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>M</span>
        </div>
        <span style={{ color: '#6b7280', fontSize: 14 }}>데이터 불러오는 중...</span>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.06)} }`}</style>
      </div>
    )
  }

  const woStatusCount = data?.workOrderStatusCount ?? {}
  const equipments = data?.equipments ?? []
  const runningCount = equipments.filter(e => e.status === 'running').length
  const errorCount = equipments.filter(e => e.status === 'error').length
  const defectRate = Number(data?.defectRate ?? 0)

  const workOrderColumns = [
    {
      title: '작업지시번호',
      dataIndex: 'work_order_no',
      key: 'work_order_no',
      width: 150,
      render: v => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#4f46e5' }}>{v}</span>
      ),
    },
    {
      title: '품목명',
      dataIndex: ['items', 'item_name'],
      key: 'item_name',
      render: v => <span style={{ fontWeight: 500 }}>{v ?? '-'}</span>,
    },
    {
      title: '계획수량',
      dataIndex: 'plan_qty',
      key: 'plan_qty',
      width: 90,
      align: 'right',
      render: v => <span style={{ fontWeight: 600 }}>{v?.toLocaleString()}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: s => <WorkStatusTag status={s} />,
    },
  ]

  return (
    <div className="fade-in">
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: -0.5 }}>
          대시보드
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 기준 실시간 현황
        </p>
      </div>

      {/* KPI 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<CheckCircleOutlined />}
            title="당일 양품 생산량"
            value={(data?.totalGoodQty ?? 0).toLocaleString()}
            suffix="EA"
            color="#16a34a"
            bg="#dcfce7"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<ExclamationCircleOutlined />}
            title="당일 불량수량"
            value={(data?.totalDefectQty ?? 0).toLocaleString()}
            suffix="EA"
            color={data?.totalDefectQty > 0 ? '#dc2626' : '#16a34a'}
            bg={data?.totalDefectQty > 0 ? '#fee2e2' : '#dcfce7'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<RiseOutlined />}
            title="불량률"
            value={defectRate}
            suffix="%"
            color={defectRate > 5 ? '#dc2626' : '#4f46e5'}
            bg={defectRate > 5 ? '#fee2e2' : '#eef2ff'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            icon={<ToolOutlined />}
            title="설비 가동 / 이상"
            value={runningCount}
            suffix={`대 / ${errorCount}이상`}
            color={errorCount > 0 ? '#dc2626' : '#16a34a'}
            bg={errorCount > 0 ? '#fee2e2' : '#dcfce7'}
          />
        </Col>
      </Row>

      {/* 작업지시 현황 + 설비 상태 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {/* 작업지시 현황 */}
        <Col xs={24} lg={15}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}>
            {/* 카드 헤더 */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28,
                  background: '#eef2ff',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ClockCircleOutlined style={{ color: '#4f46e5', fontSize: 14 }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>당일 작업지시 현황</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { label: '대기', count: woStatusCount.waiting ?? 0, color: '#f3f4f6', text: '#6b7280' },
                  { label: '진행중', count: woStatusCount.in_progress ?? 0, color: '#dbeafe', text: '#2563eb' },
                  { label: '완료', count: woStatusCount.completed ?? 0, color: '#dcfce7', text: '#16a34a' },
                ].map(s => (
                  <span key={s.label} style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: s.color,
                    color: s.text,
                  }}>
                    {s.label} {s.count}
                  </span>
                ))}
              </div>
            </div>
            <Table
              dataSource={data?.workOrders ?? []}
              columns={workOrderColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8, size: 'small' }}
              scroll={{ x: 480 }}
              style={{ borderRadius: 0 }}
            />
          </div>
        </Col>

        {/* 설비 상태 */}
        <Col xs={24} lg={9}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            height: '100%',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28,
                  background: '#fef3c7',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ToolOutlined style={{ color: '#d97706', fontSize: 14 }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>설비 현황</span>
              </div>
              {errorCount > 0 && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 20,
                  background: '#fee2e2', color: '#dc2626',
                  fontSize: 12, fontWeight: 600,
                }}>
                  <AlertOutlined style={{ fontSize: 11 }} />
                  이상 {errorCount}건
                </span>
              )}
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
              {equipments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: 13 }}>
                  등록된 설비가 없습니다
                </div>
              ) : (
                equipments.map(eq => <EquipCard key={eq.id} eq={eq} />)
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* 요약 통계 바 */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        gap: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {[
          { label: '대기 작업지시', value: woStatusCount.waiting ?? 0, color: '#6b7280', bg: '#f9fafb' },
          { label: '진행중 작업지시', value: woStatusCount.in_progress ?? 0, color: '#2563eb', bg: '#eff6ff' },
          { label: '완료 작업지시', value: woStatusCount.completed ?? 0, color: '#16a34a', bg: '#f0fdf4' },
          { label: '가동 설비', value: runningCount, color: '#16a34a', bg: '#f0fdf4' },
          { label: '이상 설비', value: errorCount, color: errorCount > 0 ? '#dc2626' : '#9ca3af', bg: errorCount > 0 ? '#fef2f2' : '#f9fafb' },
          { label: '불량률', value: `${defectRate}%`, color: defectRate > 5 ? '#dc2626' : '#4f46e5', bg: defectRate > 5 ? '#fef2f2' : '#eef2ff' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{
            flex: 1,
            textAlign: 'center',
            padding: '8px 0',
            borderRight: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
