import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Typography, Row, Col, Switch,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { getAllGroups, getCodesByGroup, createCode, updateCode, deleteCode } from '../../services/commonCodeService'

const { Title } = Typography

export default function CommonCodePage() {
  const [codes, setCodes] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [groupFilter, setGroupFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      if (groupFilter) {
        const res = await getCodesByGroup(groupFilter)
        setCodes(res)
      } else {
        const g = await getAllGroups()
        const all = await Promise.all(g.map((grp) => getCodesByGroup(grp.group_code)))
        setCodes(all.flat())
      }
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAllGroups().then(setGroups).catch(() => {})
    load()
  }, [])

  useEffect(() => { load() }, [groupFilter])

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true, group_code: groupFilter || undefined })
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
        await updateCode(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        await createCode(values)
        message.success('등록되었습니다.')
      }
      setModalOpen(false)
      getAllGroups().then(setGroups).catch(() => {})
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCode(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '그룹코드', dataIndex: 'group_code', key: 'group_code', width: 130 },
    { title: '그룹명', dataIndex: 'group_name', key: 'group_name', width: 120 },
    { title: '코드', dataIndex: 'code', key: 'code', width: 110 },
    { title: '코드명', dataIndex: 'code_name', key: 'code_name' },
    { title: '정렬순서', dataIndex: 'sort_seq', key: 'sort_seq', width: 90 },
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
      <Title level={4} style={{ marginBottom: 16 }}>공통코드 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Select
              placeholder="그룹 전체"
              allowClear
              style={{ width: 180 }}
              value={groupFilter || undefined}
              onChange={(v) => setGroupFilter(v ?? '')}
              options={groups.map((g) => ({ value: g.group_code, label: `${g.group_code} ${g.group_name}` }))}
            />
          </Col>
          <Col><Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button></Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 등록</Button>
          </Col>
        </Row>
      </Card>
      <Card>
        <Table dataSource={codes} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 20 }} />
      </Card>
      <Modal
        title={editTarget ? '공통코드 수정' : '공통코드 신규 등록'}
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
              <Form.Item label="그룹코드" name="group_code" rules={[{ required: true }]}>
                <Input placeholder="DEFECT_TYPE, DOWNTIME_REASON..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="그룹명" name="group_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="코드" name="code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="코드명" name="code_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="정렬순서" name="sort_seq">
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
