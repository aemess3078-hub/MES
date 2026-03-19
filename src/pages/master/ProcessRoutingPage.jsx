import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Modal, Form, message,
  Popconfirm, Typography, Row, Col, Switch, Select, InputNumber,
  Tag, Divider, Tooltip,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ApartmentOutlined,
  ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined,
} from '@ant-design/icons'
import {
  getRoutings, createRouting, updateRouting, deleteRouting,
  getRoutingWithDetails, saveRoutingDetails,
} from '../../services/processRoutingService'
import { getProcesses } from '../../services/processService'

const { Title, Text } = Typography

export default function ProcessRoutingPage() {
  const [routings, setRoutings] = useState([])
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')

  // 라우팅 헤더 모달
  const [headerModalOpen, setHeaderModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [headerForm] = Form.useForm()

  // 공정 구성 모달
  const [stepModalOpen, setStepModalOpen] = useState(false)
  const [stepRouting, setStepRouting] = useState(null) // 현재 편집중인 라우팅
  const [steps, setSteps] = useState([]) // [{ process_id, cycle_time, note }]
  const [stepSaving, setStepSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getRoutings()
      const filtered = keyword
        ? data.filter((r) => r.routing_code.includes(keyword) || r.routing_name.includes(keyword))
        : data
      setRoutings(filtered)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getProcesses({ is_active: true }).then(setProcesses).catch(() => {})
  }, [])

  // ── 헤더 CRUD ──────────────────────────────────
  const openCreate = () => {
    setEditTarget(null)
    headerForm.resetFields()
    headerForm.setFieldsValue({ is_active: true })
    setHeaderModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    headerForm.setFieldsValue(record)
    setHeaderModalOpen(true)
  }

  const handleHeaderSave = async () => {
    try {
      const values = await headerForm.validateFields()
      if (editTarget) {
        await updateRouting(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        await createRouting(values)
        message.success('등록되었습니다.')
      }
      setHeaderModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteRouting(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  // ── 공정 구성 ──────────────────────────────────
  const openStepModal = async (record) => {
    setStepRouting(record)
    try {
      const data = await getRoutingWithDetails(record.id)
      setSteps(
        (data.process_routing_details ?? []).map((d) => ({
          process_id: d.process_id,
          cycle_time: d.cycle_time,
          note: d.note,
        }))
      )
    } catch {
      setSteps([])
    }
    setStepModalOpen(true)
  }

  const addStep = () => {
    setSteps((prev) => [...prev, { process_id: undefined, cycle_time: null, note: '' }])
  }

  const removeStep = (idx) => {
    setSteps((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveStep = (idx, dir) => {
    setSteps((prev) => {
      const arr = [...prev]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }

  const updateStep = (idx, field, value) => {
    setSteps((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleStepSave = async () => {
    if (steps.some((s) => !s.process_id)) {
      message.error('공정을 선택하지 않은 항목이 있습니다.')
      return
    }
    setStepSaving(true)
    try {
      await saveRoutingDetails(stepRouting.id, steps)
      message.success('공정 구성이 저장되었습니다.')
      setStepModalOpen(false)
    } catch (e) {
      message.error('저장 실패: ' + e.message)
    } finally {
      setStepSaving(false)
    }
  }

  const columns = [
    { title: '라우팅코드', dataIndex: 'routing_code', key: 'routing_code', width: 130 },
    { title: '라우팅명', dataIndex: 'routing_name', key: 'routing_name', width: 140 },
    {
      title: '공정 구성',
      key: 'steps',
      render: (_, r) => {
        const details = r.process_routing_details ?? []
        if (details.length === 0) return <span style={{ color: '#bbb' }}>미구성</span>
        return (
          <Space size={2} wrap>
            {details.map((d, idx) => (
              <Space key={d.step_no} size={0}>
                <Tooltip title={d.cycle_time ? `사이클타임: ${d.cycle_time}분` : null}>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {d.step_no}. {d.processes?.process_name ?? '-'}
                  </Tag>
                </Tooltip>
                {idx < details.length - 1 && (
                  <span style={{ color: '#aaa', margin: '0 2px' }}>→</span>
                )}
              </Space>
            ))}
          </Space>
        )
      },
    },
    { title: '비고', dataIndex: 'note', key: 'note', width: 120 },
    {
      title: '사용여부',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (v) => <Switch checked={v} size="small" disabled />,
    },
    {
      title: '관리',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<ApartmentOutlined />} onClick={() => openStepModal(r)}>공정 구성</Button>
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
      <Title level={4} style={{ marginBottom: 16 }}>공정 라우팅 관리</Title>

      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="라우팅코드/라우팅명 검색"
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
          dataSource={routings}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 라우팅 헤더 등록/수정 모달 */}
      <Modal
        title={editTarget ? '라우팅 수정' : '라우팅 신규 등록'}
        open={headerModalOpen}
        onOk={handleHeaderSave}
        onCancel={() => setHeaderModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={420}
      >
        <Form form={headerForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="라우팅코드" name="routing_code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="라우팅명" name="routing_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 공정 구성 모달 */}
      <Modal
        title={`공정 구성 - ${stepRouting?.routing_name ?? ''}`}
        open={stepModalOpen}
        onOk={handleStepSave}
        onCancel={() => setStepModalOpen(false)}
        okText="저장"
        cancelText="취소"
        confirmLoading={stepSaving}
        width={680}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">공정 순서대로 구성하세요. ↑↓ 버튼으로 순서를 변경할 수 있습니다.</Text>
          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addStep}>공정 추가</Button>
        </div>

        {steps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa', border: '1px dashed #d9d9d9', borderRadius: 6 }}>
            공정을 추가하세요
          </div>
        ) : (
          <div>
            {/* 헤더 */}
            <Row gutter={8} style={{ marginBottom: 6, padding: '0 4px' }}>
              <Col style={{ width: 40 }}><Text type="secondary" style={{ fontSize: 12 }}>순서</Text></Col>
              <Col flex="auto"><Text type="secondary" style={{ fontSize: 12 }}>공정 *</Text></Col>
              <Col style={{ width: 100 }}><Text type="secondary" style={{ fontSize: 12 }}>사이클타임(분)</Text></Col>
              <Col style={{ width: 120 }}><Text type="secondary" style={{ fontSize: 12 }}>비고</Text></Col>
              <Col style={{ width: 80 }}></Col>
            </Row>
            <Divider style={{ margin: '0 0 8px' }} />
            {steps.map((step, idx) => (
              <Row key={idx} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                <Col style={{ width: 40 }}>
                  <Tag color="blue" style={{ width: 32, textAlign: 'center' }}>{idx + 1}</Tag>
                </Col>
                <Col flex="auto">
                  <Select
                    showSearch
                    placeholder="공정 선택"
                    value={step.process_id}
                    onChange={(v) => updateStep(idx, 'process_id', v)}
                    options={processes.map((p) => ({
                      value: p.id,
                      label: `${p.process_code} ${p.process_name}`,
                    }))}
                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                    style={{ width: '100%' }}
                    size="small"
                  />
                </Col>
                <Col style={{ width: 100 }}>
                  <InputNumber
                    min={0}
                    value={step.cycle_time}
                    onChange={(v) => updateStep(idx, 'cycle_time', v)}
                    style={{ width: '100%' }}
                    size="small"
                    placeholder="분"
                  />
                </Col>
                <Col style={{ width: 120 }}>
                  <Input
                    value={step.note}
                    onChange={(e) => updateStep(idx, 'note', e.target.value)}
                    size="small"
                    placeholder="비고"
                  />
                </Col>
                <Col style={{ width: 80 }}>
                  <Space size={2}>
                    <Button size="small" icon={<ArrowUpOutlined />} onClick={() => moveStep(idx, -1)} disabled={idx === 0} />
                    <Button size="small" icon={<ArrowDownOutlined />} onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeStep(idx)} />
                  </Space>
                </Col>
              </Row>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
