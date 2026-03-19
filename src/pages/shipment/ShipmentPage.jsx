import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Select, DatePicker,
  Modal, Form, Input, InputNumber, message, Popconfirm, Typography, Row, Col, Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined, PrinterOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getShipments, createShipment, deleteShipment, generateShipmentNo } from '../../services/shipmentService'
import { getItems } from '../../services/itemService'
import { getBusinessPartners } from '../../services/businessPartnerService'
import { getProductionOrders } from '../../services/productionOrderService'

const { Title } = Typography
const { RangePicker } = DatePicker

const STATUS_LABEL = { completed: '완료', cancelled: '취소' }
const STATUS_COLOR = { completed: 'green', cancelled: 'red' }

function buildPrintHtml(selectedRows) {
  const today = dayjs().format('YYYY년 MM월 DD일')

  // 거래처별 그룹핑
  const byPartner = {}
  selectedRows.forEach((r) => {
    const key = r.partner_id ?? '__none__'
    const name = r.business_partners?.partner_name ?? '거래처 미지정'
    if (!byPartner[key]) byPartner[key] = { name, rows: [] }
    byPartner[key].rows.push(r)
  })

  const pages = Object.values(byPartner).map(({ name, rows }) => {
    const total = rows.reduce((s, r) => s + Number(r.qty), 0)
    const rowsHtml = rows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.shipment_no}</td>
        <td>${r.items?.item_code ?? '-'}</td>
        <td>${r.items?.item_name ?? '-'}</td>
        <td style="text-align:right">${Number(r.qty).toLocaleString()}</td>
        <td>${r.items?.unit ?? ''}</td>
        <td>${r.shipment_date ?? ''}</td>
        <td>${r.production_orders?.order_no ?? '-'}</td>
        <td>${r.note ?? ''}</td>
      </tr>
    `).join('')

    return `
      <div class="page">
        <h1>거 래 명 세 표</h1>
        <div class="meta">
          <div class="meta-left">
            <table class="info-table">
              <tr><th>수신</th><td><strong>${name}</strong></td></tr>
            </table>
          </div>
          <div class="meta-right">발행일: ${today}</div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>출하번호</th>
              <th>품목코드</th>
              <th>품목명</th>
              <th>수량</th>
              <th>단위</th>
              <th>출하일</th>
              <th>생산오더</th>
              <th>비고</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="total-row">
              <td colspan="4" style="text-align:right;font-weight:bold">합 계</td>
              <td style="text-align:right;font-weight:bold">${total.toLocaleString()}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>
        <div class="sign-area">
          <div class="sign-box">공급자 (인)</div>
          <div class="sign-box">확인자 (인)</div>
        </div>
      </div>
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>거래명세표</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 12px; }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm 15mm 10mm;
      page-break-after: always;
    }
    .page:last-child { page-break-after: avoid; }
    h1 {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 6px;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .meta-right { font-size: 12px; padding-top: 4px; }
    .info-table { border-collapse: collapse; }
    .info-table th, .info-table td {
      border: 1px solid #666;
      padding: 4px 10px;
      font-size: 13px;
    }
    .info-table th { background: #f0f0f0; }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .data-table th, .data-table td {
      border: 1px solid #333;
      padding: 5px 6px;
      text-align: center;
      font-size: 11px;
    }
    .data-table th { background: #e8e8e8; font-weight: bold; }
    .data-table tbody tr:nth-child(even) { background: #fafafa; }
    .total-row td { background: #f0f0f0; }
    .sign-area {
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      margin-top: 30px;
    }
    .sign-box {
      border: 1px solid #333;
      width: 100px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #555;
    }
    @media print {
      body { margin: 0; }
      .page { padding: 10mm 12mm; }
    }
  </style>
</head>
<body>${pages}</body>
</html>`
}

export default function ShipmentPage() {
  const [shipments, setShipments] = useState([])
  const [items, setItems] = useState([])
  const [partners, setPartners] = useState([])
  const [productionOrders, setProductionOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '' })
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const data = await getShipments(filters)
      setShipments(data)
      setSelectedRowKeys([])
      setSelectedRows([])
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
    getProductionOrders({}).then(setProductionOrders).catch(() => {})
  }, [])

  const openCreate = (preset = {}) => {
    form.resetFields()
    form.setFieldsValue({
      shipment_no: generateShipmentNo(),
      shipment_date: dayjs(),
      status: 'completed',
      ...preset,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        shipment_date: values.shipment_date?.format('YYYY-MM-DD'),
      }
      await createShipment(payload)
      message.success('출하가 등록되었습니다.')
      setModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteShipment(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const handlePoSelect = (poId) => {
    const po = productionOrders.find((p) => p.id === poId)
    if (po) {
      form.setFieldsValue({
        item_id: po.item_id,
        partner_id: po.partner_id ?? undefined,
        qty: po.order_qty,
      })
    }
  }

  const handlePrint = () => {
    if (!selectedRows.length) return
    const html = buildPrintHtml(selectedRows)
    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys)
      setSelectedRows(rows)
    },
  }

  const columns = [
    { title: '출하번호', dataIndex: 'shipment_no', key: 'shipment_no', width: 160 },
    {
      title: '생산오더',
      key: 'po',
      width: 150,
      render: (_, r) => r.production_orders?.order_no ?? '-',
    },
    {
      title: '품목',
      key: 'item',
      render: (_, r) => r.items ? `${r.items.item_code} ${r.items.item_name}` : '-',
    },
    {
      title: '거래처',
      key: 'partner',
      width: 130,
      render: (_, r) => r.business_partners?.partner_name ?? '-',
    },
    {
      title: '수량',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      render: (v, r) => `${Number(v).toLocaleString()} ${r.items?.unit ?? ''}`,
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
      render: (s) => <Tag color={STATUS_COLOR[s]}>{STATUS_LABEL[s]}</Tag>,
    },
    { title: '비고', dataIndex: 'note', key: 'note' },
    {
      title: '관리',
      key: 'action',
      width: 80,
      render: (_, r) => (
        <Popconfirm title="삭제하면 재고가 복원됩니다. 삭제하시겠습니까?" onConfirm={() => handleDelete(r.id)}>
          <Button size="small" danger>삭제</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>출하 관리</Title>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <RangePicker
              onChange={(dates) => setFilters({
                dateFrom: dates?.[0]?.format('YYYY-MM-DD') ?? '',
                dateTo: dates?.[1]?.format('YYYY-MM-DD') ?? '',
              })}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  거래명세표 출력 ({selectedRowKeys.length}건)
                </Button>
              )}
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>출하 등록</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 8, color: '#1677ff', fontSize: 13 }}>
            {selectedRowKeys.length}건 선택됨 —&nbsp;
            {(() => {
              const partners = [...new Set(selectedRows.map((r) => r.business_partners?.partner_name ?? '미지정'))]
              return `거래처: ${partners.join(', ')}`
            })()}
          </div>
        )}
        <Table
          dataSource={shipments}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          rowSelection={rowSelection}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="출하 등록"
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="출하번호" name="shipment_no" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="생산오더 연결 (선택사항)" name="production_order_id">
            <Select
              showSearch
              allowClear
              placeholder="생산오더 선택"
              options={productionOrders.map((p) => ({
                value: p.id,
                label: `${p.order_no} | ${p.items?.item_name ?? ''}`,
              }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              onChange={handlePoSelect}
            />
          </Form.Item>
          <Form.Item label="품목" name="item_id" rules={[{ required: true, message: '품목을 선택하세요' }]}>
            <Select
              showSearch
              placeholder="품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="거래처 (고객사)" name="partner_id">
            <Select
              showSearch
              allowClear
              placeholder="거래처 선택"
              options={partners.map((p) => ({ value: p.id, label: p.partner_name }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="출하수량" name="qty" rules={[{ required: true, message: '수량을 입력하세요' }]}>
            <InputNumber min={1} style={{ width: '100%' }} suffix="EA" />
          </Form.Item>
          <Form.Item label="출하일" name="shipment_date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="상태" name="status" rules={[{ required: true }]}>
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
    </div>
  )
}
