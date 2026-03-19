import { useState, useEffect } from 'react'
import {
  Card, Row, Col, Badge, Tag, Table, Typography, Modal,
  Progress, Statistic, Divider,
} from 'antd'
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import CncMachineIllustration from '../../components/common/CncMachineIllustration'

const { Title, Text } = Typography

// ── 가데이터 ──────────────────────────────────────────────
const INITIAL_MACHINES = [
  {
    id: 'CNC-001',
    name: 'CNC-001',
    model: 'FANUC 0i-MF',
    machineType: 'vmc',
    status: 'running',
    program: 'O1234_HOUSING_A',
    workOrder: 'WO-2026-0319-001',
    item: '하우징 A형',
    spindleSpeed: 3500,
    spindleLoad: 45,
    feedRate: 800,
    posX: 125.432,
    posY: -88.215,
    posZ: -45.670,
    toolNo: 'T03',
    partsDone: 48,
    partsTarget: 100,
    cycleTime: 185,
    estCycleTime: 180,
    temp: 38.5,
    alarms: [],
    uptime: 95,
  },
  {
    id: 'CNC-002',
    name: 'CNC-002',
    model: 'FANUC 0i-MF',
    machineType: 'vmc',
    status: 'running',
    program: 'O2156_BRACKET_B',
    workOrder: 'WO-2026-0319-003',
    item: '브라켓 B형',
    spindleSpeed: 4200,
    spindleLoad: 62,
    feedRate: 1200,
    posX: 45.120,
    posY: -12.880,
    posZ: -22.340,
    toolNo: 'T07',
    partsDone: 32,
    partsTarget: 80,
    cycleTime: 120,
    estCycleTime: 115,
    temp: 41.2,
    alarms: [],
    uptime: 98,
  },
  {
    id: 'CNC-003',
    name: 'CNC-003',
    model: 'SIEMENS 828D',
    machineType: 'hmc',
    status: 'alarm',
    program: 'O3301_SHAFT_C',
    workOrder: 'WO-2026-0319-002',
    item: '샤프트 C형',
    spindleSpeed: 0,
    spindleLoad: 0,
    feedRate: 0,
    posX: 0.0,
    posY: 0.0,
    posZ: 0.0,
    toolNo: 'T12',
    partsDone: 15,
    partsTarget: 60,
    cycleTime: 0,
    estCycleTime: 210,
    temp: 45.8,
    alarms: [
      { code: 'ALM-2102', msg: '공구 파손 감지 - T12', time: '09:15:32', level: 'error' },
      { code: 'ALM-1056', msg: '주축 과부하 경보', time: '09:15:30', level: 'error' },
    ],
    uptime: 72,
  },
  {
    id: 'CNC-004',
    name: 'CNC-004',
    model: 'FANUC 30i-B',
    machineType: 'vmc',
    status: 'running',
    program: 'O4502_COVER_D',
    workOrder: 'WO-2026-0319-004',
    item: '커버 D형',
    spindleSpeed: 2800,
    spindleLoad: 38,
    feedRate: 600,
    posX: -22.450,
    posY: 55.320,
    posZ: -18.900,
    toolNo: 'T05',
    partsDone: 67,
    partsTarget: 120,
    cycleTime: 95,
    estCycleTime: 90,
    temp: 36.1,
    alarms: [],
    uptime: 99,
  },
  {
    id: 'CNC-005',
    name: 'CNC-005',
    model: 'MAZAK VARIAXIS',
    machineType: '5axis',
    status: 'stopped',
    program: '',
    workOrder: '',
    item: '-',
    spindleSpeed: 0,
    spindleLoad: 0,
    feedRate: 0,
    posX: 0.0,
    posY: 0.0,
    posZ: 0.0,
    toolNo: '-',
    partsDone: 0,
    partsTarget: 0,
    cycleTime: 0,
    estCycleTime: 0,
    temp: 28.3,
    alarms: [],
    uptime: 0,
  },
  {
    id: 'CNC-006',
    name: 'CNC-006',
    model: 'SIEMENS 840D',
    machineType: 'hmc',
    status: 'running',
    program: 'O6077_PLATE_E',
    workOrder: 'WO-2026-0319-005',
    item: '플레이트 E형',
    spindleSpeed: 5100,
    spindleLoad: 71,
    feedRate: 1500,
    posX: 88.764,
    posY: -44.123,
    posZ: -33.456,
    toolNo: 'T02',
    partsDone: 23,
    partsTarget: 50,
    cycleTime: 155,
    estCycleTime: 150,
    temp: 43.6,
    alarms: [],
    uptime: 96,
  },
]

const ALARM_HISTORY = [
  { id: 1, machine: 'CNC-003', code: 'ALM-2102', msg: '공구 파손 감지 - T12', time: '09:15:32', level: 'error', status: '미조치' },
  { id: 2, machine: 'CNC-003', code: 'ALM-1056', msg: '주축 과부하 경보', time: '09:15:30', level: 'error', status: '미조치' },
  { id: 3, machine: 'CNC-001', code: 'ALM-0512', msg: '공구 수명 경고 - T08', time: '08:42:11', level: 'warning', status: '조치완료' },
  { id: 4, machine: 'CNC-004', code: 'ALM-0301', msg: '절삭유 레벨 낮음', time: '08:10:05', level: 'warning', status: '조치완료' },
  { id: 5, machine: 'CNC-002', code: 'ALM-0512', msg: '공구 수명 경고 - T03', time: '07:55:44', level: 'warning', status: '조치완료' },
]

const STATUS_CONFIG = {
  running: { color: '#52c41a', bg: '#f6ffed', label: '가동중', dot: 'processing' },
  stopped: { color: '#8c8c8c', bg: '#fafafa', label: '정지',   dot: 'default' },
  alarm:   { color: '#ff4d4f', bg: '#fff2f0', label: '알람',   dot: 'error' },
  standby: { color: '#faad14', bg: '#fffbe6', label: '대기',   dot: 'warning' },
}

function formatTime(seconds) {
  if (!seconds) return '-'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function simulateUpdate(m) {
  if (m.status !== 'running') return m
  return {
    ...m,
    spindleSpeed: Math.max(0, m.spindleSpeed + Math.round((Math.random() - 0.5) * 100)),
    spindleLoad: Math.min(95, Math.max(10, m.spindleLoad + (Math.random() - 0.5) * 4)),
    feedRate: Math.max(0, m.feedRate + Math.round((Math.random() - 0.5) * 40)),
    posX: m.posX + (Math.random() - 0.5) * 1.5,
    posY: m.posY + (Math.random() - 0.5) * 1.5,
    posZ: m.posZ + (Math.random() - 0.5) * 0.3,
  }
}

// ── 컴포넌트 ─────────────────────────────────────────────
export default function CncMonitorPage() {
  const [machines, setMachines] = useState(INITIAL_MACHINES)
  const [selectedId, setSelectedId] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // 3초마다 가데이터 갱신 (실제 연동 시 API 호출로 교체)
  useEffect(() => {
    const timer = setInterval(() => {
      setMachines(prev => prev.map(simulateUpdate))
      setLastRefresh(new Date())
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const summary = {
    total:   machines.length,
    running: machines.filter(m => m.status === 'running').length,
    stopped: machines.filter(m => m.status === 'stopped').length,
    alarm:   machines.filter(m => m.status === 'alarm').length,
    standby: machines.filter(m => m.status === 'standby').length,
  }

  const selectedMachine = selectedId ? machines.find(m => m.id === selectedId) : null

  const alarmColumns = [
    { title: '설비', dataIndex: 'machine', key: 'machine', width: 90 },
    {
      title: '알람코드', dataIndex: 'code', key: 'code', width: 110,
      render: (code, r) => <Tag color={r.level === 'error' ? 'red' : 'orange'}>{code}</Tag>,
    },
    { title: '내용', dataIndex: 'msg', key: 'msg' },
    { title: '발생시간', dataIndex: 'time', key: 'time', width: 90 },
    {
      title: '처리상태', dataIndex: 'status', key: 'status', width: 90,
      render: s => <Tag color={s === '미조치' ? 'red' : 'green'}>{s}</Tag>,
    },
  ]

  return (
    <div>
      {/* 타이틀 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>CNC 모니터링</Title>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ReloadOutlined style={{ marginRight: 4 }} />
          마지막 갱신: {dayjs(lastRefresh).format('HH:mm:ss')}
          <Tag color="orange" style={{ marginLeft: 8 }}>가데이터</Tag>
        </Text>
      </div>

      {/* 요약 카드 */}
      <Row gutter={[10, 10]} style={{ marginBottom: 16 }}>
        {[
          { label: '전체 설비', value: summary.total,   color: '#1677ff' },
          { label: '가동중',   value: summary.running,  color: '#52c41a' },
          { label: '정지',     value: summary.stopped,  color: '#8c8c8c' },
          { label: '알람',     value: summary.alarm,    color: '#ff4d4f' },
          { label: '대기',     value: summary.standby,  color: '#faad14' },
          {
            label: '가동률',
            value: `${Math.round((summary.running / summary.total) * 100)}%`,
            color: '#722ed1',
          },
        ].map(({ label, value, color }) => (
          <Col xs={8} sm={4} key={label}>
            <Card size="small" style={{ textAlign: 'center', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 설비 카드 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {machines.map(m => {
          const cfg      = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.stopped
          const active   = m.status === 'running'
          const isAlarm  = m.status === 'alarm'
          const progressPct = m.partsTarget > 0 ? Math.round((m.partsDone / m.partsTarget) * 100) : 0
          const loadColor   = m.spindleLoad > 80 ? '#ff4d4f' : m.spindleLoad > 60 ? '#faad14' : '#52c41a'

          // 공통 셀 스타일
          const cell = {
            background: '#fff', borderRadius: 4,
            border: '1px solid #f0f0f0',
            padding: '5px 8px',
            height: 46,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }
          const cellCenter = { ...cell, alignItems: 'center' }

          return (
            <Col xs={24} sm={12} xl={8} key={m.id} style={{ display: 'flex' }}>
              <Card
                hoverable
                size="small"
                style={{
                  borderLeft: `5px solid ${cfg.color}`,
                  background: cfg.bg,
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 } }}
                onClick={() => setSelectedId(m.id)}
              >
                {/* ── 헤더 ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{m.model}</span>
                  </div>
                  <Badge
                    status={cfg.dot}
                    text={<span style={{ color: cfg.color, fontWeight: 600, fontSize: 12 }}>{cfg.label}</span>}
                  />
                </div>

                {/* ── 일러스트 + 작업정보 ── */}
                <div style={{ display: 'flex', gap: 6, height: 104 }}>
                  <div style={{
                    width: 104, flexShrink: 0,
                    background: '#1a2535', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 4,
                  }}>
                    <CncMachineIllustration machineType={m.machineType} status={m.status} />
                  </div>
                  <div style={{
                    flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 4,
                    padding: '6px 8px', fontSize: 11,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
                  }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 10 }}>프로그램</div>
                      <div style={{ fontWeight: 600, color: '#333' }}>{m.program || '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#999', fontSize: 10 }}>작업지시</div>
                      <div style={{ fontWeight: 600, color: '#333' }}>{m.workOrder || '-'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#999', fontSize: 10 }}>품목</div>
                      <div style={{ color: '#333' }}>{m.item}</div>
                    </div>
                  </div>
                </div>

                {/* ── 주축속도 / 이송속도 ── */}
                <Row gutter={6}>
                  <Col span={12}>
                    <div style={cell}>
                      <div style={{ fontSize: 10, color: '#999' }}>주축속도 (RPM)</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: active ? '#1677ff' : '#ccc', lineHeight: 1.2 }}>
                        {active ? Math.round(m.spindleSpeed).toLocaleString() : '0'}
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={cell}>
                      <div style={{ fontSize: 10, color: '#999' }}>이송속도 (mm/min)</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: active ? '#1677ff' : '#ccc', lineHeight: 1.2 }}>
                        {active ? Math.round(m.feedRate).toLocaleString() : '0'}
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* ── 주축 부하 ── */}
                <div style={cell}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#999' }}>주축 부하</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: loadColor }}>
                      {active ? Math.round(m.spindleLoad) : 0}%
                    </span>
                  </div>
                  <Progress
                    percent={active ? Math.round(m.spindleLoad) : 0}
                    showInfo={false}
                    size="small"
                    strokeColor={loadColor}
                  />
                </div>

                {/* ── 좌표 ── */}
                <div style={{
                  background: '#001529', color: '#39d353', borderRadius: 4,
                  padding: '6px 10px', fontFamily: 'monospace', fontSize: 13, letterSpacing: 0.5,
                  display: 'flex', flexDirection: 'column', gap: 1,
                }}>
                  {['X', 'Y', 'Z'].map((axis, i) => {
                    const val = [m.posX, m.posY, m.posZ][i]
                    return (
                      <div key={axis} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{axis}:</span>
                        <span>{active ? val.toFixed(3) : '0.000'}</span>
                      </div>
                    )
                  })}
                </div>

                {/* ── 공구 / 생산수량 / 사이클타임 ── */}
                <Row gutter={6}>
                  {[
                    { label: '공구번호',   value: m.toolNo,                                             color: '#333' },
                    { label: '생산수량',   value: `${m.partsDone}${m.partsTarget ? `/${m.partsTarget}` : ''}`, color: '#52c41a' },
                    { label: '사이클타임', value: formatTime(m.cycleTime),                               color: '#333' },
                  ].map(({ label, value, color }) => (
                    <Col span={8} key={label}>
                      <div style={cellCenter}>
                        <div style={{ fontSize: 10, color: '#999' }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* ── 생산 진행률 ── */}
                <div style={cell}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#999' }}>생산 진행률</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1677ff' }}>
                      {m.partsTarget > 0 ? `${progressPct}%` : '-'}
                    </span>
                  </div>
                  <Progress
                    percent={m.partsTarget > 0 ? progressPct : 0}
                    showInfo={false}
                    size="small"
                    strokeColor="#1677ff"
                  />
                </div>

                {/* ── 알람 (항상 렌더, 없으면 빈 영역) ── */}
                <div style={{
                  minHeight: 28, borderRadius: 4, padding: '4px 8px',
                  background: isAlarm && m.alarms.length > 0 ? '#fff2f0' : 'transparent',
                  border: isAlarm && m.alarms.length > 0 ? '1px solid #ffccc7' : '1px solid transparent',
                }}>
                  {isAlarm && m.alarms.map((a, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#ff4d4f' }}>
                      <WarningOutlined style={{ marginRight: 4 }} />{a.code}: {a.msg}
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>

      {/* 알람 이력 */}
      <Card
        title={<span><WarningOutlined style={{ color: '#faad14', marginRight: 6 }} />알람 이력</span>}
        size="small"
      >
        <Table
          dataSource={ALARM_HISTORY}
          columns={alarmColumns}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* 상세 모달 */}
      <Modal
        title={`${selectedMachine?.name} 상세정보`}
        open={!!selectedMachine}
        onCancel={() => setSelectedId(null)}
        footer={null}
        width={480}
      >
        {selectedMachine && (() => {
          const m = selectedMachine
          const cfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.stopped
          const active = m.status === 'running'
          return (
            <div>
              {/* 모달 일러스트 */}
              <div style={{
                background: '#1a2535', borderRadius: 8, padding: 8,
                display: 'flex', justifyContent: 'center', marginBottom: 16,
              }}>
                <div style={{ width: 220 }}>
                  <CncMachineIllustration machineType={m.machineType} status={m.status} />
                </div>
              </div>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <Statistic title="현재 상태" value={cfg.label} valueStyle={{ color: cfg.color }} />
                </Col>
                <Col span={12}>
                  <Statistic title="가동률" value={m.uptime} suffix="%" />
                </Col>
                <Col span={12}>
                  <Statistic title="생산수량" value={`${m.partsDone} / ${m.partsTarget || '-'}`} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="사이클타임 (실제/표준)"
                    value={`${formatTime(m.cycleTime)} / ${formatTime(m.estCycleTime)}`}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="주축속도 (RPM)" value={active ? Math.round(m.spindleSpeed).toLocaleString() : '0'} />
                </Col>
                <Col span={12}>
                  <Statistic title="이송속도 (mm/min)" value={active ? Math.round(m.feedRate).toLocaleString() : '0'} />
                </Col>
                <Col span={12}>
                  <Statistic title="주축 부하" value={active ? Math.round(m.spindleLoad) : 0} suffix="%" />
                </Col>
                <Col span={12}>
                  <Statistic title="온도 (°C)" value={m.temp} precision={1} />
                </Col>
              </Row>

              <Divider />

              <div style={{
                background: '#001529', color: '#39d353', borderRadius: 6,
                padding: '12px 16px', fontFamily: 'monospace', fontSize: 14, letterSpacing: 1,
              }}>
                <div style={{ color: '#666', fontSize: 11, marginBottom: 6 }}>현재 위치 (mm)</div>
                <div>X: <span style={{ float: 'right' }}>{m.posX.toFixed(3)}</span></div>
                <div>Y: <span style={{ float: 'right' }}>{m.posY.toFixed(3)}</span></div>
                <div>Z: <span style={{ float: 'right' }}>{m.posZ.toFixed(3)}</span></div>
              </div>

              {m.alarms.length > 0 && (
                <>
                  <Divider />
                  <div style={{ color: '#ff4d4f', fontWeight: 600, marginBottom: 8 }}>현재 알람</div>
                  {m.alarms.map((a, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#fff2f0', border: '1px solid #ffccc7',
                        borderRadius: 4, padding: '6px 10px', marginBottom: 4,
                      }}
                    >
                      <Tag color="red">{a.code}</Tag>
                      {a.msg}
                      <span style={{ float: 'right', color: '#999', fontSize: 11 }}>{a.time}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
