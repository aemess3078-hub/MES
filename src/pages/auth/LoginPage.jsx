import { useState } from 'react'
import { Form, Input, Button, Typography, message, Divider } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  DesktopOutlined,
  ToolOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
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

  const isAdmin = mode === 'admin'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#0f172a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 배경 그라디언트 오브 */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)',
        top: -200, left: -100,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        bottom: -100, right: -50,
        pointerEvents: 'none',
      }} />

      {/* 왼쪽 소개 패널 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        maxWidth: 600,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 로고 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,70,229,0.45)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>M</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>MES</span>
        </div>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            color: '#fff',
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 16px',
            letterSpacing: -1,
          }}>
            스마트<br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>제조실행시스템</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            생산, 품질, 설비, 재고를 하나의 플랫폼에서<br />
            실시간으로 관리하고 AI로 분석하세요.
          </p>
        </div>

        {/* 특징 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '⚡', title: '실시간 모니터링', desc: '생산현황을 실시간으로 파악' },
            { icon: '🤖', title: 'AI Agent', desc: 'AI와 대화하며 데이터 분석' },
            { icon: '📊', title: '스마트 리포트', desc: '대화 기반 자동 리포트 생성' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{f.title}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div style={{
        width: 440,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* 모드 탭 */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 32,
            gap: 4,
          }}>
            {[
              { key: 'admin', icon: <DesktopOutlined />, label: '관리자 모드' },
              { key: 'pop', icon: <ToolOutlined />, label: '현장 모드' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setMode(tab.key)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: mode === tab.key
                    ? tab.key === 'admin'
                      ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                      : 'linear-gradient(135deg, #059669, #10b981)'
                    : 'transparent',
                  color: mode === tab.key ? '#fff' : '#64748b',
                  boxShadow: mode === tab.key ? '0 4px 12px rgba(0,0,0,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 제목 */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: '0 0 6px', letterSpacing: -0.5 }}>
              {isAdmin ? '관리자 로그인' : '현장 로그인'}
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
              {isAdmin ? '관리자 계정으로 로그인하세요' : '현장 작업자 계정으로 로그인하세요'}
            </p>
          </div>

          {/* 폼 */}
          <Form name="login" onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              style={{ marginBottom: 14 }}
              rules={[
                { required: true, message: '이메일을 입력하세요' },
                { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#475569' }} />}
                placeholder="이메일"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: 10,
                  height: 48,
                }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              style={{ marginBottom: 24 }}
              rules={[{ required: true, message: '비밀번호를 입력하세요' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#475569' }} />}
                placeholder="비밀번호"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  borderRadius: 10,
                  height: 48,
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 10,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: loading ? 'rgba(79,70,229,0.5)' : isAdmin
                    ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  boxShadow: loading ? 'none' : isAdmin
                    ? '0 8px 24px rgba(79,70,229,0.4)'
                    : '0 8px 24px rgba(5,150,105,0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? '로그인 중...' : (
                  <>
                    {isAdmin ? '관리자 로그인' : '현장 로그인'}
                    <ArrowRightOutlined />
                  </>
                )}
              </button>
            </Form.Item>
          </Form>

          {/* 하단 */}
          <div style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <Text style={{ color: '#475569', fontSize: 12 }}>
              MES v1.0 · Powered by Supabase + AI
            </Text>
          </div>
        </div>
      </div>

      {/* 인풋 다크 스타일 오버라이드 */}
      <style>{`
        .ant-input-affix-wrapper,
        .ant-input-password {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
        }
        .ant-input-affix-wrapper input,
        .ant-input-affix-wrapper .ant-input {
          background: transparent !important;
          color: #fff !important;
        }
        .ant-input-affix-wrapper input::placeholder {
          color: #475569 !important;
        }
        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: rgba(79,70,229,0.6) !important;
          box-shadow: 0 0 0 2px rgba(79,70,229,0.15) !important;
        }
        .ant-input-suffix .anticon,
        .ant-input-password-icon {
          color: #475569 !important;
        }
        .ant-form-item-explain-error {
          color: #f87171 !important;
          font-size: 12px !important;
        }
      `}</style>
    </div>
  )
}
