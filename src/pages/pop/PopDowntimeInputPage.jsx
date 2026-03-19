import { useEffect, useState } from 'react'
import { Card, Form, Input, Button, message, Typography, Select, DatePicker, Spin } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getWorkOrderById } from '../../services/workOrderService'
import { createDowntime } from '../../services/downtimeService'
import { getCodesByGroup } from '../../services/commonCodeService'
import { getEquipments } from '../../services/equipmentService'

const { Text } = Typography

const inputStyle = { height: 56, fontSize: 18 }

export default function PopDowntimeInputPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [workOrder, setWorkOrder] = useState(null)
  const [reasons, setReasons] = useState([])
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    Promise.all([
      getWorkOrderById(id),
      getCodesByGroup('DOWNTIME_REASON'),
      getEquipments({ is_active: true }),
    ]).then(([wo, rsns, eqs]) => {
      setWorkOrder(wo)
      setReasons(rsns)
      setEquipments(eqs)
      form.setFieldsValue({
        start_time: dayjs(),
      })
    }).catch((e) => message.error(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await createDowntime({
        work_order_id: id,
        equipment_id: values.equipment_id || null,
        reason_code: values.reason_code,
        start_time: values.start_time?.toISOString(),
        end_time: values.end_time?.toISOString() || null,
        note: values.note,
      })
      message.success('비가동이 등록되었습니다.')
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
      <Card style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}>
        <Text strong style={{ fontSize: 15 }}>비가동 등록</Text>
        <br />
        <Text type="secondary">{workOrder?.work_order_no} | {workOrder?.items?.item_name}</Text>
      </Card>

      <Card>
        <Form form={form} layout="vertical" size="large">
          <Form.Item label="설비" name="equipment_id">
            <Select
              style={{ height: 56 }}
              placeholder="설비 선택 (선택사항)"
              allowClear
              options={equipments.map((e) => ({ value: e.id, label: e.equip_name }))}
            />
          </Form.Item>
          <Form.Item label="비가동사유" name="reason_code" rules={[{ required: true, message: '비가동사유를 선택하세요' }]}>
            <Select
              style={{ height: 56 }}
              placeholder="사유 선택"
              options={reasons.map((r) => ({ value: r.code, label: r.code_name }))}
            />
          </Form.Item>
          <Form.Item label="시작시간" name="start_time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%', height: 56 }} />
          </Form.Item>
          <Form.Item label="종료시간" name="end_time">
            <DatePicker showTime style={{ width: '100%', height: 56 }} />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Button
            type="primary"
            block
            icon={<SaveOutlined />}
            style={{ height: 64, fontSize: 18, fontWeight: 700, background: '#faad14', borderColor: '#faad14' }}
            loading={saving}
            onClick={handleSave}
          >
            비가동 등록
          </Button>
        </Form>
      </Card>
    </div>
  )
}
