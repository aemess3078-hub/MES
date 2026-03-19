import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Spin, Typography, Badge, Space } from 'antd'
import {
  ArrowUpOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { getDashboardData } from '../../services/dashboardService'
import { supabase } from '../../lib/supabase'
import { WORK_STATUS_LABEL, WORK_STATUS_COLOR, EQUIP_STATUS_LABEL } from '../../utils/constants'
import { WorkStatusTag, EquipStatusBadge } from '../../components/common/StatusBadge'

const { Title } = Typography

const equipStatusColorMap = {
  running: '#52c41a',
  stopped: '#d9d9d9',
  standby: '#faad14',
  error: '#ff4d4f',
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
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  const woStatusCount = data?.workOrderStatusCount ?? {}
  const equipments = data?.equipments ?? []
  const runningCount = equipments.filter((e) => e.status === 'running').length
  const errorCount = equipments.filter((e) => e.status === 'error').length

  const workOrderColumns = [
    { title: '작업지시번호', dataIndex: 'work_order_no', key: 'work_order_no', width: 160 },
    { title: '품목명', dataIndex: ['items', 'item_name'], key: 'item_name' },
    {
      title: '계획수량',
      dataIndex: 'plan_qty',
      key: 'plan_qty',
      width: 100,
      render: (v) => v?.toLocaleString(),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <WorkStatusTag status={s} />,
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>대시보드</Title>

      {/* KPI 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="당일 양품 생산량"
              value={data?.totalGoodQty ?? 0}
              suffix="EA"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="당일 불량수량"
              value={data?.totalDefectQty ?? 0}
              suffix="EA"
              valueStyle={{ color: data?.totalDefectQty > 0 ? '#ff4d4f' : undefined }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="불량률"
              value={data?.defectRate ?? 0}
              suffix="%"
              valueStyle={{ color: Number(data?.defectRate) > 5 ? '#ff4d4f' : '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="설비 가동 / 이상"
              value={runningCount}
              suffix={`/ ${errorCount} 이상`}
              valueStyle={{ color: errorCount > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 작업지시 현황 */}
        <Col xs={24} lg={14}>
          <Card
            title="당일 작업지시 현황"
            extra={
              <Space>
                <Tag>{`대기 ${woStatusCount.waiting ?? 0}`}</Tag>
                <Tag color="processing">{`진행중 ${woStatusCount.in_progress ?? 0}`}</Tag>
                <Tag color="success">{`완료 ${woStatusCount.completed ?? 0}`}</Tag>
              </Space>
            }
          >
            <Table
              dataSource={data?.workOrders ?? []}
              columns={workOrderColumns}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 500 }}
            />
          </Card>
        </Col>

        {/* 설비 상태 */}
        <Col xs={24} lg={10}>
          <Card title="설비 상태">
            <Row gutter={[8, 8]}>
              {equipments.map((eq) => (
                <Col span={12} key={eq.id}>
                  <Card
                    size="small"
                    style={{
                      borderLeft: `4px solid ${equipStatusColorMap[eq.status] ?? '#d9d9d9'}`,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{eq.equip_name}</div>
                    <EquipStatusBadge status={eq.status} />
                  </Card>
                </Col>
              ))}
              {equipments.length === 0 && (
                <Col span={24}>
                  <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
                    등록된 설비가 없습니다.
                  </div>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
