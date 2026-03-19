import { useEffect, useState } from 'react'
import {
  Card, Table, Button, Space, Input, Select, Modal, Form,
  message, Popconfirm, Typography, Row, Col, Switch, Upload, Image, Avatar,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, UploadOutlined,
  DeleteOutlined, CameraOutlined,
} from '@ant-design/icons'
import {
  getEquipments, createEquipment, updateEquipment, deleteEquipment,
  uploadEquipPhoto, deleteEquipPhoto,
} from '../../services/equipmentService'
import { getProcesses } from '../../services/processService'
import { EQUIP_STATUS_LABEL } from '../../utils/constants'
import { EquipStatusBadge } from '../../components/common/StatusBadge'

const { Title } = Typography

export default function EquipmentPage() {
  const [data, setData] = useState([])
  const [processes, setProcesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState('')

  // 사진 관련 state
  const [pendingPhoto, setPendingPhoto] = useState(null)  // File 객체
  const [previewUrl, setPreviewUrl] = useState(null)      // 미리보기 URL (새 파일)
  const [currentPhoto, setCurrentPhoto] = useState(null)  // 기존 저장된 URL
  const [toDeletePhoto, setToDeletePhoto] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getEquipments(keyword ? { keyword } : {})
      setData(res)
    } catch (e) {
      message.error('조회 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    getProcesses().then(setProcesses).catch(() => {})
  }, [])

  const resetPhotoState = () => {
    setPendingPhoto(null)
    setPreviewUrl(null)
    setCurrentPhoto(null)
    setToDeletePhoto(false)
  }

  const openCreate = () => {
    setEditTarget(null)
    form.resetFields()
    form.setFieldsValue({ is_active: true, status: 'standby' })
    resetPhotoState()
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditTarget(record)
    form.setFieldsValue({ ...record, process_id: record.processes?.id ?? record.process_id })
    setPendingPhoto(null)
    setPreviewUrl(null)
    setToDeletePhoto(false)
    setCurrentPhoto(record.photo_url ?? null)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)

      let savedEquip
      if (editTarget) {
        savedEquip = await updateEquipment(editTarget.id, values)
        message.success('수정되었습니다.')
      } else {
        savedEquip = await createEquipment(values)
        message.success('등록되었습니다.')
      }

      // 사진 처리
      if (pendingPhoto) {
        const url = await uploadEquipPhoto(savedEquip.id, pendingPhoto)
        await updateEquipment(savedEquip.id, { photo_url: url })
      } else if (toDeletePhoto) {
        await deleteEquipPhoto(savedEquip.id, editTarget?.photo_url)
        await updateEquipment(savedEquip.id, { photo_url: null })
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
      await deleteEquipment(id)
      message.success('삭제되었습니다.')
      load()
    } catch (e) {
      message.error('삭제 실패: ' + e.message)
    }
  }

  const handlePhotoSelect = (file) => {
    setPendingPhoto(file)
    setPreviewUrl(URL.createObjectURL(file))
    setCurrentPhoto(null)
    setToDeletePhoto(false)
    return false
  }

  const handleRemovePhoto = () => {
    if (pendingPhoto) {
      setPendingPhoto(null)
      setPreviewUrl(null)
      setCurrentPhoto(editTarget?.photo_url ?? null)
    } else {
      setCurrentPhoto(null)
      setToDeletePhoto(true)
    }
  }

  // 현재 표시할 사진 URL
  const displayPhoto = previewUrl ?? currentPhoto

  const columns = [
    {
      title: '사진',
      key: 'photo',
      width: 64,
      render: (_, r) => r.photo_url
        ? <Image src={r.photo_url} width={44} height={44} style={{ objectFit: 'cover', borderRadius: 6 }} preview={{ mask: '보기' }} />
        : <Avatar size={44} icon={<CameraOutlined />} style={{ background: '#f0f0f0', color: '#bbb' }} />,
    },
    { title: '설비코드', dataIndex: 'equip_code', key: 'equip_code', width: 120 },
    { title: '설비명',   dataIndex: 'equip_name', key: 'equip_name' },
    { title: '설비유형', dataIndex: 'equip_type', key: 'equip_type', width: 110 },
    { title: '연결공정', key: 'process', width: 120, render: (_, r) => r.processes?.process_name ?? '-' },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <EquipStatusBadge status={s} />,
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
      <Title level={4} style={{ marginBottom: 16 }}>설비 관리</Title>
      <Card style={{ marginBottom: 12 }}>
        <Row gutter={8} align="middle">
          <Col>
            <Input
              placeholder="설비코드/설비명 검색"
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
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 15 }}
          scroll={{ x: 750 }}
        />
      </Card>

      <Modal
        title={editTarget ? '설비 수정' : '설비 신규 등록'}
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
              <Form.Item label="설비코드" name="equip_code" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="설비명" name="equip_name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="설비유형" name="equip_type">
            <Input placeholder="CNC, 프레스, 컨베이어..." />
          </Form.Item>
          <Form.Item label="연결 공정" name="process_id">
            <Select
              allowClear
              placeholder="공정 선택"
              options={processes.map((p) => ({ value: p.id, label: p.process_name }))}
            />
          </Form.Item>
          <Form.Item label="설비 상태" name="status">
            <Select
              options={Object.entries(EQUIP_STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))}
            />
          </Form.Item>
          <Form.Item label="사용여부" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>

          {/* 설비 사진 */}
          <Form.Item label="설비 사진">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* 미리보기 */}
              <div
                style={{
                  width: 120, height: 120, borderRadius: 8, overflow: 'hidden',
                  border: '1px dashed #d9d9d9', background: '#fafafa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {displayPhoto
                  ? <img src={displayPhoto} alt="설비사진" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <CameraOutlined style={{ fontSize: 36, color: '#bbb' }} />
                }
              </div>

              {/* 버튼 */}
              <Space direction="vertical" size={8}>
                <Upload
                  beforeUpload={handlePhotoSelect}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>
                    {displayPhoto ? '사진 교체' : '사진 업로드'}
                  </Button>
                </Upload>
                {displayPhoto && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleRemovePhoto}
                  >
                    사진 삭제
                  </Button>
                )}
                {toDeletePhoto && (
                  <span style={{ fontSize: 12, color: '#ff4d4f' }}>저장 시 삭제됩니다</span>
                )}
                <span style={{ fontSize: 12, color: '#888' }}>JPG, PNG, GIF 지원</span>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
