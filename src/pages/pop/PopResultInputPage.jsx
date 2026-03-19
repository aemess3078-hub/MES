import { useEffect, useState } from 'react'
import {
  Card, Form, Input, Button, message, Typography, DatePicker,
  Spin, Table, Tag, Alert, Radio, InputNumber, Space,
} from 'antd'
import { SaveOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { supabase } from '../../lib/supabase'
import { getWorkOrderById } from '../../services/workOrderService'
import { createProductionResult } from '../../services/productionResultService'
import useAuthStore from '../../store/authStore'

const { Text } = Typography
const inputStyle = { height: 56, fontSize: 18 }

// BOM + 재고 총합 조회
async function getBomWithInventory(itemId) {
  const { data: bomItems, error } = await supabase
    .from('bom')
    .select('quantity, child_item_id, items!bom_child_item_id_fkey(item_name, unit)')
    .eq('parent_item_id', itemId)
    .eq('is_active', true)
  if (error) throw error
  if (!bomItems?.length) return []

  const childIds = bomItems.map((b) => b.child_item_id)
  const { data: invData } = await supabase
    .from('inventory').select('item_id, qty').in('item_id', childIds)

  return bomItems.map((b) => {
    const inv = invData?.find((i) => i.item_id === b.child_item_id)
    return {
      child_item_id: b.child_item_id,
      item_name: b.items?.item_name ?? '-',
      unit: b.items?.unit ?? '',
      bom_qty: Number(b.quantity),
      stock_qty: Number(inv?.qty ?? 0),
    }
  })
}

// LOT별 재고 조회
async function getLotsForItems(itemIds) {
  const { data } = await supabase
    .from('inventory_lots')
    .select('id, item_id, lot_no, qty, receipt_date')
    .in('item_id', itemIds)
    .gt('qty', 0)
    .order('receipt_date', { ascending: true })
    .order('created_at', { ascending: true })
  return data ?? []
}

// FIFO 차감 예정 계산 (미리보기용)
function calcFifoPreview(lots, requiredQty) {
  const result = []
  let remaining = requiredQty
  for (const lot of lots) {
    if (remaining <= 0) break
    const use = Math.min(Number(lot.qty), remaining)
    result.push({ ...lot, use_qty: use })
    remaining -= use
  }
  return { preview: result, shortage: remaining > 0 ? remaining : 0 }
}

export default function PopResultInputPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [workOrder, setWorkOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const [bomList, setBomList] = useState([])
  const [lotsMap, setLotsMap] = useState({})       // { child_item_id: [...lots] }
  const [goodQty, setGoodQty] = useState(0)
  const [method, setMethod] = useState('fifo')     // 'fifo' | 'lot'
  const [lotInputs, setLotInputs] = useState({})   // { child_item_id: { lot_id: qty } }

  useEffect(() => {
    getWorkOrderById(id)
      .then(async (wo) => {
        setWorkOrder(wo)
        form.setFieldsValue({ start_time: dayjs(), end_time: dayjs() })
        if (wo?.item_id) {
          const bom = await getBomWithInventory(wo.item_id)
          setBomList(bom)
          if (bom.length > 0) {
            const lots = await getLotsForItems(bom.map((b) => b.child_item_id))
            const map = {}
            bom.forEach((b) => {
              map[b.child_item_id] = lots.filter((l) => l.item_id === b.child_item_id)
            })
            setLotsMap(map)
          }
        }
      })
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false))
  }, [id])

  // 각 자품목별 소요량
  const requirements = bomList.map((b) => ({
    ...b,
    required_qty: b.bom_qty * goodQty,
  }))

  // FIFO 미리보기
  const fifoPreview = {}
  requirements.forEach((r) => {
    const lots = lotsMap[r.child_item_id] ?? []
    fifoPreview[r.child_item_id] = calcFifoPreview(lots, r.required_qty)
  })

  // LOT 선택 모드 합계 검증
  const lotValidation = {}
  requirements.forEach((r) => {
    const inputs = lotInputs[r.child_item_id] ?? {}
    const total = Object.values(inputs).reduce((s, v) => s + (Number(v) || 0), 0)
    lotValidation[r.child_item_id] = {
      total,
      ok: goodQty === 0 || total === r.required_qty,
    }
  })

  const hasShortage = goodQty > 0 && requirements.some((r) => {
    const lots = lotsMap[r.child_item_id] ?? []
    // LOT 레코드가 없으면 총 재고로 판단
    if (lots.length === 0) return r.stock_qty < r.required_qty
    if (method === 'fifo') return fifoPreview[r.child_item_id]?.shortage > 0
    return !lotValidation[r.child_item_id]?.ok
  })

  const handleSave = async () => {
    if (hasShortage) { message.error('재고 부족 또는 투입수량 미확정 항목이 있습니다.'); return }
    try {
      const values = await form.validateFields()
      setSaving(true)

      let deductionOptions = { method: 'fifo' }
      if (method === 'lot') {
        const lotDeductions = []
        requirements.forEach((r) => {
          const inputs = lotInputs[r.child_item_id] ?? {}
          Object.entries(inputs).forEach(([lot_id, qty]) => {
            if (Number(qty) > 0) {
              lotDeductions.push({ child_item_id: r.child_item_id, lot_id, qty: Number(qty) })
            }
          })
        })
        deductionOptions = { method: 'lot', lotDeductions }
      }

      await createProductionResult({
        work_order_id: id,
        good_qty: Number(values.good_qty),
        defect_qty: Number(values.defect_qty || 0),
        start_time: values.start_time?.toISOString(),
        end_time: values.end_time?.toISOString(),
        worker_id: user?.id,
        note: values.note,
      }, deductionOptions)

      message.success('생산실적이 저장되었습니다.')
      navigate(`/pop/work/${id}`)
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const setLotQty = (childItemId, lotId, qty) => {
    setLotInputs((prev) => ({
      ...prev,
      [childItemId]: { ...(prev[childItemId] ?? {}), [lotId]: qty },
    }))
  }

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>

  return (
    <div>
      <Card style={{ marginBottom: 16, background: '#e6f4ff' }}>
        <Text strong style={{ fontSize: 15 }}>작업지시: {workOrder?.work_order_no}</Text>
        <br />
        <Text type="secondary">{workOrder?.items?.item_name} | 계획수량: {workOrder?.plan_qty?.toLocaleString()} EA</Text>
      </Card>

      <Card title="생산실적 입력" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item label="시작시간" name="start_time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%', height: 56 }} />
          </Form.Item>
          <Form.Item label="종료시간" name="end_time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%', height: 56 }} />
          </Form.Item>
          <Form.Item label="양품수량" name="good_qty" rules={[{ required: true, message: '양품수량을 입력하세요' }]}>
            <Input
              type="number" min={0} style={inputStyle} suffix="EA" placeholder="0"
              onChange={(e) => setGoodQty(Number(e.target.value) || 0)}
            />
          </Form.Item>
          <Form.Item label="불량수량" name="defect_qty">
            <Input type="number" min={0} style={inputStyle} suffix="EA" placeholder="0" />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Card>

      {bomList.length > 0 && (
        <Card
          title="자재 투입"
          style={{ marginBottom: 16, borderColor: hasShortage ? '#ff4d4f' : undefined }}
          headStyle={{ background: hasShortage ? '#fff2f0' : '#f6ffed' }}
          extra={
            <Radio.Group
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="fifo">선입선출</Radio.Button>
              <Radio.Button value="lot">LOT 직접 선택</Radio.Button>
            </Radio.Group>
          }
        >
          {requirements.map((r) => {
            const lots = lotsMap[r.child_item_id] ?? []
            const { preview, shortage } = fifoPreview[r.child_item_id] ?? { preview: [], shortage: 0 }
            const validation = lotValidation[r.child_item_id]

            return (
              <div key={r.child_item_id} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Space>
                    <Text strong style={{ fontSize: 15 }}>{r.item_name}</Text>
                    <Tag color="blue">소요: {r.required_qty.toLocaleString()} {r.unit}</Tag>
                    <Tag color="default">현재고: {r.stock_qty.toLocaleString()} {r.unit}</Tag>
                  </Space>
                  {goodQty > 0 && (
                    method === 'fifo'
                      ? shortage > 0
                        ? <Tag color="error" icon={<CloseCircleFilled />}>부족 {shortage}{r.unit}</Tag>
                        : <Tag color="success" icon={<CheckCircleFilled />}>충분</Tag>
                      : validation?.ok
                        ? <Tag color="success" icon={<CheckCircleFilled />}>확정</Tag>
                        : <Tag color="warning">미확정 ({validation?.total ?? 0}/{r.required_qty})</Tag>
                  )}
                </div>

                {lots.length === 0 ? (
                  <Alert type="warning" message="등록된 LOT 정보가 없습니다. 재고 총합에서 차감됩니다." showIcon style={{ fontSize: 12 }} />
                ) : method === 'fifo' ? (
                  <Table
                    dataSource={goodQty > 0 ? preview : lots.map((l) => ({ ...l, use_qty: 0 }))}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      { title: 'LOT번호', dataIndex: 'lot_no', key: 'lot_no', render: (v) => v ?? '-' },
                      { title: '입고일', dataIndex: 'receipt_date', key: 'receipt_date', width: 110 },
                      { title: '현재고', dataIndex: 'qty', key: 'qty', width: 90, render: (v, r) => `${Number(v).toLocaleString()} ${r.unit ?? ''}` },
                      {
                        title: '차감예정',
                        dataIndex: 'use_qty',
                        key: 'use_qty',
                        width: 100,
                        render: (v) => v > 0
                          ? <Text strong style={{ color: '#fa8c16' }}>{Number(v).toLocaleString()}</Text>
                          : <Text type="secondary">-</Text>,
                      },
                    ]}
                    style={{ background: '#fafafa' }}
                  />
                ) : (
                  <Table
                    dataSource={lots}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      { title: 'LOT번호', dataIndex: 'lot_no', key: 'lot_no', render: (v) => v ?? '-' },
                      { title: '입고일', dataIndex: 'receipt_date', key: 'receipt_date', width: 110 },
                      {
                        title: '현재고',
                        dataIndex: 'qty',
                        key: 'qty',
                        width: 90,
                        render: (v) => `${Number(v).toLocaleString()} ${r.unit}`,
                      },
                      {
                        title: '투입수량',
                        key: 'input',
                        width: 130,
                        render: (_, lot) => (
                          <InputNumber
                            min={0}
                            max={Number(lot.qty)}
                            value={lotInputs[r.child_item_id]?.[lot.id] ?? 0}
                            onChange={(val) => setLotQty(r.child_item_id, lot.id, val ?? 0)}
                            style={{ width: 100 }}
                            size="small"
                          />
                        ),
                      },
                    ]}
                    style={{ background: '#fafafa' }}
                  />
                )}
              </div>
            )
          })}

          {hasShortage && (
            <Alert type="error" message="재고 부족 또는 투입수량 미확정 항목이 있어 저장할 수 없습니다." showIcon style={{ marginTop: 8 }} />
          )}
        </Card>
      )}

      <Button
        type="primary"
        block
        icon={<SaveOutlined />}
        style={{ height: 64, fontSize: 18, fontWeight: 700, marginBottom: 24 }}
        loading={saving}
        onClick={handleSave}
        disabled={hasShortage}
        danger={hasShortage}
      >
        {hasShortage ? '재고 부족 - 저장 불가' : '저장'}
      </Button>
    </div>
  )
}
