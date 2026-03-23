import { useEffect, useState } from 'react'
import { Card, Button, Tag, Typography, Space, Spin, message, Select, Row, Col } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getWorkOrders } from '../../services/workOrderService'
import { WORK_STATUS_LABEL, WORK_STATUS_COLOR } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

const { Text } = Typography

const statusBg = {
  waiting: '#f5f5f5',
  in_progress: '#e6f4ff',
  completed: '#f6ffed',
  on_hold: '#fffbe6',
}

const statusBorder = {
  waiting: '#d9d9d9',
  in_progress: '#91caff',
  completed: '#b7eb8f',
  on_hold: '#ffe58f',
}

export default function PopWorkListPage() {
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('waiting')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getWorkOrders(statusFilter ? { status: statusFilter } : {})
      setWorkOrders(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>작업지시 목록</div>
        </Col>
        <Col>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 130 }}
            options={[
              { value: '', label: '전체' },
              { value: 'waiting', label: '대기' },
              { value: 'in_progress', label: '진행중' },
              { value: 'completed', label: '완료' },
            ]}
          />
        </Col>
      </Row>

      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        {workOrders.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', color: '#999', padding: '32px 0' }}>
              작업지시가 없습니다.
            </div>
          </Card>
        )}
        {workOrders.map((wo) => (
          <Card
            key={wo.id}
            style={{
              background: statusBg[wo.status] ?? '#fff',
              borderLeft: `5px solid ${statusBorder[wo.status] ?? '#d9d9d9'}`,
              cursor: 'pointer',
            }}
            onClick={() => navigate(`/pop/work/${wo.id}`)}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Text strong style={{ fontSize: 16 }}>{wo.work_order_no}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {wo.items?.item_name ?? '-'} | {wo.processes?.process_name ?? '-'}
                </Text>
              </Col>
              <Col style={{ textAlign: 'right' }}>
                <Tag color={WORK_STATUS_COLOR[wo.status] === 'default' ? undefined : WORK_STATUS_COLOR[wo.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {WORK_STATUS_LABEL[wo.status] ?? wo.status}
                </Tag>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>계획: {wo.plan_qty?.toLocaleString()} EA</Text>
              </Col>
            </Row>
            <div style={{ marginTop: 8, borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>납기: {formatDate(wo.due_date)}</Text>
            </div>
          </Card>
        ))}
      </Space>
    </div>
  )
}
