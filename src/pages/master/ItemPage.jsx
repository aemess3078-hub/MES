import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Typography, Row, Col, Switch, Upload, Tag,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, UploadOutlined,
  FilePdfOutlined, FileOutlined, DeleteOutlined, EyeOutlined,
} from '@ant-design/icons'
import { getItems, createItem, updateItem, deleteItem, uploadWorkStandard, deleteWorkStandard } from '../../services/itemService'
import { getRoutings } from '../../services/processRoutingService'

const { Title } = Typography

export default function ItemPage() {
  const [items, setItems] = useState([])
  const [routings, setRoutings] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')

  // 작업표준서 관련 state
  const [pendingFile, setPendingFile] = useState(null)       // 새로 선택된 파일
  const [currentStandard, setCurrentStandard] = useState(null) // { url, name } 기존 파일
  const [toDelete, setToDelete] = useState(false)            // 기존 파일 삭제 여부
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getItems(keyword ? { keyword } : {})
      setItems(data)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getRoutings({ is_active: true }).then(setRoutings).catch(() => {})
  }, [])

  const resetFileState = () => {
    setPendingFile(null)
    setCurrentStandard(null)
    setToDelete(false)
  }

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true })
    resetFileState()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue({ ...record, routing_id: record.routing_id ?? undefined })
    setPendingFile(null)
    setToDelete(false)
    setCurrentStandard(
      record.work_standard_url
        ? { url: record.work_standard_url, name: record.work_standard_name }
        : null
    )
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)

      let savedItem
      if (editTarget) {
        savedItem = await updateItem(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        savedItem = await createItem(values)
        message.success('등록되었습니다.')
      }

      // 파일 처리
      if (pendingFile) {
        const { url, name, safeName } = await uploadWorkStandard(savedItem.id, pendingFile)
        // work_standard_name: 화면 표시용 원본명 / work_standard_path: 스토리지 경로용 안전한 이름
        await updateItem(savedItem.id, {
          work_standard_url: url,
          work_standard_name: name,
          work_standard_path: safeName,
        })
      } else if (toDelete && editTarget?.work_standard_path) {
        await deleteWorkStandard(editTarget.id, editTarget.work_standard_path)
        await updateItem(savedItem.id, { work_standard_url: null, work_standard_name: null, work_standard_path: null })
      }

      setModalOpen(false)
      load()
    } catch (e) {
      if (e.message) message.error('저장 실패: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteItem(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const handleRemoveCurrent = () => {
    setCurrentStandard(null)
    setToDelete(true)
  }

  // 파일 아이콘 판별
  const FileIcon = ({ name }) => {
    const ext = name?.split('.').pop()?.toLowerCase()
    return ext === 'pdf' ? <FilePdfOutlined style={{ color: '#ff4d4f' }} /> : <FileOutlined style={{ color: '#1677ff' }} />
  }

  const columns = [
    { title: '품목코드', dataIndex: 'item_code', key: 'item_code', width: 130 },
    { title: '품목명', dataIndex: 'item_name', key: 'item_name' },
    {
      title: '품목구분',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 100,
      render: (v) => ({ raw: '원자재', semi: '반제품', finished: '완제품' }[v] ?? v),
    },
    { title: '규격', dataIndex: 'spec', key: 'spec', width: 120 },
    { title: '단위', dataIndex: 'unit', key: 'unit', width: 70 },
    {
      title: '공정라우팅',
      key: 'routing',
      width: 140,
      render: (_, r) => r.routing_id
        ? (routings.find((rt) => rt.id === r.routing_id)?.routing_name ?? '-')
        : <span style={{ color: '#bbb' }}>미지정</span>,
    },
    {
      title: '작업표준서',
      key: 'work_standard',
      width: 110,
      render: (_, r) => r.work_standard_url
        ? (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(r.work_standard_url, '_blank')}
          >
            보기
          </Button>
        )
        : <span style={{ color: '#bbb' }}>-</span>,
    },
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

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>품목 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="품목코드/품목명 검색"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={load}
              style={{ width: 220 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<SearchOutlined />} onClick={load}>조회</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>신규 등록</Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editTarget ? '품목 수정' : '품목 신규 등록'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="저장"
        cancelText="취소"
        confirmLoading={uploading}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="품목코드" name="item_code" rules={[{ required: true, message: '품목코드를 입력하세요' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="품목명" name="item_name" rules={[{ required: true, message: '품목명을 입력하세요' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="품목구분" name="item_type" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'raw', label: '원자재' },
                { value: 'semi', label: '반제품' },
                { value: 'finished', label: '완제품' },
              ]}
            />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="규격" name="spec">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="단위" name="unit">
                <Input placeholder="EA, KG, M..." />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="공정라우팅" name="routing_id">
            <Select
              showSearch
              allowClear
              placeholder="라우팅 선택 (선택사항)"
              options={routings.map((r) => ({
                value: r.id,
                label: `${r.routing_code} ${r.routing_name}`,
              }))}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item label="비고" name="note">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* 작업표준서 업로드 */}
          <Form.Item label="작업표준서">
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: '12px 14px', background: '#fafafa' }}>
              {/* 기존 파일 표시 */}
              {currentStandard && !toDelete && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <FileIcon name={currentStandard.name} />
                  <a href={currentStandard.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13 }}>
                    {currentStandard.name}
                  </a>
                  <Tag color="green" style={{ margin: 0 }}>등록됨</Tag>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveCurrent}
                  >
                    삭제
                  </Button>
                </div>
              )}
              {toDelete && (
                <div style={{ marginBottom: 10, color: '#ff4d4f', fontSize: 13 }}>
                  저장 시 기존 파일이 삭제됩니다.
                </div>
              )}

              {/* 새 파일 선택 */}
              {pendingFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileIcon name={pendingFile.name} />
                  <span style={{ flex: 1, fontSize: 13 }}>{pendingFile.name}</span>
                  <Tag color="blue" style={{ margin: 0 }}>업로드 예정</Tag>
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setPendingFile(null)}
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <Upload
                  beforeUpload={(file) => {
                    setPendingFile(file)
                    setCurrentStandard(null)
                    setToDelete(false)
                    return false
                  }}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx,.hwp,.xls,.xlsx,.jpg,.jpeg,.png"
                >
                  <Button icon={<UploadOutlined />}>
                    {currentStandard ? '파일 교체' : '파일 선택'}
                  </Button>
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
                    PDF, HWP, Word, Excel, 이미지 지원
                  </span>
                </Upload>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
