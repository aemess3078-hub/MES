import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Select, Modal, Form, Input,
  message, Popconfirm, Typography, Row, Col, Switch, Tree, Tag, Empty, InputNumber, Divider,
} from 'antd'
import { PlusOutlined, SearchOutlined, ApartmentOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { getItems } from '../../services/itemService'

const { Text } = Typography

const itemTypeColor = { raw: 'blue', semi: 'orange', finished: 'green' }
const itemTypeLabel = { raw: '원자재', semi: '반제품', finished: '완제품' }

async function getBoms(parentItemId) {
  let query = supabase
    .from('bom')
    .select('*, parent_item:items!bom_parent_item_id_fkey(item_code,item_name), child_item:items!bom_child_item_id_fkey(item_code,item_name)')
    .order('seq')
  if (parentItemId) query = query.eq('parent_item_id', parentItemId)
  const { data, error } = await query
  if (error) throw error
  return data
}

async function createBom(payload) {
  const { data, error } = await supabase.from('bom').insert(payload).select().single()
  if (error) throw error
  return data
}

async function updateBom(id, payload) {
  const { data, error } = await supabase.from('bom').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

async function deleteBom(id) {
  const { error } = await supabase.from('bom').delete().eq('id', id)
  if (error) throw error
}

function buildTreeData(parentItemId, allBoms, allItems, onAdd, onDelete, depth = 0) {
  if (depth > 8) return []
  const children = allBoms.filter((b) => b.parent_item_id === parentItemId && b.is_active)
  return children.map((bom) => {
    const child = allItems.find((i) => i.id === bom.child_item_id)
    const subChildren = buildTreeData(bom.child_item_id, allBoms, allItems, onAdd, onDelete, depth + 1)
    return {
      key: bom.id,
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Tag color={itemTypeColor[child?.item_type]} style={{ fontSize: 11, margin: 0 }}>
            {itemTypeLabel[child?.item_type] ?? '-'}
          </Tag>
          <Text strong>{child?.item_name ?? '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({child?.item_code}) ×{' '}
            <Text style={{ color: '#1677ff', fontWeight: 700 }}>{bom.quantity}</Text>{' '}
            {child?.unit ?? ''}
          </Text>
          {child?.item_type !== 'raw' && (
            <Button
              type="text"
              size="small"
              icon={<PlusCircleOutlined style={{ color: '#52c41a' }} />}
              onClick={(e) => { e.stopPropagation(); onAdd(bom.child_item_id, child) }}
              style={{ padding: '0 4px', height: 20 }}
            />
          )}
          <Popconfirm
            title="이 BOM 항목을 삭제하시겠습니까?"
            onConfirm={(e) => { e?.stopPropagation(); onDelete(bom.id) }}
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
              onClick={(e) => e.stopPropagation()}
              style={{ padding: '0 4px', height: 20 }}
            />
          </Popconfirm>
        </span>
      ),
      children: subChildren.length > 0 ? subChildren : undefined,
    }
  })
}

export default function BomPage() {
  const [boms, setBoms] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [parentFilter, setParentFilter] = useState('')

  // 트리 관련
  const [treeOpen, setTreeOpen] = useState(false)
  const [allBoms, setAllBoms] = useState([])
  const [treeParent, setTreeParent] = useState(null)

  // 트리에서 BOM 등록
  const [addingToParent, setAddingToParent] = useState(null) // { id, item }
  const [addForm] = Form.useForm()
  const [addSaving, setAddSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getBoms(parentFilter || undefined)
      setBoms(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadAllBoms = async () => {
    const { data } = await supabase.from('bom').select('*')
    if (data) setAllBoms(data)
  }

  useEffect(() => {
    getItems().then(setItems).catch(() => {})
    loadAllBoms()
    load()
  }, [])

  useEffect(() => { load() }, [parentFilter])

  // 목록 탭 등록/수정
  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editTarget) {
        await updateBom(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        await createBom(values)
        message.success('등록되었습니다.')
      }
      setModalOpen(false)
      load()
      loadAllBoms()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteBom(id)
      message.success('삭제되었습니다.')
      load()
      loadAllBoms()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  // 트리에서 자품목 추가
  const handleTreeAdd = (parentItemId, parentItem) => {
    setAddingToParent({ id: parentItemId, item: parentItem })
    addForm.resetFields()
    addForm.setFieldsValue({ is_active: true, quantity: 1, seq: 1 })
  }

  const handleTreeAddSave = async () => {
    try {
      const values = await addForm.validateFields()
      setAddSaving(true)
      await createBom({
        parent_item_id: addingToParent.id,
        child_item_id: values.child_item_id,
        quantity: Number(values.quantity),
        seq: values.seq ? Number(values.seq) : null,
        note: values.note ?? null,
        is_active: true,
      })
      message.success('BOM 항목이 등록되었습니다.')
      setAddingToParent(null)
      loadAllBoms()
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    } finally {
      setAddSaving(false)
    }
  }

  // 트리에서 최상위 모품목에 자품목 추가
  const handleRootAdd = (parentItem) => {
    setAddingToParent({ id: parentItem.id, item: parentItem })
    addForm.resetFields()
    addForm.setFieldsValue({ is_active: true, quantity: 1, seq: 1 })
  }

  const columns = [
    {
      title: '모품목',
      key: 'parent',
      render: (_, r) => r.parent_item ? `${r.parent_item.item_code} ${r.parent_item.item_name}` : '-',
    },
    {
      title: '자품목',
      key: 'child',
      render: (_, r) => r.child_item ? `${r.child_item.item_code} ${r.child_item.item_name}` : '-',
    },
    { title: '소요량', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '순번', dataIndex: 'seq', key: 'seq', width: 80 },
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
      width: 130,
      render: (_, r) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>수정</Button>
          <Popconfirm title="삭제하시겠습니까?" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger>삭제</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 트리에 표시할 모품목 목록 - 선택한 경우만 표시
  const parentList = treeParent
    ? items.filter((i) => i.id === treeParent)
    : []

  const treeData = parentList.map((parent) => ({
    key: `item-${parent.id}`,
    title: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Tag color={itemTypeColor[parent.item_type]} style={{ margin: 0 }}>
          {itemTypeLabel[parent.item_type]}
        </Tag>
        <Text strong style={{ fontSize: 14 }}>{parent.item_name}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>({parent.item_code})</Text>
        <Button
          type="text"
          size="small"
          icon={<PlusCircleOutlined style={{ color: '#52c41a' }} />}
          onClick={(e) => { e.stopPropagation(); handleRootAdd(parent) }}
          style={{ padding: '0 4px', height: 20 }}
        />
      </span>
    ),
    children: buildTreeData(parent.id, allBoms, items, handleTreeAdd, handleDelete),
  }))

  // BOM 없는 모품목은 트리에서 빈 children 표시
  const hasAnyBom = treeData.some((n) => n.children?.length > 0)

  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 20, letterSpacing: -0.4 }}>BOM 관리</div>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Select
              placeholder="모품목 선택"
              allowClear
              style={{ width: 240 }}
              value={parentFilter || undefined}
              onChange={(v) => setParentFilter(v ?? '')}
              showSearch
              options={items.filter((i) => i.item_type !== 'raw').map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Col>
          <Col><Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button></Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ApartmentOutlined />} onClick={() => { setTreeParent(null); setTreeOpen(true) }}>
                구조 보기
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 등록</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table dataSource={boms} columns={columns} rowKey="id" loading={loading} size="middle" pagination={{ pageSize: 15 }} />
      </Card>

      {/* BOM 구조 보기 + 등록 모달 */}
      <Modal
        title="BOM 구조 보기"
        open={treeOpen}
        onCancel={() => { setTreeOpen(false); setAddingToParent(null) }}
        footer={<Button onClick={() => { setTreeOpen(false); setAddingToParent(null) }}>닫기</Button>}
        width={640}
      >
        <Select
          placeholder="모품목 선택"
          allowClear
          showSearch
          style={{ width: '100%', marginBottom: 12 }}
          value={treeParent ?? undefined}
          onChange={(v) => { setTreeParent(v ?? null); setAddingToParent(null) }}
          options={items.filter((i) => i.item_type !== 'raw').map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
          filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
        />

        {!treeParent
          ? <Empty description="모품목을 선택하면 BOM 구조가 표시됩니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : treeData.length === 0
          ? <Empty description="BOM 데이터가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Tree
              treeData={treeData}
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              style={{ background: '#fafafa', padding: 12, borderRadius: 6, minHeight: 80 }}
            />
          )
        }


        {/* 인라인 BOM 등록 폼 */}
        {addingToParent && (
          <>
            <Divider style={{ margin: '16px 0 12px' }} />
            <div style={{ background: '#f0f9ff', border: '1px solid #91caff', borderRadius: 8, padding: '14px 16px' }}>
              <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>
                <PlusCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                자품목 추가 →{' '}
                <Tag color={itemTypeColor[addingToParent.item?.item_type]}>
                  {itemTypeLabel[addingToParent.item?.item_type]}
                </Tag>
                {addingToParent.item?.item_name}
              </Text>
              <Form form={addForm} layout="inline">
                <Form.Item name="child_item_id" rules={[{ required: true, message: '자품목 선택' }]} style={{ marginBottom: 8 }}>
                  <Select
                    showSearch
                    placeholder="자품목 선택"
                    style={{ width: 200 }}
                    options={items
                      .filter((i) => i.id !== addingToParent.id)
                      .map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
                <Form.Item name="quantity" rules={[{ required: true, message: '소요량' }]} style={{ marginBottom: 8 }}>
                  <InputNumber min={0.001} step={0.01} placeholder="소요량" style={{ width: 90 }} />
                </Form.Item>
                <Form.Item name="seq" style={{ marginBottom: 8 }}>
                  <InputNumber min={1} placeholder="순번" style={{ width: 70 }} />
                </Form.Item>
                <Form.Item style={{ marginBottom: 8 }}>
                  <Space>
                    <Button type="primary" size="small" loading={addSaving} onClick={handleTreeAddSave}>
                      추가
                    </Button>
                    <Button size="small" onClick={() => setAddingToParent(null)}>취소</Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </>
        )}
      </Modal>

      {/* 목록 탭 등록/수정 모달 */}
      <Modal
        title={editTarget ? 'BOM 수정' : 'BOM 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="모품목" name="parent_item_id" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="모품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="자품목" name="child_item_id" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="자품목 선택"
              options={items.map((i) => ({ value: i.id, label: `${i.item_code} ${i.item_name}` }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="소요량" name="quantity" rules={[{ required: true }]}>
                <Input type="number" min={0} step={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="순번" name="seq">
                <Input type="number" min={1} />
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
    </div>
  )
}
