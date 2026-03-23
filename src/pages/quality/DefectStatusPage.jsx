import { useEffect, useState } from 'react'
import { Card, Table, Button, Row, Col, DatePicker, Select, Typography, message, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getDefects } from '../../services/defectService'
import { formatDateTime } from '../../utils/formatters'

const { RangePicker } = DatePicker

export default function DefectStatusPage() {
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD'),
    defect_type_code: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const data = await getDefects(filters)
      setDefects(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const totalQty = defects.reduce((s, d) => s + (d.defect_qty || 0), 0)

  const typeCount = defects.reduce((acc, d) => {
    acc[d.defect_type_code] = (acc[d.defect_type_code] || 0) + d.defect_qty
    return acc
  }, {})

  const columns = [
    {
      title: '작업지시',
      key: 'work_order',
      render: (_, r) => r.work_orders?.work_order_no ?? '-',
    },
    {
      title: '품목명',
      key: 'item',
      render: (_, r) => r.work_orders?.items?.item_name ?? '-',
    },
    { title: '발생공정', key: 'process', render: (_, r) => r.processes?.process_name ?? '-' },
    { title: '불량유형', dataIndex: 'defect_type_code', key: 'defect_type_code' },
    {
      title: '불량수량',
      dataIndex: 'defect_qty',
      key: 'defect_qty',
      render: (v) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{v?.toLocaleString()}</span>,
    },
    { title: '발생시간', dataIndex: 'occurred_at', key: 'occurred_at', render: formatDateTime },
    { title: '비고', dataIndex: 'note', key: 'note' },
  ]

  const summaryColumns = [
    { title: '불량유형', dataIndex: 'type', key: 'type' },
    { title: '수량', dataIndex: 'qty', key: 'qty', render: (v) => v?.toLocaleString() },
    {
      title: '비율',
      key: 'rate',
      render: (_, r) => totalQty > 0 ? `${((r.qty / totalQty) * 100).toFixed(1)}%` : '0%',
    },
  ]

  const summaryData = Object.entries(typeCount).map(([type, qty]) => ({ type, qty }))

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>불량현황</div>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
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
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Card><Statistic title="총 불량수량" value={totalQty} suffix="EA" valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="불량 건수" value={defects.length} suffix="건" /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="불량 유형 수" value={Object.keys(typeCount).length} suffix="종" /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="불량 이력">
            <Table
              dataSource={defects}
              columns={columns}
              rowKey="id"
              loading={loading}
              size="small"
              pagination={{ pageSize: 15 }}
              scroll={{ x: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="불량유형별 집계">
            <Table
              dataSource={summaryData}
              columns={summaryColumns}
              rowKey="type"
              size="small"
              pagination={false}
              locale={{ emptyText: '데이터 없음' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
