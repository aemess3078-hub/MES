import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Descriptions, Table, Tag, Button, Spin, message, Typography, Statistic, Row, Col, Space,
} from 'antd'
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons'
import { getProductionOrderById } from '../../services/productionOrderService'
import { getShipments } from '../../services/shipmentService'
import { OrderStatusTag } from '../../components/common/StatusBadge'

const { Title } = Typography

const SHIP_STATUS_LABEL = { completed: '완료', cancelled: '취소' }
const SHIP_STATUS_COLOR = { completed: 'green', cancelled: 'red' }

export default function ProductionOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orderData, shipData] = await Promise.all([
          getProductionOrderById(id),
          getShipments({}),
        ])
        setOrder(orderData)
        setShipments(shipData.filter((s) => s.production_order_id === id))
      } catch (e) {
        message.error('조회 실패: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!order) return null

  const shippedQty = shipments
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + Number(s.qty), 0)
  const remainingQty = Number(order.order_qty) - shippedQty

  const shipColumns = [
    { title: '출하번호', dataIndex: 'shipment_no', key: 'shipment_no', width: 160 },
    {
      title: '거래처',
      key: 'partner',
      width: 130,
      render: (_, r) => r.business_partners?.partner_name ?? '-',
    },
    {
      title: '출하수량',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v).toLocaleString()}</span>,
    },
    {
      title: '출하일',
      dataIndex: 'shipment_date',
      key: 'shipment_date',
      width: 110,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s) => <Tag color={SHIP_STATUS_COLOR[s]}>{SHIP_STATUS_LABEL[s]}</Tag>,
    },
    { title: '비고', dataIndex: 'note', key: 'note' },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/production/orders')}>목록</Button>
        <Title level={4} style={{ margin: 0 }}>생산오더 상세</Title>
      </Space>

      {/* 오더 기본정보 */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="생산오더번호">{order.order_no}</Descriptions.Item>
          <Descriptions.Item label="상태"><OrderStatusTag status={order.status} /></Descriptions.Item>
          <Descriptions.Item label="품목">
            {order.items ? `${order.items.item_code} ${order.items.item_name}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="거래처(고객사)">
            {order.business_partners?.partner_name ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="생산수량">{Number(order.order_qty).toLocaleString()} {order.items?.unit ?? 'EA'}</Descriptions.Item>
          <Descriptions.Item label="납기일">{order.due_date ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="우선순위">{order.priority ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="비고">{order.note ?? '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 출하 현황 요약 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={8}>
            <Statistic
              title="오더수량"
              value={Number(order.order_qty).toLocaleString()}
              suffix={order.items?.unit ?? 'EA'}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="출하완료"
              value={shippedQty.toLocaleString()}
              suffix={order.items?.unit ?? 'EA'}
              valueStyle={{ color: '#1677ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="잔여출하"
              value={remainingQty <= 0 ? '완료' : remainingQty.toLocaleString()}
              suffix={remainingQty > 0 ? (order.items?.unit ?? 'EA') : ''}
              valueStyle={{ color: remainingQty <= 0 ? '#52c41a' : '#fa8c16' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 출하 이력 */}
      <Card
        title={<Space><SendOutlined />출하 이력</Space>}
      >
        <Table
          dataSource={shipments}
          columns={shipColumns}
          rowKey="id"
          size="middle"
          pagination={false}
          locale={{ emptyText: '출하 이력이 없습니다.' }}
        />
      </Card>
    </div>
  )
}
