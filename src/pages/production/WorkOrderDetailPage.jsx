import { useEffect, useState } from 'react'
import {
  Card, Descriptions, Button, Table, Space, Tag, message, Select, Typography, Divider, Spin,
} from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkOrderById, updateWorkOrderStatus } from '../../services/workOrderService'
import { getProductionResults } from '../../services/productionResultService'
import { WorkStatusTag } from '../../components/common/StatusBadge'
import { formatDate, formatDateTime } from '../../utils/formatters'


export default function WorkOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workOrder, setWorkOrder] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [wo, res] = await Promise.all([
        getWorkOrderById(id),
        getProductionResults({ work_order_id: id }),
      ])
      setWorkOrder(wo)
      setResults(res)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (status) => {
    try {
      await updateWorkOrderStatus(id, status)
      message.success('상태가 변경되었습니다.')
      load()
    } catch (e) {
      message.error('상태 변경 실패: ' + e.message)
    }
  }

  const resultColumns = [
    { title: '시작시간', dataIndex: 'start_time', key: 'start_time', render: formatDateTime },
    { title: '종료시간', dataIndex: 'end_time', key: 'end_time', render: formatDateTime },
    { title: '양품수량', dataIndex: 'good_qty', key: 'good_qty', render: (v) => v?.toLocaleString() },
    { title: '불량수량', dataIndex: 'defect_qty', key: 'defect_qty', render: (v) => v?.toLocaleString() },
    { title: '비고', dataIndex: 'note', key: 'note' },
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  }

  if (!workOrder) return null

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate(-1)}>목록으로</Button>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>작업지시 상세</div>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="작업지시번호">{workOrder.work_order_no}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <Space>
              <WorkStatusTag status={workOrder.status} />
              <Select
                value={workOrder.status}
                size="small"
                style={{ width: 120 }}
                onChange={handleStatusChange}
                options={[
                  { value: 'waiting', label: '대기' },
                  { value: 'in_progress', label: '진행중' },
                  { value: 'completed', label: '완료' },
                  { value: 'on_hold', label: '보류' },
                ]}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="품목">
            {workOrder.items ? `${workOrder.items.item_name}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="공정">{workOrder.processes?.process_name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="계획수량">{workOrder.plan_qty?.toLocaleString()} EA</Descriptions.Item>
          <Descriptions.Item label="지시일">{formatDate(workOrder.plan_date)}</Descriptions.Item>
          <Descriptions.Item label="납기일">{formatDate(workOrder.due_date)}</Descriptions.Item>
          <Descriptions.Item label="생산오더">{workOrder.production_orders?.order_no ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="비고" span={2}>{workOrder.note ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="생산실적 이력">
        <Table
          dataSource={results}
          columns={resultColumns}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{ emptyText: '등록된 실적이 없습니다.' }}
        />
      </Card>
    </div>
  )
}
