import { useEffect, useState, useMemo } from 'react'
import {
  Card, Table, Button, Space, Select, Modal, Form, Input,
  message, Popconfirm, Typography, Row, Col, Tabs, Badge,
  Radio, DatePicker, Tag, Segmented, Empty, Spin, Image, Avatar,
} from 'antd'
import {
  PlusOutlined, CheckCircleOutlined, CloseCircleOutlined,
  SettingOutlined, SaveOutlined, CalendarOutlined, CameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { getEquipments } from '../../services/equipmentService'
import {
  getCheckItems, createCheckItem, updateCheckItem, deleteCheckItem,
  getCheckLogs, saveCheckLogs,
} from '../../services/equipmentCheckService'
import useAuthStore from '../../store/authStore'

dayjs.extend(isoWeek)

const { Title, Text } = Typography

const CYCLE_LABEL = { daily: '일단위', weekly: '주단위', monthly: '월단위' }
const CYCLE_PICKER = { daily: undefined, weekly: 'week', monthly: 'month' }

// 주기별 기준 날짜 계산
function getCheckDate(cycle, date) {
  if (!date) return null
  if (cycle === 'daily')   return date.format('YYYY-MM-DD')
  if (cycle === 'weekly')  return date.isoWeekday(1).format('YYYY-MM-DD') // 월요일
  if (cycle === 'monthly') return date.startOf('month').format('YYYY-MM-DD')
  return date.format('YYYY-MM-DD')
}

function getDateLabel(cycle, date) {
  if (!date) return ''
  if (cycle === 'daily')   return date.format('YYYY년 MM월 DD일 (ddd)')
  if (cycle === 'weekly') {
    const mon = date.isoWeekday(1)
    const sun = date.isoWeekday(7)
    return `${date.isoWeekYear()}년 ${date.isoWeek()}주 (${mon.format('MM/DD')} ~ ${sun.format('MM/DD')})`
  }
  if (cycle === 'monthly') return date.format('YYYY년 MM월')
  return ''
}

export default function EquipmentCheckPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('check')

  // ── 점검 실시 ──────────────────────────────
  const [cycle, setCycle] = useState('daily')
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [equipments, setEquipments] = useState([])
  const [allItems, setAllItems] = useState([])   // 전체 점검항목
  const [logs, setLogs] = useState([])           // 기존 저장된 실적
  const [results, setResults] = useState({})     // { [itemId]: { result, note } }
  const [saving, setSaving] = useState({})       // { [equipId]: bool }
  const [checkLoading, setCheckLoading] = useState(false)

  // ── 점검항목 관리 ──────────────────────────
  const [itemEquipId, setItemEquipId] = useState(null)
  const [itemCycle, setItemCycle] = useState('daily')
  const [checkItems, setCheckItems] = useState([])
  const [itemLoading, setItemLoading] = useState(false)
  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [itemForm] = Form.useForm()

  // ── 초기 로드 ──────────────────────────────
  useEffect(() => {
    getEquipments({ is_active: true }).then(setEquipments).catch(() => {})
  }, [])

  // 점검 실시: 날짜/주기 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedDate) return
    loadCheckData()
  }, [cycle, selectedDate])

  const loadCheckData = async () => {
    setCheckLoading(true)
    try {
      const checkDate = getCheckDate(cycle, selectedDate)
      const [items, logData] = await Promise.all([
        getCheckItems({ cycle, is_active: true }),
        getCheckLogs(cycle, checkDate),
      ])
      setAllItems(items)
      setLogs(logData)
      // 기존 실적으로 results 초기화
      const init = {}
      logData.forEach((l) => {
        init[l.check_item_id] = { result: l.result, note: l.note ?? '' }
      })
      setResults(init)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setCheckLoading(false)
    }
  }

  // 설비별 점검항목 그룹
  const itemsByEquip = useMemo(() => {
    const map = {}
    allItems.forEach((item) => {
      if (!map[item.equipment_id]) map[item.equipment_id] = []
      map[item.equipment_id].push(item)
    })
    return map
  }, [allItems])

  // 점검 대상 설비 (해당 주기의 항목이 있는 설비만)
  const targetEquipments = useMemo(
    () => equipments.filter((e) => (itemsByEquip[e.id]?.length ?? 0) > 0),
    [equipments, itemsByEquip]
  )

  const setResult = (itemId, field, value) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }))
  }

  const handleSaveEquip = async (equip) => {
    const items = itemsByEquip[equip.id] ?? []
    const unset = items.filter((i) => !results[i.id]?.result)
    if (unset.length > 0) {
      message.warning(`${unset.length}개 항목의 점검 결과를 선택하세요.`)
      return
    }
    setSaving((s) => ({ ...s, [equip.id]: true }))
    try {
      const checkDate = getCheckDate(cycle, selectedDate)
      const rows = items.map((item) => ({
        equipment_id: equip.id,
        check_item_id: item.id,
        cycle,
        check_date: checkDate,
        result: results[item.id]?.result,
        note: results[item.id]?.note ?? null,
        checked_by: user?.id ?? null,
      }))
      await saveCheckLogs(rows)
      message.success(`[${equip.equip_name}] 점검 저장 완료`)
      loadCheckData()
    } catch (e) {
      message.error('저장 실패: ' + e.message)
    } finally {
      setSaving((s) => ({ ...s, [equip.id]: false }))
    }
  }

  // 설비별 완료 여부
  const getEquipStatus = (equipId) => {
    const items = itemsByEquip[equipId] ?? []
    if (!items.length) return 'none'
    const done = items.filter((i) => results[i.id]?.result).length
    if (done === 0) return 'none'
    if (done < items.length) return 'partial'
    return 'done'
  }

  // ── 점검항목 관리 ──────────────────────────
  const loadCheckItems = async () => {
    if (!itemEquipId) return
    setItemLoading(true)
    try {
      const data = await getCheckItems({ equipment_id: itemEquipId, cycle: itemCycle })
      setCheckItems(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setItemLoading(false)
    }
  }

  useEffect(() => {
    if (itemEquipId) loadCheckItems()
  }, [itemEquipId, itemCycle])

  const openItemCreate = () => {
    setEditItem(null)
    itemForm.resetFields()
    itemForm.setFieldsValue({
      equipment_id: itemEquipId,
      cycle: itemCycle,
      is_active: true,
      sort_no: checkItems.length + 1,
    })
    setItemModalOpen(true)
  }

  const openItemEdit = (record) => {
    setEditItem(record)
    itemForm.setFieldsValue(record)
    setItemModalOpen(true)
  }

  const handleItemSave = async () => {
    try {
      const values = await itemForm.validateFields()
      if (editItem) {
        await updateCheckItem(editItem.id, values)
        message.success('수정되었습니다.')
      } else {
        await createCheckItem(values)
        message.success('등록되었습니다.')
      }
      setItemModalOpen(false)
      loadCheckItems()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleItemDelete = async (id) => {
    try {
      await deleteCheckItem(id)
      message.success('삭제되었습니다.')
      loadCheckItems()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  // ── 점검항목 테이블 컬럼 ──────────────────
  const itemColumns = [
    { title: '순서', dataIndex: 'sort_no', width: 60, align: 'center' },
    { title: '점검항목', dataIndex: 'check_name', key: 'check_name' },
    { title: '점검방법', dataIndex: 'check_method', key: 'check_method' },
    { title: '판정기준', dataIndex: 'standard', key: 'standard' },
    {
      title: '사용',
      dataIndex: 'is_active',
      width: 60,
      align: 'center',
      render: (v) => v ? <Tag color="green">Y</Tag> : <Tag>N</Tag>,
    },
    {
      title: '관리',
      key: 'action',
      width: 120,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openItemEdit(r)}>수정</Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleItemDelete(r.id)}>
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // ── 점검 실시 체크 테이블 컬럼 ──────────────
  const checkColumns = [
    { title: 'No', key: 'no', width: 45, align: 'center', render: (_, __, i) => i + 1 },
    { title: '점검항목', dataIndex: 'check_name', key: 'check_name', width: 160 },
    { title: '점검방법', dataIndex: 'check_method', key: 'check_method', width: 140 },
    { title: '판정기준', dataIndex: 'standard', key: 'standard', width: 140 },
    {
      title: '결과',
      key: 'result',
      width: 160,
      render: (_, item) => (
        <Radio.Group
          value={results[item.id]?.result}
          onChange={(e) => setResult(item.id, 'result', e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="ok" style={{ color: results[item.id]?.result === 'ok' ? '#fff' : '#52c41a', borderColor: '#52c41a', background: results[item.id]?.result === 'ok' ? '#52c41a' : undefined }}>
            ✓ 정상
          </Radio.Button>
          <Radio.Button value="ng" style={{ color: results[item.id]?.result === 'ng' ? '#fff' : '#ff4d4f', borderColor: '#ff4d4f', background: results[item.id]?.result === 'ng' ? '#ff4d4f' : undefined }}>
            ✗ 이상
          </Radio.Button>
        </Radio.Group>
      ),
    },
    {
      title: '비고',
      key: 'note',
      render: (_, item) => (
        <Input
          size="small"
          value={results[item.id]?.note ?? ''}
          onChange={(e) => setResult(item.id, 'note', e.target.value)}
          placeholder="특이사항 입력"
        />
      ),
    },
  ]

  const statusBadge = (equipId) => {
    const s = getEquipStatus(equipId)
    if (s === 'done')    return <Badge status="success" text="점검완료" />
    if (s === 'partial') return <Badge status="processing" text="진행중" />
    return <Badge status="default" text="미점검" />
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>설비 일상점검</Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        items={[
          {
            key: 'check',
            label: <span><CheckCircleOutlined /> 점검 실시</span>,
            children: (
              <>
                {/* 필터 바 */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={12} align="middle">
                    <Col>
                      <Segmented
                        value={cycle}
                        onChange={(v) => { setCycle(v); setSelectedDate(dayjs()) }}
                        options={[
                          { label: '일단위', value: 'daily' },
                          { label: '주단위', value: 'weekly' },
                          { label: '월단위', value: 'monthly' },
                        ]}
                        style={{ fontWeight: 600 }}
                      />
                    </Col>
                    <Col>
                      <DatePicker
                        picker={CYCLE_PICKER[cycle]}
                        value={selectedDate}
                        onChange={(d) => d && setSelectedDate(d)}
                        allowClear={false}
                        style={{ width: cycle === 'daily' ? 160 : cycle === 'weekly' ? 180 : 130 }}
                      />
                    </Col>
                    <Col>
                      <Tag icon={<CalendarOutlined />} color="blue" style={{ fontSize: 13, padding: '3px 10px' }}>
                        {getDateLabel(cycle, selectedDate)}
                      </Tag>
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                      <Text type="secondary">
                        점검 설비 {targetEquipments.length}개 /
                        완료 {targetEquipments.filter((e) => getEquipStatus(e.id) === 'done').length}개
                      </Text>
                    </Col>
                  </Row>
                </Card>

                {checkLoading ? (
                  <div style={{ textAlign: 'center', paddingTop: 60 }}><Spin size="large" /></div>
                ) : targetEquipments.length === 0 ? (
                  <Card>
                    <Empty description={`${CYCLE_LABEL[cycle]} 점검항목이 등록된 설비가 없습니다. [점검항목 관리] 탭에서 항목을 등록하세요.`} />
                  </Card>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }} size={16}>
                    {targetEquipments.map((equip) => {
                      const items = itemsByEquip[equip.id] ?? []
                      const status = getEquipStatus(equip.id)
                      const allDone = status === 'done'
                      const ngCount = items.filter((i) => results[i.id]?.result === 'ng').length

                      return (
                        <Card
                          key={equip.id}
                          size="small"
                          title={
                            <Row align="middle" gutter={12} wrap={false}>
                              {/* 설비 사진 썸네일 */}
                              <Col flex="none">
                                {equip.photo_url
                                  ? (
                                    <Image
                                      src={equip.photo_url}
                                      width={52}
                                      height={52}
                                      style={{ objectFit: 'cover', borderRadius: 6, display: 'block' }}
                                      preview={{ mask: '확대' }}
                                    />
                                  )
                                  : (
                                    <Avatar
                                      size={52}
                                      icon={<CameraOutlined />}
                                      style={{ background: '#f0f0f0', color: '#ccc', borderRadius: 6 }}
                                      shape="square"
                                    />
                                  )
                                }
                              </Col>
                              <Col flex="auto">
                                <div>
                                  <Text strong style={{ fontSize: 14 }}>
                                    [{equip.equip_code}] {equip.equip_name}
                                  </Text>
                                  {equip.equip_type && (
                                    <Tag style={{ marginLeft: 8 }}>{equip.equip_type}</Tag>
                                  )}
                                </div>
                                <Space size={8} style={{ marginTop: 4 }}>
                                  {statusBadge(equip.id)}
                                  {ngCount > 0 && (
                                    <Tag color="red" icon={<CloseCircleOutlined />}>
                                      이상 {ngCount}건
                                    </Tag>
                                  )}
                                </Space>
                              </Col>
                            </Row>
                          }
                          extra={
                            <Button
                              type="primary"
                              size="small"
                              icon={<SaveOutlined />}
                              loading={saving[equip.id]}
                              onClick={() => handleSaveEquip(equip)}
                              style={allDone ? { background: '#52c41a', borderColor: '#52c41a' } : {}}
                            >
                              {allDone ? '재저장' : '저장'}
                            </Button>
                          }
                          style={{
                            borderLeft: `4px solid ${
                              status === 'done' ? '#52c41a' :
                              status === 'partial' ? '#1677ff' : '#d9d9d9'
                            }`,
                          }}
                        >
                          <Table
                            dataSource={items}
                            columns={checkColumns}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            rowClassName={(item) =>
                              results[item.id]?.result === 'ng' ? 'ng-row' : ''
                            }
                          />
                        </Card>
                      )
                    })}
                  </Space>
                )}
              </>
            ),
          },
          {
            key: 'items',
            label: <span><SettingOutlined /> 점검항목 관리</span>,
            children: (
              <>
                <Card style={{ marginBottom: 12 }}>
                  <Row gutter={8} align="middle">
                    <Col>
                      <Select
                        style={{ width: 220 }}
                        placeholder="설비 선택"
                        showSearch
                        value={itemEquipId}
                        onChange={setItemEquipId}
                        options={equipments.map((e) => ({
                          value: e.id,
                          label: `[${e.equip_code}] ${e.equip_name}`,
                        }))}
                        filterOption={(input, option) =>
                          option.label.toLowerCase().includes(input.toLowerCase())
                        }
                      />
                    </Col>
                    <Col>
                      <Segmented
                        value={itemCycle}
                        onChange={setItemCycle}
                        options={[
                          { label: '일단위', value: 'daily' },
                          { label: '주단위', value: 'weekly' },
                          { label: '월단위', value: 'monthly' },
                        ]}
                      />
                    </Col>
                    <Col flex="auto" style={{ textAlign: 'right' }}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={openItemCreate}
                        disabled={!itemEquipId}
                      >
                        항목 추가
                      </Button>
                    </Col>
                  </Row>
                </Card>

                <Card>
                  {!itemEquipId ? (
                    <Empty description="설비를 선택하세요." />
                  ) : (
                    <Table
                      dataSource={checkItems}
                      columns={itemColumns}
                      rowKey="id"
                      loading={itemLoading}
                      size="middle"
                      pagination={false}
                    />
                  )}
                </Card>
              </>
            ),
          },
        ]}
      />

      {/* 점검항목 등록/수정 모달 */}
      <Modal
        title={editItem ? '점검항목 수정' : '점검항목 추가'}
        open={itemModalOpen}
        onOk={handleItemSave}
        onCancel={() => setItemModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={480}
      >
        <Form form={itemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="equipment_id" hidden><Input /></Form.Item>
          <Form.Item label="주기" name="cycle" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'daily', label: '일단위' },
                { value: 'weekly', label: '주단위' },
                { value: 'monthly', label: '월단위' },
              ]}
            />
          </Form.Item>
          <Form.Item label="점검항목명" name="check_name" rules={[{ required: true, message: '점검항목명을 입력하세요' }]}>
            <Input placeholder="예: 오일레벨 확인" />
          </Form.Item>
          <Form.Item label="점검방법" name="check_method">
            <Input placeholder="예: 육안 확인" />
          </Form.Item>
          <Form.Item label="판정기준" name="standard">
            <Input placeholder="예: 오일레벨 MIN ~ MAX 사이" />
          </Form.Item>
          <Row gutter={8}>
            <Col span={10}>
              <Form.Item label="순서" name="sort_no">
                <Input type="number" min={1} />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item label="사용여부" name="is_active" initialValue={true}>
                <Select
                  options={[
                    { value: true, label: '사용' },
                    { value: false, label: '미사용' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .ng-row { background: #fff2f0 !important; }
        .ng-row:hover > td { background: #ffe7e0 !important; }
      `}</style>
    </div>
  )
}
