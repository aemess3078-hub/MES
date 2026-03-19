import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Typography, Row, Col, Switch, Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import {
  getBusinessPartners, createBusinessPartner,
  updateBusinessPartner, deleteBusinessPartner,
} from '../../services/businessPartnerService'

const { Title } = Typography

const typeLabel = { customer: '고객사', supplier: '공급업체', both: '고객/공급' }
const typeColor = { customer: 'blue', supplier: 'green', both: 'purple' }

export default function BusinessPartnerPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getBusinessPartners()
      const filtered = keyword
        ? res.filter((p) =>
            p.partner_name.includes(keyword) || p.partner_code.includes(keyword)
          )
        : res
      setData(filtered)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true, partner_type: 'both' })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editTarget) {
        await updateBusinessPartner(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        await createBusinessPartner(values)
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
      await deleteBusinessPartner(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '거래처코드', dataIndex: 'partner_code', key: 'partner_code', width: 120 },
    { title: '거래처명', dataIndex: 'partner_name', key: 'partner_name' },
    {
      title: '구분',
      dataIndex: 'partner_type',
      key: 'partner_type',
      width: 100,
      render: (v) => <Tag color={typeColor[v]}>{typeLabel[v] ?? v}</Tag>,
    },
    { title: '담당자', dataIndex: 'contact_name', key: 'contact_name', width: 100 },
    { title: '연락처', dataIndex: 'phone', key: 'phone', width: 130 },
    { title: '이메일', dataIndex: 'email', key: 'email', width: 160 },
    {
      title: '사용여부',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 90,
      render: (v) => <Switch checked={v} size="small" disabled />,
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
      <Title level={4} style={{ marginBottom: 16 }}>거래처 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="거래처코드/거래처명 검색"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={load}
              style={{ width: 220 }}
            />
          </Col>
          <Col><Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button></Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 등록</Button>
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
        title={editTarget ? '거래처 수정' : '거래처 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={10}>
              <Form.Item label="거래처코드" name="partner_code" rules={[{ required: true, message: '코드를 입력하세요' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item label="거래처명" name="partner_name" rules={[{ required: true, message: '거래처명을 입력하세요' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="구분" name="partner_type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'customer', label: '고객사' },
                { value: 'supplier', label: '공급업체' },
                { value: 'both', label: '고객/공급 모두' },
              ]}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="담당자" name="contact_name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="연락처" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="이메일" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="주소" name="address">
            <Input />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
