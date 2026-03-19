import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Typography, Select, Spin } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkOrderById } from '../../services/workOrderService'
import { createDefect } from '../../services/defectService'
import { getCodesByGroup } from '../../services/commonCodeService'
import { getProcesses } from '../../services/processService'

const { Text } = Typography

const inputStyle = { height: 56, fontSize: 18 }

export default function PopDefectInputPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workOrder, setWorkOrder] = useState(null)
  const [defectTypes, setDefectTypes] = useState([])
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      getWorkOrderById(id),
      getCodesByGroup('DEFECT_TYPE'),
      getProcesses(),
    ]).then(([wo, types, procs]) => {
      setWorkOrder(wo)
      setDefectTypes(types)
      setProcesses(procs)
      if (wo.process_id) form.setFieldsValue({ process_id: wo.process_id })
    }).catch((e) => message.error(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await createDefect({
        work_order_id: id,
        defect_type_code: values.defect_type_code,
        defect_qty: Number(values.defect_qty),
        process_id: values.process_id || null,
        occurred_at: new Date().toISOString(),
        note: values.note,
      })
      message.success('불량이 등록되었습니다.')
      navigate(`/pop/work/${id}`)
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  }

  return (
    <div>
      <Card style={{ marginBottom: 16, background: '#fff2f0', border: '1px solid #ffccc7' }}>
        <Text strong style={{ fontSize: 15 }}>불량 등록</Text>
        <br />
        <Text type="secondary">{workOrder?.work_order_no} | {workOrder?.items?.item_name}</Text>
      </Card>

      <Card>
        <Form form={form} layout="vertical" size="large">
          <Form.Item label="불량유형" name="defect_type_code" rules={[{ required: true, message: '불량유형을 선택하세요' }]}>
            <Select
              style={{ height: 56 }}
              placeholder="불량유형 선택"
              options={defectTypes.map((t) => ({ value: t.code, label: t.code_name }))}
            />
          </Form.Item>
          <Form.Item label="불량수량" name="defect_qty" rules={[{ required: true, message: '불량수량을 입력하세요' }]}>
            <Input type="number" min={1} style={inputStyle} suffix="EA" placeholder="0" />
          </Form.Item>
          <Form.Item label="발생공정" name="process_id">
            <Select
              style={{ height: 56 }}
              placeholder="공정 선택 (선택사항)"
              allowClear
              options={processes.map((p) => ({ value: p.id, label: p.process_name }))}
            />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button
            type="primary"
            danger
            block
            icon={<SaveOutlined />}
            style={{ height: 64, fontSize: 18, fontWeight: 700 }}
            loading={saving}
            onClick={handleSave}
          >
            불량 등록
          </Button>
        </Form>
      </Card>
    </div>
  )
}
