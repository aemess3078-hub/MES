import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Typography, Row, Col, Switch, Divider,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { USER_ROLE_LABEL } from '../../utils/constants'

const { Title } = Typography

async function getUsers() {
  const { data, error } = await supabase.from('users').select('*').order('name')
  if (error) throw error
  return data
}

async function updateUser(id, payload) {
  const { data, error } = await supabase.from('users').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

async function createUser(email, password, name, role) {
  // 현재 관리자 세션 저장
  const { data: { session: adminSession } } = await supabase.auth.getSession()

  // 새 유저 생성 (signUp이 세션을 바꿀 수 있으므로 즉시 복원)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error

  // 관리자 세션 즉시 복원
  if (adminSession) {
    await supabase.auth.setSession({
      access_token: adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    })
  }

  // users 테이블에 프로필 삽입
  await supabase.from('users').upsert({
    id: data.user.id,
    email,
    name,
    role,
    is_active: true,
  }, { onConflict: 'id' })

  return data.user
}

export default function UserPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm] = Form.useForm()
  const [createForm] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openEdit = (record) => {
    setEditTarget(record)
    editForm.setFieldsValue(record)
    setEditOpen(true)
  }

  const handleEdit = async () => {
    try {
      const values = await editForm.validateFields()
      await updateUser(editTarget.id, { name: values.name, role: values.role, is_active: values.is_active })
      message.success('수정되었습니다.')
      setEditOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields()
      await createUser(values.email, values.password, values.name, values.role)
      message.success('사용자가 생성되었습니다.')
      setCreateOpen(false)
      createForm.resetFields()
      load()
    } catch (e) {
      if (e.message) message.error('생성 실패: ' + e.message)
    }
  }

  const columns = [
    { title: '이름', dataIndex: 'name', key: 'name' },
    { title: '이메일', dataIndex: 'email', key: 'email' },
    {
      title: '권한',
      dataIndex: 'role',
      key: 'role',
      width: 130,
      render: (v) => USER_ROLE_LABEL[v] ?? v,
    },
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
      width: 100,
      render: (_, r) => (
        <Button size="small" onClick={() => openEdit(r)}>수정</Button>
      ),
    },
  ]

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>사용자 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col flex="auto" />
          <Col>
            <Space>
              <Button icon={<SearchOutlined />} onClick={load}>새로고침</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                사용자 추가
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card>
        <Table dataSource={users} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 15 }} />
      </Card>

      {/* 사용자 수정 모달 */}
      <Modal
        title="사용자 수정"
        open={editOpen}
        onOk={handleEdit}
        onCancel={() => setEditOpen(false)}
        okText="저장"
        cancelText="취소"
        width={400}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="이름" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="권한" name="role" rules={[{ required: true }]}>
            <Select options={Object.entries(USER_ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 사용자 추가 모달 */}
      <Modal
        title="사용자 추가"
        open={createOpen}
        onOk={handleCreate}
        onCancel={() => { setCreateOpen(false); createForm.resetFields() }}
        okText="생성"
        cancelText="취소"
        width={400}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="이름" name="name" rules={[{ required: true, message: '이름을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="이메일"
            name="email"
            rules={[{ required: true, message: '이메일을 입력하세요' }, { type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="초기 비밀번호"
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력하세요' }, { min: 6, message: '6자 이상 입력하세요' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="권한" name="role" rules={[{ required: true, message: '권한을 선택하세요' }]}>
            <Select options={Object.entries(USER_ROLE_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
