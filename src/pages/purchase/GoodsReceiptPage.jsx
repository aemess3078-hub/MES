import { useEffect, useRef, useState } from 'react'
import {
  Card, Table, Button, Space, Select, Modal, Form, Input,
  message, Popconfirm, Typography, Row, Col, DatePicker,
} from 'antd'
import { PlusOutlined, SearchOutlined, PrinterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getGoodsReceipts, createGoodsReceipt, deleteGoodsReceipt, generateReceiptNo } from '../../services/goodsReceiptService'
import { getPurchaseOrders } from '../../services/purchaseOrderService'
import { getItems } from '../../services/itemService'
import ReceiptLabel from '../../components/common/ReceiptLabel'

const { Title } = Typography

export default function GoodsReceiptPage() {
  const [data, setData] = useState([])
  const [pendingPos, setPendingPos] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [labelTarget, setLabelTarget] = useState(null)
  const [form] = Form.useForm()
  const [selectedPo, setSelectedPo] = useState(null)
  const labelRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const res = await getGoodsReceipts()
      setData(res)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getItems({ item_type: 'raw' }).then(setItems).catch(() => {})
    getPurchaseOrders().then((pos) =>
      setPendingPos(pos.filter((p) => p.status === 'waiting' || p.status === 'partial'))
    ).catch(() => {})
  }, [])

  const openCreate = () => {
    setSelectedPo(null)
    form.resetFields()
    form.setFieldsValue({ receipt_no: generateReceiptNo(), receipt_date: dayjs() })
    setModalOpen(true)
  }

  const handlePoSelect = (poId) => {
    const po = pendingPos.find((p) => p.id === poId)
    if (po) {
      setSelectedPo(po)
      const remain = (po.order_qty ?? 0) - (po.received_qty ?? 0)
      form.setFieldsValue({ item_id: po.item_id, qty: remain > 0 ? remain : undefined })
    } else {
      setSelectedPo(null)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        receipt_no: values.receipt_no,
        po_id: values.po_id ?? null,
        item_id: values.item_id,
        qty: Number(values.qty),
        lot_no: values.lot_no ?? null,
        receipt_date: values.receipt_date?.format('YYYY-MM-DD') ?? dayjs().format('YYYY-MM-DD'),
        note: values.note ?? null,
      }
      const created = await createGoodsReceipt(payload)
      message.success('입고 처리되었습니다.')
      setModalOpen(false)
      load()
      getPurchaseOrders().then((pos) =>
        setPendingPos(pos.filter((p) => p.status === 'waiting' || p.status === 'partial'))
      ).catch(() => {})
      // 저장 후 바로 식별표 출력 여부 확인
      const full = await getGoodsReceipts({ po_id: undefined })
      const found = full.find((r) => r.id === created.id)
      if (found) setLabelTarget(found)
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteGoodsReceipt(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const handlePrint = () => {
    const content = document.getElementById('receipt-label')
    if (!content) return
    const win = window.open('', '_blank', 'width=420,height=600')
    win.document.write(`
      <html><head><title>입고 식별표</title>
      <style>
        body { margin: 20px; font-family: Arial, sans-serif; }
        @media print { body { margin: 0; } }
      </style>
      </head><body>
      ${content.outerHTML}
      <script>window.onload = function(){ window.print(); window.close(); }<\/script>
      </body></html>
    `)
    win.document.close()
  }

  const columns = [
    { title: '입고번호', dataIndex: 'receipt_no', key: 'receipt_no', width: 160 },
    { title: '발주번호', key: 'po_no', width: 150, render: (_, r) => r.purchase_orders?.po_no ?? '-' },
    { title: '품목', key: 'item', render: (_, r) => r.items ? `${r.items.item_code} ${r.items.item_name}` : '-' },
    { title: 'LOT번호', dataIndex: 'lot_no', key: 'lot_no', width: 120, render: (v) => v ?? '-' },
    {
      title: '입고수량',
      key: 'qty',
      width: 110,
      render: (_, r) => `${r.qty?.toLocaleString()} ${r.items?.unit ?? ''}`,
    },
    { title: '입고일', dataIndex: 'receipt_date', key: 'receipt_date', width: 110 },
    { title: '비고', dataIndex: 'note', key: 'note' },
    {
      title: '관리',
      key: 'action',
      width: 130,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => setLabelTarget(r)}
          >
            식별표
          </Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>입고 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col><Button icon={<SearchOutlined />} onClick={load}>새로고침</Button></Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>입고 등록</Button>
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
          scroll={{ x: 850 }}
        />
      </Card>

      {/* 입고 등록 모달 */}
      <Modal
        title="입고 등록"
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="입고번호" name="receipt_no" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="LOT번호" name="lot_no">
                <Input placeholder="LOT 번호 입력" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="발주 연결 (선택사항)" name="po_id">
            <Select
              allowClear
              placeholder="발주번호 선택"
              onChange={handlePoSelect}
              options={pendingPos.map((p) => ({
                value: p.id,
                label: `${p.po_no} | ${p.items?.item_name} | 잔여 ${(p.order_qty - p.received_qty).toLocaleString()} ${p.items?.unit ?? ''}`,
              }))}
            />
          </Form.Item>
          <Form.Item label="품목" name="item_id" rules={[{ required: true, message: '품목을 선택하세요' }]}>
            <Select
              showSearch
              placeholder="품목 선택"
              disabled={!!selectedPo}
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="입고수량" name="qty" rules={[{ required: true, message: '수량을 입력하세요' }]}>
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="입고일" name="receipt_date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 식별표 모달 */}
      <Modal
        title="입고 식별표"
        open={!!labelTarget}
        onCancel={() => setLabelTarget(null)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            인쇄
          </Button>,
          <Button key="close" onClick={() => setLabelTarget(null)}>닫기</Button>,
        ]}
        width={400}
      >
        <div ref={labelRef} style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <ReceiptLabel receipt={labelTarget} />
        </div>
      </Modal>
    </div>
  )
}
