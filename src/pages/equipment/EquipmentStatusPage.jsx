import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Button, DatePicker, Select, Typography, message, Badge } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getEquipments } from '../../services/equipmentService'
import { getDowntimes } from '../../services/downtimeService'
import { EquipStatusBadge } from '../../components/common/StatusBadge'
import { formatDateTime } from '../../utils/formatters'

const { Title } = Typography
const { RangePicker } = DatePicker

const statusColor = {
  running: '#52c41a',
  stopped: '#d9d9d9',
  standby: '#faad14',
  error: '#ff4d4f',
}

export default function EquipmentStatusPage() {
  const [equipments, setEquipments] = useState([])
  const [downtimes, setDowntimes] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD'),
    equipment_id: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [eq, dt] = await Promise.all([
        getEquipments({ is_active: true }),
        getDowntimes(filters),
      ])
      setEquipments(eq)
      setDowntimes(dt)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const downtimeColumns = [
    { title: '설비', key: 'equip', render: (_, r) => r.equipments?.equip_name ?? '-' },
    { title: '작업지시', key: 'wo', render: (_, r) => r.work_orders?.work_order_no ?? '-' },
    { title: '비가동사유', dataIndex: 'reason_code', key: 'reason_code' },
    { title: '시작시간', dataIndex: 'start_time', key: 'start_time', render: formatDateTime },
    { title: '종료시간', dataIndex: 'end_time', key: 'end_time', render: formatDateTime },
    { title: '비고', dataIndex: 'note', key: 'note' },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>설비현황</Title>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {equipments.map((eq) => (
          <Col xs={12} sm={8} lg={6} key={eq.id}>
            <Card
              size="small"
              style={{ borderTop: `4px solid ${statusColor[eq.status] ?? '#d9d9d9'}` }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{eq.equip_name}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{eq.equip_code}</div>
              <EquipStatusBadge status={eq.status} />
            </Card>
          </Col>
        ))}
        {equipments.length === 0 && (
          <Col span={24}>
            <Card><div style={{ textAlign: 'center', color: '#999' }}>등록된 설비가 없습니다.</div></Card>
          </Col>
        )}
      </Row>

      <Card title="비가동 이력" style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle" style={{ marginBottom: 12 }}>
          <Col>
            <RangePicker
              value={[
                filters.dateFrom ? dayjs(filters.dateFrom) : null,
                filters.dateTo ? dayjs(filters.dateTo) : null,
              ]}
              onChange={(dates) =>
                setFilters((f) => ({
                  ...f,
                  dateFrom: dates?.[0]?.format('YYYY-MM-DD') ?? '',
                  dateTo: dates?.[1]?.format('YYYY-MM-DD') ?? '',
                }))
              }
            />
          </Col>
          <Col>
            <Select
              placeholder="설비 전체"
              allowClear
              style={{ width: 160 }}
              value={filters.equipment_id || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, equipment_id: v ?? '' }))}
              options={equipments.map((e) => ({ value: e.id, label: e.equip_name }))}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
        </Row>
        <Table
          dataSource={downtimes}
          columns={downtimeColumns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  )
}
