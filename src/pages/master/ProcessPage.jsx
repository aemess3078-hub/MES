import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Modal, Form,
  message, Popconfirm, Typography, Row, Col, Switch,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { getProcesses, createProcess, updateProcess, deleteProcess } from '../../services/processService'


export default function ProcessPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await getProcesses(keyword ? { keyword } : {})
      setData(res)
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
    form.setFieldsValue({ is_active: true })
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
        await updateProcess(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        await createProcess(values)
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
      await deleteProcess(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '공정코드', dataIndex: 'process_code', key: 'process_code', width: 120 },
    { title: '공정명', dataIndex: 'process_name', key: 'process_name' },
    { title: '공정순서', dataIndex: 'process_seq', key: 'process_seq', width: 100 },
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
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>공정 관리</div>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="공정코드/공정명 검색"
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
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 15 }} />
      </Card>
      <Modal
        title={editTarget ? '공정 수정' : '공정 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={420}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="공정코드" name="process_code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="공정순서" name="process_seq">
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="공정명" name="process_name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
