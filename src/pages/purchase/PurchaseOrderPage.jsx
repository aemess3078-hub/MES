import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Select, Modal, Form, Input,
  message, Popconfirm, Typography, Row, Col, Tag, DatePicker,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder,
  deletePurchaseOrder, generatePoNo,
} from '../../services/purchaseOrderService'
import { getItems } from '../../services/itemService'
import { getBusinessPartners } from '../../services/businessPartnerService'
import { PO_STATUS_LABEL, PO_STATUS_COLOR } from '../../utils/constants'

const { Title } = Typography

export default function PurchaseOrderPage() {
  const [data, setData] = useState([])
  const [items, setItems] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getPurchaseOrders(statusFilter ? { status: statusFilter } : {})
      setData(res)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getItems({ item_type: 'raw' }).then(setItems).catch(() => {})
    getBusinessPartners({ partner_type: 'supplier' }).then(setPartners).catch(() => {})
    load()
  }, [])

  useEffect(() => { load() }, [statusFilter])

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ po_no: generatePoNo(), order_date: dayjs() })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue({
      ...record,
      order_date: record.order_date ? dayjs(record.order_date) : null,
      expected_date: record.expected_date ? dayjs(record.expected_date) : null,
      partner_id: record.partner_id ?? undefined,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        order_date: values.order_date?.format('YYYY-MM-DD'),
        expected_date: values.expected_date?.format('YYYY-MM-DD') ?? null,
      }
      if (editTarget) {
        await updatePurchaseOrder(editTarget.id, payload)
        message.success('수정되었습니다.')
      } else {
        await createPurchaseOrder({ ...payload, received_qty: 0, status: 'waiting' })
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
      await deletePurchaseOrder(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '발주번호', dataIndex: 'po_no', key: 'po_no', width: 160 },
    { title: '거래처', key: 'partner', width: 130, render: (_, r) => r.business_partners?.partner_name ?? '-' },
    { title: '품목', key: 'item', render: (_, r) => r.items ? `${r.items.item_code} ${r.items.item_name}` : '-' },
    {
      title: '발주수량',
      key: 'order_qty',
      width: 100,
      render: (_, r) => `${r.order_qty?.toLocaleString()} ${r.items?.unit ?? ''}`,
    },
    {
      title: '입고수량',
      key: 'received_qty',
      width: 100,
      render: (_, r) => `${r.received_qty?.toLocaleString()} ${r.items?.unit ?? ''}`,
    },
    {
      title: '잔여수량',
      key: 'remain_qty',
      width: 100,
      render: (_, r) => {
        const remain = (r.order_qty ?? 0) - (r.received_qty ?? 0)
        return <span style={{ color: remain > 0 ? '#fa8c16' : '#52c41a' }}>{remain.toLocaleString()} {r.items?.unit ?? ''}</span>
      },
    },
    { title: '입고예정일', dataIndex: 'expected_date', key: 'expected_date', width: 110 },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s) => <Tag color={PO_STATUS_COLOR[s]}>{PO_STATUS_LABEL[s] ?? s}</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      width: 130,
      render: (_, r) => (
        <Space>
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
      <Title level={4} style={{ marginBottom: 16 }}>자재발주 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Select
              placeholder="상태 전체"
              allowClear
              style={{ width: 130 }}
              value={statusFilter || undefined}
              onChange={(v) => setStatusFilter(v ?? '')}
              options={Object.entries(PO_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Col>
          <Col><Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button></Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 발주</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title={editTarget ? '발주 수정' : '신규 발주 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="발주번호" name="po_no" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="거래처" name="partner_id">
                <Select
                  allowClear
                  showSearch
                  placeholder="거래처 선택"
                  options={partners.map((p) => ({ value: p.id, label: p.partner_name }))}
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="품목" name="item_id" rules={[{ required: true, message: '품목을 선택하세요' }]}>
            <Select
              showSearch
              placeholder="품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="발주수량" name="order_qty" rules={[{ required: true, message: '발주수량을 입력하세요' }]}>
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="발주일" name="order_date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="입고예정일" name="expected_date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          {editTarget && (
            <Form.Item label="상태" name="status">
              <Select
                options={Object.entries(PO_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
