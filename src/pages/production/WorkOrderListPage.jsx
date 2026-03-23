import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Typography, Row, Col, DatePicker, Tag, Tooltip,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  getWorkOrders, createWorkOrder, updateWorkOrder, deleteWorkOrder,
} from '../../services/workOrderService'
import { getProductionOrders } from '../../services/productionOrderService'
import { getItems } from '../../services/itemService'
import { getInventoryByItemId } from '../../services/inventoryService'

import { WorkStatusTag } from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/formatters'


export default function WorkOrderListPage() {
  const navigate = useNavigate()
  const [workOrders, setWorkOrders] = useState([])
  const [prodOrders, setProdOrders] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [itemInventory, setItemInventory] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getWorkOrders(filters)
      setWorkOrders(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getProductionOrders().then(setProdOrders).catch(() => {})
    getItems().then(setItems).catch(() => {})
  }, [])

  const fetchItemInventory = async (itemId) => {
    if (!itemId) { setItemInventory(null); return }
    const inv = await getInventoryByItemId(itemId)
    setItemInventory(inv)
  }

  const handleProductionOrderChange = (orderId) => {
    if (!orderId) return
    const order = prodOrders.find((o) => o.id === orderId)
    if (!order) return
    form.setFieldsValue({
      item_id: order.item_id,
      plan_qty: order.order_qty,
      due_date: order.due_date ? dayjs(order.due_date) : null,
    })
    fetchItemInventory(order.item_id)
  }

  const handleItemChange = (itemId) => {
    fetchItemInventory(itemId)
  }

  const openCreate = () => {
    setEditTarget(null)
    setItemInventory(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue({
      ...record,
      plan_date: record.plan_date ? dayjs(record.plan_date) : null,
      due_date: record.due_date ? dayjs(record.due_date) : null,
    })
    fetchItemInventory(record.item_id)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        plan_date: values.plan_date?.format('YYYY-MM-DD'),
        due_date: values.due_date?.format('YYYY-MM-DD'),
      }
      if (editTarget) {
        await updateWorkOrder(editTarget.id, payload)
        message.success('수정되었습니다.')
      } else {
        const workOrderNo = `WO-${Date.now()}`
        await createWorkOrder({ ...payload, work_order_no: workOrderNo, status: 'waiting' })
        message.success('등록되었습니다.')
      }
      setModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteWorkOrder(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '작업지시번호', dataIndex: 'work_order_no', key: 'work_order_no', width: 160 },
    {
      title: '품목',
      key: 'item',
      render: (_, r) => r.items ? `${r.items.item_name}` : '-',
    },
    {
      title: '공정 구성',
      key: 'process',
      render: (_, r) => {
        const details = r.items?.process_routings?.process_routing_details
        if (!details?.length) return <span style={{ color: '#bbb' }}>라우팅 미설정</span>
        const sorted = [...details].sort((a, b) => a.step_no - b.step_no)
        return (
          <Space size={2} wrap>
            {sorted.map((d, idx) => (
              <Space key={d.step_no} size={0}>
                <Tag color="blue" style={{ margin: 0 }}>
                  {d.step_no}. {d.processes?.process_name ?? '-'}
                </Tag>
                {idx < sorted.length - 1 && <span style={{ color: '#aaa', margin: '0 2px' }}>→</span>}
              </Space>
            ))}
          </Space>
        )
      },
    },
    {
      title: '계획수량',
      dataIndex: 'plan_qty',
      key: 'plan_qty',
      width: 100,
      render: (v) => v?.toLocaleString(),
    },
    {
      title: '지시일',
      dataIndex: 'plan_date',
      key: 'plan_date',
      width: 120,
      render: formatDate,
    },
    {
      title: '납기일',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: formatDate,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <WorkStatusTag status={s} />,
    },
    {
      title: '관리',
      key: 'action',
      width: 160,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/production/workorders/${r.id}`)}>상세</Button>
          <Button size="small" onClick={() => openEdit(r)}>수정</Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>작업지시 관리</div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="작업지시번호 검색"
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
                { value: 'on_hold', label: '보류' },
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
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Table
          dataSource={workOrders}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </div>

      <Modal
        title={editTarget ? '작업지시 수정' : '작업지시 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="생산오더" name="production_order_id">
            <Select
              showSearch
              allowClear
              placeholder="생산오더 선택 (선택사항)"
              options={prodOrders.map((o) => ({ value: o.id, label: `${o.order_no}${o.items ? ` | ${o.items.item_name}` : ''}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              onChange={handleProductionOrderChange}
            />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                <span>품목</span>
                {itemInventory !== null && (
                  <Tag color={itemInventory?.qty > 0 ? 'blue' : 'default'}>
                    재고: {itemInventory?.qty?.toLocaleString() ?? 0} {itemInventory?.items?.unit ?? ''}
                  </Tag>
                )}
              </Space>
            }
            name="item_id"
            rules={[{ required: true, message: '품목을 선택하세요' }]}
          >
            <Select
              showSearch
              placeholder="품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              onChange={handleItemChange}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="계획수량" name="plan_qty" rules={[{ required: true }]}>
                <Input type="number" min={1} suffix="EA" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="지시일" name="plan_date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="납기일" name="due_date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
