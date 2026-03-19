import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, DatePicker,
  Modal, Form, message, Popconfirm, Typography, Row, Col, InputNumber, Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined, SendOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getProductionOrders, createProductionOrder, updateProductionOrder, deleteProductionOrder,
} from '../../services/productionOrderService'
import { getItems } from '../../services/itemService'
import { getBusinessPartners } from '../../services/businessPartnerService'
import { createShipment, generateShipmentNo, getShippedQtyByOrders } from '../../services/shipmentService'
import { getInventory } from '../../services/inventoryService'
import { OrderStatusTag } from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/formatters'
import { ORDER_STATUS } from '../../utils/constants'

const { Title } = Typography
const { RangePicker } = DatePicker

export default function ProductionOrderListPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [shippedMap, setShippedMap] = useState({}) // { order_id: shippedQty }
  const [inventoryMap, setInventoryMap] = useState({}) // { item_id: { qty, unit } }
  const [items, setItems] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [shipModalOpen, setShipModalOpen] = useState(false)
  const [shipTarget, setShipTarget] = useState(null)
  const [shipForm] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getProductionOrders(filters)
      setOrders(data)
      const ids = data.map((o) => o.id)
      const shipped = await getShippedQtyByOrders(ids)
      setShippedMap(shipped)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getItems().then(setItems).catch(() => {})
    getBusinessPartners({ partner_type: 'customer' }).then(setPartners).catch(() => {})
    getInventory().then((inv) => {
      const map = {}
      inv.forEach((i) => { map[i.item_id] = { qty: i.qty, unit: i.items?.unit ?? '' } })
      setInventoryMap(map)
    }).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue({
      ...record,
      due_date: record.due_date ? dayjs(record.due_date) : null,
      partner_id: record.partner_id ?? undefined,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = { ...values, due_date: values.due_date?.format('YYYY-MM-DD') }
      if (editTarget) {
        await updateProductionOrder(editTarget.id, payload)
        message.success('수정되었습니다.')
      } else {
        const orderNo = `PO-${Date.now()}`
        await createProductionOrder({ ...payload, order_no: orderNo, status: 'waiting' })
        message.success('등록되었습니다.')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const getRemaining = (record) => {
    const shipped = shippedMap[record.id] ?? 0
    return Number(record.order_qty) - shipped
  }

  const openShipModal = (record) => {
    const remaining = getRemaining(record)
    setShipTarget({ ...record, remaining })
    shipForm.resetFields()
    shipForm.setFieldsValue({
      shipment_no: generateShipmentNo(),
      production_order_id: record.id,
      item_id: record.item_id,
      partner_id: record.partner_id ?? undefined,
      qty: remaining > 0 ? remaining : 1,
      shipment_date: dayjs(),
      status: 'completed',
    })
    setShipModalOpen(true)
  }

  const handleShipSave = async () => {
    try {
      const values = await shipForm.validateFields()
      if (shipTarget && Number(values.qty) > shipTarget.remaining) {
        message.error(`잔여 출하 가능 수량(${shipTarget.remaining})을 초과할 수 없습니다.`)
        return
      }
      const payload = {
        ...values,
        shipment_date: values.shipment_date?.format('YYYY-MM-DD'),
      }
      await createShipment(payload)
      message.success('출하가 등록되었습니다.')
      setShipModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('출하 등록 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProductionOrder(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '생산오더번호', dataIndex: 'order_no', key: 'order_no', width: 160 },
    {
      title: '품목',
      key: 'item',
      render: (_, r) => r.items ? `${r.items.item_code} ${r.items.item_name}` : '-',
    },
    {
      title: '거래처',
      key: 'partner',
      width: 120,
      render: (_, r) => r.business_partners?.partner_name ?? '-',
    },
    {
      title: '오더수량',
      dataIndex: 'order_qty',
      key: 'order_qty',
      width: 90,
      render: (v) => v?.toLocaleString(),
    },
    {
      title: '출하수량',
      key: 'shipped_qty',
      width: 90,
      render: (_, r) => {
        const shipped = shippedMap[r.id] ?? 0
        return <span style={{ color: shipped > 0 ? '#1677ff' : undefined }}>{shipped.toLocaleString()}</span>
      },
    },
    {
      title: '잔여수량',
      key: 'remaining_qty',
      width: 90,
      render: (_, r) => {
        const remaining = getRemaining(r)
        return (
          <span style={{ color: remaining <= 0 ? '#52c41a' : '#fa8c16', fontWeight: 600 }}>
            {remaining <= 0 ? '완료' : remaining.toLocaleString()}
          </span>
        )
      },
    },
    {
      title: '재고',
      key: 'inventory',
      width: 100,
      render: (_, r) => {
        const inv = inventoryMap[r.item_id]
        if (!inv) return <span style={{ color: '#bbb' }}>-</span>
        return (
          <Tag color={inv.qty > 0 ? 'blue' : 'default'}>
            {Number(inv.qty).toLocaleString()} {inv.unit}
          </Tag>
        )
      },
    },
    {
      title: '납기일',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: formatDate,
    },
    {
      title: '우선순위',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <OrderStatusTag status={s} />,
    },
    {
      title: '관리',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/production/orders/${r.id}`)}>상세</Button>
          <Button size="small" onClick={() => openEdit(r)}>수정</Button>
          <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => openShipModal(r)}>출하</Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>생산오더 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="오더번호 검색"
              prefix={<SearchOutlined />}
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              style={{ width: 200 }}
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
                { value: 'cancelled', label: '취소' },
              ]}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 등록</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 출하 등록 모달 */}
      <Modal
        title={`출하 등록 - ${shipTarget?.order_no ?? ''}`}
        open={shipModalOpen}
        onOk={handleShipSave}
        onCancel={() => setShipModalOpen(false)}
        okText="출하 저장"
        cancelText="취소"
        width={480}
      >
        <Form form={shipForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="출하번호" name="shipment_no" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="production_order_id" hidden><Input /></Form.Item>
          <Form.Item name="item_id" hidden><Input /></Form.Item>
          <Form.Item label="품목">
            <Input
              disabled
              value={
                items.find((i) => i.id === shipTarget?.item_id)
                  ? `${items.find((i) => i.id === shipTarget?.item_id)?.item_code} ${items.find((i) => i.id === shipTarget?.item_id)?.item_name}`
                  : ''
              }
            />
          </Form.Item>
          <Form.Item label="거래처" name="partner_id">
            <Select
              showSearch allowClear placeholder="거래처 선택"
              options={partners.map((p) => ({ value: p.id, label: p.partner_name }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          {shipTarget && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
              <span style={{ marginRight: 16 }}>오더수량: <strong>{Number(shipTarget.order_qty).toLocaleString()}</strong></span>
              <span style={{ marginRight: 16 }}>출하완료: <strong style={{ color: '#1677ff' }}>{(Number(shipTarget.order_qty) - shipTarget.remaining).toLocaleString()}</strong></span>
              <span>잔여출하 가능: <strong style={{ color: shipTarget.remaining <= 0 ? '#52c41a' : '#fa8c16' }}>{shipTarget.remaining <= 0 ? '없음(완료)' : shipTarget.remaining.toLocaleString()}</strong></span>
            </div>
          )}
          <Form.Item
            label="출하수량"
            name="qty"
            rules={[
              { required: true, message: '수량을 입력하세요' },
              {
                validator: (_, value) => {
                  if (shipTarget && Number(value) > shipTarget.remaining) {
                    return Promise.reject(`잔여 출하 가능 수량(${shipTarget.remaining})을 초과할 수 없습니다.`)
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <InputNumber min={1} max={shipTarget?.remaining ?? undefined} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="출하일" name="shipment_date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="상태" name="status">
            <Select
              options={[
                { value: 'completed', label: '완료' },
                { value: 'cancelled', label: '취소' },
              ]}
            />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editTarget ? '생산오더 수정' : '생산오더 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="거래처 (고객사)" name="partner_id">
            <Select
              showSearch allowClear placeholder="거래처 선택 (선택사항)"
              options={partners.map((p) => ({ value: p.id, label: p.partner_name }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="생산 품목" name="item_id" rules={[{ required: true, message: '품목을 선택하세요' }]}>
            <Select
              showSearch
              placeholder="품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="생산수량" name="order_qty" rules={[{ required: true, message: '수량을 입력하세요' }]}>
            <Input type="number" min={1} suffix="EA" />
          </Form.Item>
          <Form.Item label="납기일" name="due_date" rules={[{ required: true, message: '납기일을 선택하세요' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="우선순위" name="priority">
            <Select
              options={[
                { value: 1, label: '높음' },
                { value: 2, label: '보통' },
                { value: 3, label: '낮음' },
              ]}
              placeholder="우선순위 선택"
            />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
