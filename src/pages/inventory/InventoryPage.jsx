import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Select, Typography, Row, Col,
  Tag, message, Modal, Form, Input, InputNumber,
} from 'antd'
import { SearchOutlined, EditOutlined } from '@ant-design/icons'
import { getInventory, adjustInventory } from '../../services/inventoryService'

const { Title } = Typography

const itemTypeLabel = { raw: '원자재', semi: '반제품', finished: '완제품' }
const itemTypeColor = { raw: 'blue', semi: 'orange', finished: 'green' }

export default function InventoryPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [adjustModal, setAdjustModal] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const res = await getInventory(typeFilter ? { item_type: typeFilter } : {})
      setData(res)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [typeFilter])

  const openAdjust = (record) => {
    setAdjustTarget(record)
    form.setFieldsValue({ qty: record.qty })
    setAdjustModal(true)
  }

  const handleAdjust = async () => {
    try {
      const values = await form.validateFields()
      await adjustInventory(adjustTarget.item_id, values.qty)
      message.success('재고가 수정되었습니다.')
      setAdjustModal(false)
      load()
    } catch (e) {
      if (e.message) message.error('수정 실패: ' + e.message)
    }
  }

  const columns = [
    {
      title: '품목구분',
      key: 'item_type',
      width: 100,
      render: (_, r) => (
        <Tag color={itemTypeColor[r.items?.item_type]}>{itemTypeLabel[r.items?.item_type] ?? '-'}</Tag>
      ),
    },
    { title: '품목코드', key: 'item_code', width: 120, render: (_, r) => r.items?.item_code ?? '-' },
    { title: '품목명', key: 'item_name', render: (_, r) => r.items?.item_name ?? '-' },
    {
      title: '현재고',
      dataIndex: 'qty',
      key: 'qty',
      width: 130,
      render: (v, r) => (
        <span style={{ fontWeight: 700, fontSize: 15, color: v <= 0 ? '#ff4d4f' : '#1677ff' }}>
          {Number(v).toLocaleString()} {r.items?.unit ?? ''}
        </span>
      ),
    },
    {
      title: '최종갱신',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 160,
      render: (v) => v ? new Date(v).toLocaleString('ko-KR') : '-',
    },
    {
      title: '재고조정',
      key: 'action',
      width: 100,
      render: (_, r) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openAdjust(r)}>조정</Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>재고현황</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Select
              placeholder="품목구분 전체"
              allowClear
              style={{ width: 140 }}
              value={typeFilter || undefined}
              onChange={(v) => setTypeFilter(v ?? '')}
              options={[
                { value: 'raw', label: '원자재' },
                { value: 'semi', label: '반제품' },
                { value: 'finished', label: '완제품' },
              ]}
            />
          </Col>
          <Col><Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button></Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={`재고 조정 - ${adjustTarget?.items?.item_name ?? ''}`}
        open={adjustModal}
        onOk={handleAdjust}
        onCancel={() => setAdjustModal(false)}
        okText="저장"
        cancelText="취소"
        width={360}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="조정 수량" name="qty" rules={[{ required: true, message: '수량을 입력하세요' }]}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter={adjustTarget?.items?.unit ?? ''} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
