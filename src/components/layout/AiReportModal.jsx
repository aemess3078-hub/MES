import { useState, useRef } from 'react'
import { Modal, Button, Spin, Space, Divider, Typography, Tag, Select, message } from 'antd'
import {
  FileTextOutlined,
  PrinterOutlined,
  FilePdfOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const { Title, Text, Paragraph } = Typography

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'

// 리포트 생성 프롬프트
const REPORT_SYSTEM_PROMPT = `당신은 MES(제조실행시스템) 데이터 분석 전문가입니다.
AI 어시스턴트와 사용자 간의 대화 내역을 분석하여 전문적인 MES 운영 리포트를 작성합니다.

리포트 작성 규칙:
1. 대화에서 언급된 데이터와 수치를 정확히 인용
2. 논리적인 구조로 내용 정리 (현황 → 분석 → 시사점 순)
3. 중요 수치와 상태는 강조
4. 한국어로 작성
5. 전문적이고 간결하게

리포트 형식 (마크다운):
# [리포트 제목]

## 1. 개요
- 작성일시, 분석 범위, 데이터 기준

## 2. 주요 현황
(대화에서 언급된 데이터 기반으로 섹션 구성)

## 3. 분석 및 시사점
- 주요 발견사항
- 개선 필요 사항

## 4. 결론
- 요약 및 권고사항`

// 리포트 토픽 옵션
const TOPIC_OPTIONS = [
  { value: 'all', label: '전체 대화 내용' },
  { value: '생산지시', label: '생산지시 현황' },
  { value: '작업지시', label: '작업지시 현황' },
  { value: '재고', label: '재고 현황' },
  { value: '설비', label: '설비 현황' },
  { value: '불량', label: '불량 현황' },
  { value: '출하', label: '출하 현황' },
  { value: '구매', label: '구매/발주 현황' },
]

async function generateReport(messages, topic) {
  // 대화 내역 필터링
  const conversationText = messages
    .filter(m => !m.streaming && m.content)
    .map(m => `[${m.role === 'user' ? '사용자' : 'AI'}]: ${m.content}`)
    .join('\n\n')

  const topicInstruction = topic === 'all'
    ? '전체 대화 내용을 종합하여 MES 운영 리포트를 작성하세요.'
    : `대화 내용 중 "${topic}" 관련 내용만 추출하여 리포트를 작성하세요. 해당 내용이 없으면 "해당 주제에 대한 대화 내용이 없습니다"라고 알려주세요.`

  const userPrompt = `다음은 MES AI 어시스턴트와의 대화 내역입니다:

---
${conversationText}
---

${topicInstruction}
현재 날짜/시간: ${new Date().toLocaleString('ko-KR')}
`

  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REPORT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    }),
  })

  if (!res.ok) throw new Error(`API 오류: ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || '리포트 생성 실패'
}

// 마크다운 → HTML 변환 (간단 구현)
function markdownToHtml(md) {
  return md
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .replace(/\n/g, '<br/>')
}

// 리포트 렌더링 컴포넌트
function ReportContent({ content, reportRef }) {
  const now = new Date().toLocaleString('ko-KR')

  const lines = content.split('\n')

  const renderLine = (line, i) => {
    if (line.startsWith('# ')) return (
      <h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: '#1677ff', borderBottom: '2px solid #1677ff', paddingBottom: 8, marginBottom: 12, marginTop: 0 }}>
        {line.slice(2)}
      </h1>
    )
    if (line.startsWith('## ')) return (
      <h2 key={i} style={{ fontSize: 15, fontWeight: 700, color: '#0958d9', borderLeft: '3px solid #1677ff', paddingLeft: 10, marginTop: 18, marginBottom: 8 }}>
        {line.slice(3)}
      </h2>
    )
    if (line.startsWith('### ')) return (
      <h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: '#333', marginTop: 12, marginBottom: 6 }}>
        {line.slice(4)}
      </h3>
    )
    if (line.startsWith('- ')) {
      const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'flex-start' }}>
          <span style={{ color: '#1677ff', flexShrink: 0, marginTop: 2 }}>•</span>
          <span style={{ fontSize: 12, lineHeight: 1.7, color: '#333' }} dangerouslySetInnerHTML={{ __html: text }} />
        </div>
      )
    }
    if (line.startsWith('**') && line.endsWith('**')) return (
      <p key={i} style={{ fontWeight: 700, fontSize: 12, color: '#222', marginBottom: 4 }}>{line.slice(2, -2)}</p>
    )
    if (line === '') return <div key={i} style={{ height: 6 }} />
    // 인라인 볼드 처리
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ fontSize: 12, lineHeight: 1.7, color: '#444', marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <div
      ref={reportRef}
      style={{
        background: '#fff',
        padding: '32px 36px',
        fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
        minHeight: 400,
      }}
    >
      {/* 리포트 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: 8,
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>MES 운영 분석 리포트</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>AI Agent 대화 기반 리포트</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, opacity: 0.85 }}>
          <div>작성: MES AI Agent</div>
          <div>{now}</div>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ lineHeight: 1.8 }}>
        {lines.map((line, i) => renderLine(line, i))}
      </div>

      {/* 푸터 */}
      <div style={{
        marginTop: 32,
        paddingTop: 12,
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#aaa',
      }}>
        <span>본 리포트는 MES AI Agent가 대화 내역을 분석하여 자동 생성되었습니다.</span>
        <span>{now}</span>
      </div>
    </div>
  )
}

export default function AiReportModal({ open, onClose, messages }) {
  const [topic, setTopic] = useState('all')
  const [loading, setLoading] = useState(false)
  const [reportContent, setReportContent] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const reportRef = useRef(null)

  const handleGenerate = async () => {
    if (messages.filter(m => m.role !== 'assistant' || m.content !== messages[0]?.content).length < 2) {
      message.warning('대화 내역이 부족합니다. AI Agent와 먼저 대화해주세요.')
      return
    }
    setLoading(true)
    setReportContent('')
    try {
      const content = await generateReport(messages, topic)
      setReportContent(content)
    } catch (e) {
      message.error('리포트 생성 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (!reportContent) return
    const printWindow = window.open('', '_blank')
    const now = new Date().toLocaleString('ko-KR')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>MES AI 리포트 - ${now}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: "Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif; padding: 32px; color: #222; }
          h1 { font-size: 20px; color: #1677ff; border-bottom: 2px solid #1677ff; padding-bottom: 8px; margin-bottom: 16px; }
          h2 { font-size: 15px; color: #0958d9; border-left: 3px solid #1677ff; padding-left: 10px; margin: 18px 0 8px; }
          h3 { font-size: 13px; color: #333; margin: 12px 0 6px; }
          p { font-size: 12px; line-height: 1.8; margin-bottom: 4px; }
          ul { padding-left: 20px; margin-bottom: 8px; }
          li { font-size: 12px; line-height: 1.8; }
          .header { background: #1677ff; color: white; padding: 16px 24px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; }
          .header-title { font-size: 16px; font-weight: bold; }
          .header-sub { font-size: 11px; opacity: 0.8; }
          .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #aaa; display: flex; justify-content: space-between; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div><div class="header-sub">MES 운영 분석 리포트</div><div class="header-title">AI Agent 대화 기반 리포트</div></div>
          <div style="text-align:right;font-size:11px;opacity:0.85"><div>작성: MES AI Agent</div><div>${now}</div></div>
        </div>
        ${reportContent
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/\n/g, '<br/>')
        }
        <div class="footer">
          <span>본 리포트는 MES AI Agent가 대화 내역을 분석하여 자동 생성되었습니다.</span>
          <span>${now}</span>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const handlePdf = async () => {
    if (!reportRef.current || !reportContent) return
    setPdfLoading(true)
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const now = new Date()
      const fileName = `MES_리포트_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.pdf`
      pdf.save(fileName)
      message.success(`PDF 저장 완료: ${fileName}`)
    } catch (e) {
      message.error('PDF 생성 실패: ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleClose = () => {
    setReportContent('')
    setTopic('all')
    onClose()
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ color: '#1677ff' }} />
          <span>AI 대화 내역 리포트 생성</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={780}
      footer={null}
      styles={{ body: { padding: '16px 24px 24px' } }}
    >
      {/* 옵션 영역 */}
      <div style={{
        background: '#f8faff',
        border: '1px solid #d0e4ff',
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <Text style={{ fontSize: 13, fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>
          📋 리포트 범위:
        </Text>
        <Select
          value={topic}
          onChange={setTopic}
          style={{ width: 200 }}
          options={TOPIC_OPTIONS}
          size="middle"
        />
        <Button
          type="primary"
          icon={loading ? <LoadingOutlined /> : <FileTextOutlined />}
          onClick={handleGenerate}
          loading={loading}
          disabled={loading}
          style={{ marginLeft: 'auto' }}
        >
          {loading ? 'AI 분석 중...' : '리포트 생성'}
        </Button>
      </div>

      {/* 대화 건수 표시 */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#666' }}>분석 대상:</Text>
        <Tag color="blue">{messages.filter(m => m.role === 'user').length}개 질문</Tag>
        <Tag color="green">{messages.filter(m => m.role === 'assistant' && m.content).length}개 답변</Tag>
        {topic !== 'all' && <Tag color="orange">"{topic}" 관련 내용만 추출</Tag>}
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          background: '#f5f7fa', borderRadius: 8,
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666', fontSize: 13 }}>
            AI가 대화 내역을 분석하여 리포트를 작성 중입니다...
          </div>
          <div style={{ marginTop: 6, color: '#999', fontSize: 12 }}>
            잠시만 기다려주세요 (약 10~20초 소요)
          </div>
        </div>
      )}

      {/* 리포트 내용 */}
      {reportContent && !loading && (
        <>
          {/* 액션 버튼 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 13, color: '#52c41a', fontWeight: 600 }}>
                리포트 생성 완료
              </Text>
            </div>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                size="middle"
              >
                인쇄
              </Button>
              <Button
                type="primary"
                icon={pdfLoading ? <LoadingOutlined /> : <FilePdfOutlined />}
                onClick={handlePdf}
                loading={pdfLoading}
                size="middle"
                style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }}
              >
                PDF 저장
              </Button>
            </Space>
          </div>

          {/* 리포트 미리보기 */}
          <div style={{
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            overflow: 'auto',
            maxHeight: 480,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <ReportContent content={reportContent} reportRef={reportRef} />
          </div>
        </>
      )}

      {/* 초기 안내 */}
      {!reportContent && !loading && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: '#f5f7fa', borderRadius: 8,
          border: '1px dashed #d9d9d9',
        }}>
          <FileTextOutlined style={{ fontSize: 36, color: '#bbb', marginBottom: 12 }} />
          <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
            AI가 대화 내역을 분석하여 MES 운영 리포트를 자동 작성합니다
          </div>
          <div style={{ color: '#999', fontSize: 12 }}>
            리포트 범위 선택 후 "리포트 생성" 버튼을 클릭하세요
          </div>
          <Divider style={{ margin: '16px 0 12px' }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['전체 대화 요약', '작업지시 분석', '재고 현황 정리', '불량 현황 분석'].map(ex => (
              <Tag key={ex} color="blue" style={{ cursor: 'default', padding: '3px 10px' }}>{ex}</Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
