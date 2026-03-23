import { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { signUp } from '../../services/authService'

const { Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async ({ email, password, name }) => {
    setLoading(true)
    try {
      await signUp(email, password, name)
      message.success('가입이 완료되었습니다. 로그인해주세요.')
      navigate('/login', { replace: true })
    } catch (err) {
      message.error('가입 실패: ' + (err.message || '다시 시도해주세요.'))
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
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>회원가입</Title>
          <Text type="secondary">MES v0 계정 만들기</Text>
        </Space>
        <Form name="register" onFinish={onFinish} size="large" layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: '이름을 입력하세요' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="이름" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력하세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="이메일" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '비밀번호를 입력하세요' }, { min: 6, message: '6자 이상 입력하세요' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호 (6자 이상)" />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호를 다시 입력하세요' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호 확인" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              가입하기
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </Form>
      </Card>
    </div>
  )
}
