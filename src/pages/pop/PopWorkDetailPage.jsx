import { useEffect, useState } from 'react'
import {
  Card, Button, Typography, Descriptions, Space, message, Spin, Row, Col, Modal,
  Tag, Timeline, InputNumber, Form, DatePicker,
} from 'antd'
import {
  PlayCircleOutlined, CheckCircleOutlined, FileAddOutlined,
  ExclamationCircleOutlined, PauseCircleOutlined, ApartmentOutlined,
  FilePdfOutlined, FileOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getWorkOrderById, updateWorkOrderStatus } from '../../services/workOrderService'
import { getWorkOrderProcesses, updateWorkOrderProcess } from '../../services/workOrderProcessService'
import { WorkStatusTag } from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'

const { Title, Text } = Typography

const btnStyle = { height: 72, fontSize: 16, fontWeight: 600, borderRadius: 8 }

const STEP_STATUS_COLOR = { waiting: 'default', in_progress: 'processing', completed: 'success' }
const STEP_STATUS_LABEL = { waiting: '대기', in_progress: '진행중', completed: '완료' }

export default function PopWorkDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [workOrder, setWorkOrder] = useState(null)
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stepModalOpen, setStepModalOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(null) // 현재 액션 중인 공정단계
  const [stepAction, setStepAction] = useState('') // 'start' | 'complete'
  const [stepForm] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [wo, procs] = await Promise.all([
        getWorkOrderById(id),
        getWorkOrderProcesses(id),
      ])
      setWorkOrder(wo)
      setProcesses(procs)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatus = async (status, label) => {
    Modal.confirm({
      title: `${label}하시겠습니까?`,
      onOk: async () => {
        try {
          await updateWorkOrderStatus(id, status)
          message.success(`${label} 처리되었습니다.`)
          load()
        } catch (e) {
          message.error('처리 실패: ' + e.message)
        }
      },
    })
  }

  const openStepAction = (step, action) => {
    setActiveStep(step)
    setStepAction(action)
    stepForm.resetFields()
    if (action === 'start') {
      stepForm.setFieldsValue({ start_time: dayjs() })
    } else {
      stepForm.setFieldsValue({ end_time: dayjs(), good_qty: workOrder?.plan_qty, defect_qty: 0 })
    }
    setStepModalOpen(true)
  }

  const handleStepSave = async () => {
    try {
      const values = stepForm.getFieldsValue()
      const payload = stepAction === 'start'
        ? {
            status: 'in_progress',
            start_time: values.start_time?.toISOString(),
            worker_id: user?.id,
          }
        : {
            status: 'completed',
            end_time: values.end_time?.toISOString(),
            good_qty: Number(values.good_qty ?? 0),
            defect_qty: Number(values.defect_qty ?? 0),
          }
      await updateWorkOrderProcess(activeStep.id, payload)
      message.success(stepAction === 'start' ? '공정이 시작되었습니다.' : '공정이 완료되었습니다.')
      setStepModalOpen(false)
      load()
    } catch (e) {
      message.error('처리 실패: ' + e.message)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  if (!workOrder) return null

  const isWaiting = workOrder.status === 'waiting'
  const isInProgress = workOrder.status === 'in_progress'

  // 공정단계 진행 가능 여부 판단
  const canStartStep = (step) => {
    if (step.status !== 'waiting') return false
    // 이전 단계가 모두 완료된 경우만 시작 가능
    const prevSteps = processes.filter((p) => p.step_no < step.step_no)
    return prevSteps.every((p) => p.status === 'completed')
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="작업지시번호">
            <Text strong style={{ fontSize: 15 }}>{workOrder.work_order_no}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="품목">{workOrder.items?.item_name ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="계획수량">{workOrder.plan_qty?.toLocaleString()} EA</Descriptions.Item>
          <Descriptions.Item label="납기일">{formatDate(workOrder.due_date)}</Descriptions.Item>
          <Descriptions.Item label="상태"><WorkStatusTag status={workOrder.status} /></Descriptions.Item>
          {workOrder.items?.work_standard_url && (
            <Descriptions.Item label="작업표준서">
              <Button
                type="primary"
                icon={
                  workOrder.items.work_standard_name?.toLowerCase().endsWith('.pdf')
                    ? <FilePdfOutlined />
                    : <FileOutlined />
                }
                onClick={() => window.open(workOrder.items.work_standard_url, '_blank')}
                style={{ background: '#faad14', borderColor: '#faad14' }}
              >
                작업표준서 열기
              </Button>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 공정 진행 현황 */}
      {processes.length > 0 && (
        <Card
          title={<Space><ApartmentOutlined />공정 진행 현황</Space>}
          style={{ marginBottom: 16 }}
        >
          <Timeline
            items={processes.map((step, idx) => {
              const color = { waiting: 'gray', in_progress: 'blue', completed: 'green' }[step.status]
              return {
                color,
                children: (
                  <div style={{ paddingBottom: 4 }}>
                    <Space style={{ marginBottom: 4 }}>
                      <Text strong>STEP {step.step_no}. {step.processes?.process_name ?? '-'}</Text>
                      <Tag color={STEP_STATUS_COLOR[step.status]}>{STEP_STATUS_LABEL[step.status]}</Tag>
                    </Space>
                    {step.status !== 'waiting' && (
                      <div style={{ fontSize: 12, color: '#888' }}>
                        {step.start_time && <span>시작: {dayjs(step.start_time).format('MM/DD HH:mm')}</span>}
                        {step.end_time && <span style={{ marginLeft: 12 }}>완료: {dayjs(step.end_time).format('MM/DD HH:mm')}</span>}
                        {step.good_qty != null && <span style={{ marginLeft: 12 }}>양품: {Number(step.good_qty).toLocaleString()}</span>}
                        {step.defect_qty > 0 && <span style={{ marginLeft: 8, color: '#ff4d4f' }}>불량: {Number(step.defect_qty).toLocaleString()}</span>}
                      </div>
                    )}
                    {isInProgress && (
                      <div style={{ marginTop: 6 }}>
                        {step.status === 'waiting' && canStartStep(step) && (
                          <Button size="small" type="primary" ghost icon={<PlayCircleOutlined />} onClick={() => openStepAction(step, 'start')}>
                            공정 시작
                          </Button>
                        )}
                        {step.status === 'in_progress' && (
                          <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => openStepAction(step, 'complete')}>
                            공정 완료
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ),
              }
            })}
          />
        </Card>
      )}

      <Row gutter={[12, 12]}>
        {isWaiting && (
          <Col span={24}>
            <Button
              block type="primary" icon={<PlayCircleOutlined />}
              style={{ ...btnStyle, background: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => handleStatus('in_progress', '작업 시작')}
            >
              작업 시작
            </Button>
          </Col>
        )}

        {isInProgress && (
          <>
            <Col span={24}>
              <Button
                block type="primary" icon={<CheckCircleOutlined />}
                style={{ ...btnStyle, background: '#1677ff' }}
                onClick={() => handleStatus('completed', '작업 완료')}
              >
                작업 완료
              </Button>
            </Col>
            <Col span={24}>
              <Button
                block icon={<FileAddOutlined />} style={{ ...btnStyle }}
                onClick={() => navigate(`/pop/result/${id}`)}
              >
                생산실적 입력
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block danger icon={<ExclamationCircleOutlined />} style={{ ...btnStyle }}
                onClick={() => navigate(`/pop/defect/${id}`)}
              >
                불량 등록
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block icon={<PauseCircleOutlined />} style={{ ...btnStyle }}
                onClick={() => navigate(`/pop/downtime/${id}`)}
              >
                비가동 등록
              </Button>
            </Col>
          </>
        )}

        <Col span={24}>
          <Button block onClick={() => navigate('/pop/worklist')} style={{ height: 48 }}>
            목록으로 돌아가기
          </Button>
        </Col>
      </Row>

      {/* 공정 시작/완료 모달 */}
      <Modal
        title={stepAction === 'start' ? `공정 시작 - ${activeStep?.processes?.process_name}` : `공정 완료 - ${activeStep?.processes?.process_name}`}
        open={stepModalOpen}
        onOk={handleStepSave}
        onCancel={() => setStepModalOpen(false)}
        okText={stepAction === 'start' ? '시작' : '완료 저장'}
        cancelText="취소"
        width={360}
      >
        <Form form={stepForm} layout="vertical" style={{ marginTop: 16 }}>
          {stepAction === 'start' ? (
            <Form.Item label="시작시간" name="start_time" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          ) : (
            <>
              <Form.Item label="완료시간" name="end_time" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="양품수량" name="good_qty" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} suffix="EA" />
              </Form.Item>
              <Form.Item label="불량수량" name="defect_qty">
                <InputNumber min={0} style={{ width: '100%' }} suffix="EA" />
              </Form.Item>
              <Form.Item label="비고" name="note">
                <Form.Item name="note" noStyle>
                  <input style={{ width: '100%', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: 6 }} placeholder="비고" />
                </Form.Item>
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}
