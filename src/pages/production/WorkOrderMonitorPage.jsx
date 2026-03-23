import { useEffect, useState } from 'react'
import {
  Card, Table, Typography, Row, Col, Select, Input, Button,
  Tag, Progress, Space, Statistic, Tooltip, Badge,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { WorkStatusTag } from '../../components/common/StatusBadge'

const { Text } = Typography

const STEP_COLOR = { waiting: '#d9d9d9', in_progress: '#1677ff', completed: '#52c41a' }

export default function WorkOrderMonitorPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ keyword: '', status: '' })

  const load = async () => {
    setLoading(true)
    try {
      // 작업지시 + 공정단계 + 생산실적 한번에 조회
      let query = supabase
        .from('work_orders')
        .select(`
          id, work_order_no, plan_qty, status, plan_date, due_date,
          items(item_code, item_name, unit),
          work_order_processes(id, step_no, status, good_qty, defect_qty, processes(process_name)),
          production_results(good_qty, defect_qty)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.keyword) query = query.ilike('work_order_no', `%${filters.keyword}%`)

      const { data, error } = await query
      if (error) throw error
      setRows(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // 집계 카드용
  const total = rows.length
  const byStatus = {
    waiting: rows.filter((r) => r.status === 'waiting').length,
    in_progress: rows.filter((r) => r.status === 'in_progress').length,
    completed: rows.filter((r) => r.status === 'completed').length,
  }

  const columns = [
    {
      title: '작업지시번호',
      dataIndex: 'work_order_no',
      key: 'work_order_no',
      width: 160,
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: '품목',
      key: 'item',
      width: 160,
      render: (_, r) => r.items ? `${r.items.item_code} ${r.items.item_name}` : '-',
    },
    {
      title: '계획수량',
      dataIndex: 'plan_qty',
      key: 'plan_qty',
      width: 90,
      render: (v, r) => `${Number(v).toLocaleString()} ${r.items?.unit ?? 'EA'}`,
    },
    {
      title: '공정 진행 현황',
      key: 'processes',
      render: (_, r) => {
        const steps = [...(r.work_order_processes ?? [])].sort((a, b) => a.step_no - b.step_no)
        if (!steps.length) return <Text type="secondary" style={{ fontSize: 12 }}>공정 미설정</Text>
        return (
          <Space size={4} wrap>
            {steps.map((s, idx) => (
              <Space key={s.id} size={0}>
                <Tooltip
                  title={
                    <div>
                      <div>{s.processes?.process_name}</div>
                      {s.good_qty != null && <div>양품: {Number(s.good_qty).toLocaleString()}</div>}
                      {s.defect_qty > 0 && <div>불량: {Number(s.defect_qty).toLocaleString()}</div>}
                    </div>
                  }
                >
                  <Tag
                    style={{
                      margin: 0,
                      cursor: 'default',
                      background: s.status === 'completed' ? '#f6ffed' : s.status === 'in_progress' ? '#e6f4ff' : '#fafafa',
                      borderColor: STEP_COLOR[s.status],
                      color: s.status === 'waiting' ? '#aaa' : '#333',
                    }}
                  >
                    <Badge
                      color={STEP_COLOR[s.status]}
                      style={{ marginRight: 4 }}
                    />
                    {s.step_no}. {s.processes?.process_name ?? '-'}
                  </Tag>
                </Tooltip>
                {idx < steps.length - 1 && (
                  <span style={{ color: '#ccc', margin: '0 2px', fontSize: 12 }}>→</span>
                )}
              </Space>
            ))}
          </Space>
        )
      },
    },
    {
      title: '공정 진도',
      key: 'progress',
      width: 130,
      render: (_, r) => {
        const steps = r.work_order_processes ?? []
        if (!steps.length) return '-'
        const done = steps.filter((s) => s.status === 'completed').length
        const pct = Math.round((done / steps.length) * 100)
        return (
          <div>
            <Progress
              percent={pct}
              size="small"
              status={pct === 100 ? 'success' : 'active'}
              format={() => `${done}/${steps.length}`}
            />
          </div>
        )
      },
    },
    {
      title: '양품수량',
      key: 'good_qty',
      width: 90,
      render: (_, r) => {
        const total = (r.production_results ?? []).reduce((s, p) => s + Number(p.good_qty ?? 0), 0)
        const pct = r.plan_qty > 0 ? Math.round((total / r.plan_qty) * 100) : 0
        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ color: total > 0 ? '#52c41a' : undefined }}>
              {total.toLocaleString()}
            </Text>
            {total > 0 && (
              <Text type="secondary" style={{ fontSize: 11 }}>{pct}%</Text>
            )}
          </Space>
        )
      },
    },
    {
      title: '불량수량',
      key: 'defect_qty',
      width: 90,
      render: (_, r) => {
        const total = (r.production_results ?? []).reduce((s, p) => s + Number(p.defect_qty ?? 0), 0)
        // 공정별 불량도 합산
        const procDefect = (r.work_order_processes ?? []).reduce((s, p) => s + Number(p.defect_qty ?? 0), 0)
        const combined = Math.max(total, procDefect)
        return combined > 0
          ? <Text strong style={{ color: '#ff4d4f' }}>{combined.toLocaleString()}</Text>
          : <Text type="secondary">0</Text>
      },
    },
    {
      title: '납기일',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 100,
      render: (v) => {
        if (!v) return '-'
        const isLate = new Date(v) < new Date() && true
        return <span style={{ color: isLate ? '#ff4d4f' : undefined }}>{v}</span>
      },
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s) => <WorkStatusTag status={s} />,
    },
  ]

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>작업지시 진행 현황</div>

      {/* 요약 카드 */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic title="전체" value={total} valueStyle={{ fontSize: 24 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#d9d9d9' }}>
            <Statistic title="대기" value={byStatus.waiting} valueStyle={{ fontSize: 24, color: '#888' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#1677ff' }}>
            <Statistic title="진행중" value={byStatus.in_progress} valueStyle={{ fontSize: 24, color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ textAlign: 'center', borderColor: '#52c41a' }}>
            <Statistic title="완료" value={byStatus.completed} valueStyle={{ fontSize: 24, color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* 검색 */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="작업지시번호 검색"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              style={{ width: 200 }}
              onPressEnter={load}
            />
          </Col>
          <Col>
            <Select
              placeholder="상태 전체"
              allowClear
              style={{ width: 120 }}
              value={filters.status || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, status: v ?? '' }))}
              options={[
                { value: 'waiting', label: '대기' },
                { value: 'in_progress', label: '진행중' },
                { value: 'completed', label: '완료' },
                { value: 'on_hold', label: '보류' },
              ]}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={load}>새로고침</Button>
          </Col>
        </Row>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table
          dataSource={rows}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 1100 }}
          rowClassName={(r) => r.status === 'in_progress' ? 'ant-table-row-selected' : ''}
        />
      </div>
    </div>
  )
}
