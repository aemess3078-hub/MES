import { useEffect, useState } from 'react'
import { Card, Table, Button, Row, Col, DatePicker, Select, Typography, message, Statistic } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getProductionResults } from '../../services/productionResultService'
import { getWorkOrders } from '../../services/workOrderService'
import { formatDateTime } from '../../utils/formatters'

const { RangePicker } = DatePicker

export default function ProductionResultPage() {
  const [results, setResults] = useState([])
  const [workOrders, setWorkOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    work_order_id: '',
    dateFrom: dayjs().format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD'),
  })

  const load = async () => {
    setLoading(true)
    try {
      const data = await getProductionResults(filters)
      setResults(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getWorkOrders().then(setWorkOrders).catch(() => {})
  }, [])

  const totalGood = results.reduce((s, r) => s + (r.good_qty || 0), 0)
  const totalDefect = results.reduce((s, r) => s + (r.defect_qty || 0), 0)
  const totalQty = totalGood + totalDefect
  const defectRate = totalQty > 0 ? ((totalDefect / totalQty) * 100).toFixed(1) : 0

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
    { title: '시작시간', dataIndex: 'start_time', key: 'start_time', render: formatDateTime },
    { title: '종료시간', dataIndex: 'end_time', key: 'end_time', render: formatDateTime },
    {
      title: '양품수량',
      dataIndex: 'good_qty',
      key: 'good_qty',
      render: (v) => v?.toLocaleString(),
    },
    {
      title: '불량수량',
      dataIndex: 'defect_qty',
      key: 'defect_qty',
      render: (v, r) => (
        <span style={{ color: r.defect_qty > 0 ? '#ff4d4f' : undefined }}>
          {v?.toLocaleString()}
        </span>
      ),
    },
    { title: '비고', dataIndex: 'note', key: 'note' },
  ]

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>생산실적 조회</div>

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
            <Select
              placeholder="작업지시 전체"
              allowClear
              style={{ width: 200 }}
              value={filters.work_order_id || undefined}
              onChange={(v) => setFilters((f) => ({ ...f, work_order_id: v ?? '' }))}
              options={workOrders.map((w) => ({ value: w.id, label: w.work_order_no }))}
              showSearch
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={8}><Card><Statistic title="총 양품수량" value={totalGood} suffix="EA" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="총 불량수량" value={totalDefect} suffix="EA" valueStyle={{ color: totalDefect > 0 ? '#ff4d4f' : undefined }} /></Card></Col>
        <Col span={8}><Card><Statistic title="불량률" value={defectRate} suffix="%" /></Card></Col>
      </Row>

      <Card>
        <Table
          dataSource={results}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  )
}
