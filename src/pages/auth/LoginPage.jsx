import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Segmented } from 'antd'
import { UserOutlined, LockOutlined, DesktopOutlined, ToolOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../services/authService'
import useAuthStore from '../../store/authStore'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('admin')
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const onFinish = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await signIn(email, password)
      setSession(data.session)
      navigate(mode === 'pop' ? '/pop/worklist' : '/', { replace: true })
    } catch (err) {
      message.error('로그인 실패: ' + (err.message || '이메일 또는 비밀번호를 확인하세요.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1677ff 0%, #003eb3 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} align="center">
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>MES v0</Title>
          <Text type="secondary">제조실행시스템</Text>
        </Space>

        <Segmented
          block
          value={mode}
          onChange={setMode}
          style={{ marginBottom: 24 }}
          options={[
            { label: '관리자 모드', value: 'admin', icon: <DesktopOutlined /> },
            { label: '현장 모드', value: 'pop', icon: <ToolOutlined /> },
          ]}
        />

        <Form name="login" onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="email"
            rules={[{ required: true, message: '이메일을 입력하세요' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="이메일" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={mode === 'pop' ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
            >
              {mode === 'pop' ? '현장 로그인' : '관리자 로그인'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
