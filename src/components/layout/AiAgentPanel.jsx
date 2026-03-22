import { useState, useRef, useEffect } from 'react'
import { Button, Input, Typography, Spin, Tooltip } from 'antd'
import {
  RobotOutlined,
  CloseOutlined,
  SendOutlined,
  ClearOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import AiReportModal from './AiReportModal'

const { Text } = Typography
const { TextArea } = Input

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'

const SYSTEM_PROMPT = `당신은 MES(제조실행시스템) 전용 AI 어시스턴트입니다.

담당 업무:
- 생산지시, 작업지시, 생산실적 관련 질의응답
- 재고현황, 입고/출하 데이터 분석
- 설비현황, 불량현황, 비가동 데이터 분석
- 구매발주, 거래처 관련 정보 조회
- 품목, BOM, 공정 라우팅 관련 안내
- 대시보드 KPI 해석 및 개선 제안
- MES 시스템 사용 방법 안내

중요 지침:
- 사용자가 제공한 실시간 DB 데이터를 최우선으로 활용하여 답변합니다
- 품목명, 작업지시번호, 생산오더번호 등 구체적인 데이터가 언급되면 DB 데이터에서 찾아 상세히 답변합니다
- DB에 해당 데이터가 없으면 "현재 DB에 해당 데이터가 없습니다"라고 안내합니다
- MES/제조/생산/재고/설비/품질/구매와 관련된 모든 질문에 적극적으로 답변합니다
- 오직 날씨, 스포츠, 연예, 정치 등 제조업과 전혀 관계없는 주제만 거절합니다
- 거절 시: "저는 MES 전용 AI입니다. 제조/생산 관련 질문을 해주세요."

현재 시스템 구성:
- 22개 테이블 (생산지시, 작업지시, 재고, 설비, 품질, 구매 등)
- 실시간 Supabase 데이터베이스 연동

답변 스타일:
- 한국어로 답변
- 간결하고 실용적으로
- 데이터가 있으면 수치와 함께 구체적으로 답변
- 마크다운 형식 사용 가능`

// 사용자 질의에서 검색 키워드 추출
function extractKeywords(userQuery) {
  // 숫자+영문 코드 패턴 (ex: WO-2026-001, PO-2026-001, FG-001)
  const codePattern = /[A-Z]{1,4}-\d{4}-\d{3,}|[A-Z]{2,4}-\d{3,}/gi
  const codes = userQuery.match(codePattern) || []

  // 한글 단어 (2글자 이상)
  const korPattern = /[가-힣]{2,}/g
  const korWords = userQuery.match(korPattern) || []

  return { codes, korWords }
}

// MES DB 데이터 조회 (사용자 쿼리 기반 동적 검색 강화)
async function fetchMesContext(userQuery = '') {
  try {
    const { codes, korWords } = extractKeywords(userQuery)
    const allKeywords = [...codes, ...korWords]

    // 기본 공통 쿼리 (항상 조회)
    const baseQueries = Promise.all([
      supabase.from('equipments')
        .select('equip_code, equip_name, status, equip_type').limit(20),
      supabase.from('items')
        .select('item_code, item_name, item_type, spec, unit').limit(100),
      supabase.from('inventory')
        .select('qty, items(item_code, item_name, item_type)').limit(50),
    ])

    // 최근 데이터 쿼리 (최근 30건씩)
    const recentQueries = Promise.all([
      supabase.from('production_orders')
        .select('order_no, status, order_qty, produced_qty, due_date, items(item_code, item_name), business_partners(partner_name)')
        .order('created_at', { ascending: false }).limit(30),
      supabase.from('work_orders')
        .select('work_order_no, status, plan_qty, produced_qty, plan_date, due_date, items(item_code, item_name), processes(process_name)')
        .order('created_at', { ascending: false }).limit(30),
      supabase.from('defects')
        .select('defect_type_code, defect_qty, occurred_at, work_orders(work_order_no, items(item_name))')
        .order('occurred_at', { ascending: false }).limit(15),
      supabase.from('shipments')
        .select('shipment_no, qty, shipment_date, status, items(item_name), business_partners(partner_name)')
        .order('shipment_date', { ascending: false }).limit(15),
      supabase.from('purchase_orders')
        .select('po_no, status, order_qty, received_qty, items(item_name), business_partners(partner_name)')
        .order('created_at', { ascending: false }).limit(15),
    ])

    // 키워드 기반 추가 검색 (품목명 or 오더번호 언급 시)
    let keywordResults = []
    if (allKeywords.length > 0) {
      const keywordQueries = []

      // 품목명 검색 (한글 키워드)
      for (const kw of korWords.slice(0, 3)) {
        keywordQueries.push(
          supabase.from('items')
            .select('item_code, item_name, item_type, spec, unit')
            .ilike('item_name', `%${kw}%`)
            .limit(20)
        )
        // 품목명으로 생산지시 검색
        keywordQueries.push(
          supabase.from('production_orders')
            .select('order_no, status, order_qty, produced_qty, due_date, created_at, items!inner(item_code, item_name), business_partners(partner_name)')
            .ilike('items.item_name', `%${kw}%`)
            .order('created_at', { ascending: false })
            .limit(10)
        )
        // 품목명으로 작업지시 검색
        keywordQueries.push(
          supabase.from('work_orders')
            .select('work_order_no, status, plan_qty, produced_qty, plan_date, due_date, items!inner(item_code, item_name), processes(process_name)')
            .ilike('items.item_name', `%${kw}%`)
            .order('created_at', { ascending: false })
            .limit(10)
        )
      }

      // 오더번호 직접 검색
      for (const code of codes.slice(0, 3)) {
        if (code.toUpperCase().startsWith('WO')) {
          keywordQueries.push(
            supabase.from('work_orders')
              .select('work_order_no, status, plan_qty, produced_qty, plan_date, due_date, items(item_code, item_name), processes(process_name)')
              .ilike('work_order_no', `%${code}%`)
              .limit(5)
          )
        } else if (code.toUpperCase().startsWith('PO') || code.toUpperCase().startsWith('ORD')) {
          keywordQueries.push(
            supabase.from('production_orders')
              .select('order_no, status, order_qty, produced_qty, due_date, items(item_code, item_name), business_partners(partner_name)')
              .ilike('order_no', `%${code}%`)
              .limit(5)
          )
        }
      }

      if (keywordQueries.length > 0) {
        const kwResults = await Promise.all(keywordQueries)
        keywordResults = kwResults.map(r => r.data).filter(Boolean).flat()
      }
    }

    const [
      [{ data: equipments }, { data: items }, { data: inventory }],
      [{ data: production_orders }, { data: work_orders }, { data: defects }, { data: shipments }, { data: purchase_orders }],
    ] = await Promise.all([baseQueries, recentQueries])

    // 키워드 검색 결과를 별도 섹션으로 정리
    const kwItemMatches = keywordResults.filter(r => r?.item_code !== undefined && !r?.order_no && !r?.work_order_no)
    const kwProdOrderMatches = keywordResults.filter(r => r?.order_no !== undefined)
    const kwWorkOrderMatches = keywordResults.filter(r => r?.work_order_no !== undefined)

    let contextStr = `
=== 현재 MES 실시간 데이터 (조회시각: ${new Date().toLocaleString('ko-KR')}) ===
`

    // 키워드 검색 결과가 있으면 최상단에 표시
    if (allKeywords.length > 0 && (kwItemMatches.length > 0 || kwProdOrderMatches.length > 0 || kwWorkOrderMatches.length > 0)) {
      contextStr += `
[🔍 검색어 "${allKeywords.join(', ')}" 관련 결과]
`
      if (kwItemMatches.length > 0) {
        const unique = kwItemMatches.filter((v, i, a) => a.findIndex(t => t.item_code === v.item_code) === i)
        contextStr += `품목 검색결과:\n${unique.map(i => `- [${i.item_type}] ${i.item_code} ${i.item_name} (단위:${i.unit}${i.spec ? ', 규격:'+i.spec : ''})`).join('\n')}\n`
      }
      if (kwProdOrderMatches.length > 0) {
        const unique = kwProdOrderMatches.filter((v, i, a) => a.findIndex(t => t.order_no === v.order_no) === i)
        contextStr += `생산지시 검색결과:\n${unique.map(o => `- ${o.order_no}: 품목=${o.items?.item_name}(${o.items?.item_code}), 거래처=${o.business_partners?.partner_name ?? '-'}, 상태=${o.status}, 수량=${o.produced_qty ?? 0}/${o.order_qty}EA, 납기=${o.due_date ?? '-'}`).join('\n')}\n`
      }
      if (kwWorkOrderMatches.length > 0) {
        const unique = kwWorkOrderMatches.filter((v, i, a) => a.findIndex(t => t.work_order_no === v.work_order_no) === i)
        contextStr += `작업지시 검색결과:\n${unique.map(o => `- ${o.work_order_no}: 품목=${o.items?.item_name}(${o.items?.item_code}), 공정=${o.processes?.process_name ?? '-'}, 상태=${o.status}, 수량=${o.produced_qty ?? 0}/${o.plan_qty}EA, 계획일=${o.plan_date ?? '-'}`).join('\n')}\n`
      }
    }

    contextStr += `
[품목 전체 목록 (${items?.length ?? 0}건)]
${items?.map(i => `- [${i.item_type}] ${i.item_code} ${i.item_name} (단위:${i.unit}${i.spec ? ', 규격:'+i.spec : ''})`).join('\n') || '데이터 없음'}

[생산지시 현황 (최근 30건)]
${production_orders?.map(o => `- ${o.order_no}: 품목=${o.items?.item_name}(${o.items?.item_code}), 거래처=${o.business_partners?.partner_name ?? '-'}, 상태=${o.status}, 수량=${o.produced_qty ?? 0}/${o.order_qty}EA, 납기=${o.due_date ?? '-'}`).join('\n') || '데이터 없음'}

[작업지시 현황 (최근 30건)]
${work_orders?.map(o => `- ${o.work_order_no}: 품목=${o.items?.item_name}(${o.items?.item_code}), 공정=${o.processes?.process_name ?? '-'}, 상태=${o.status}, 수량=${o.produced_qty ?? 0}/${o.plan_qty}EA, 계획일=${o.plan_date ?? '-'}, 납기=${o.due_date ?? '-'}`).join('\n') || '데이터 없음'}

[재고현황 (${inventory?.length ?? 0}건)]
${inventory?.map(i => `- [${i.items?.item_type}] ${i.items?.item_code} ${i.items?.item_name}: ${i.qty}`).join('\n') || '데이터 없음'}

[설비현황 (${equipments?.length ?? 0}건)]
${equipments?.map(e => `- ${e.equip_code} ${e.equip_name}(${e.equip_type}): ${e.status}`).join('\n') || '데이터 없음'}

[최근 불량 (15건)]
${defects?.map(d => `- 품목=${d.work_orders?.items?.item_name ?? '-'}, 작업지시=${d.work_orders?.work_order_no ?? '-'}, 유형=${d.defect_type_code}, 수량=${d.defect_qty}EA (${d.occurred_at?.slice(0,10)})`).join('\n') || '데이터 없음'}

[최근 출하 (15건)]
${shipments?.map(s => `- ${s.shipment_no}: 품목=${s.items?.item_name ?? '-'}, 거래처=${s.business_partners?.partner_name ?? '-'}, ${s.qty}EA ${s.status} (${s.shipment_date})`).join('\n') || '데이터 없음'}

[구매발주 현황 (15건)]
${purchase_orders?.map(p => `- ${p.po_no}: 품목=${p.items?.item_name ?? '-'}, 거래처=${p.business_partners?.partner_name ?? '-'}, 상태=${p.status}, 입고=${p.received_qty ?? 0}/${p.order_qty}`).join('\n') || '데이터 없음'}
`
    return contextStr
  } catch (e) {
    return `데이터 조회 실패: ${e.message}`
  }
}

async function callOpenAI(messages) {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1500,
      temperature: 0.3,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API 오류: ${res.status} ${err}`)
  }
  return res
}

export default function AiAgentPanel({ open, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! MES 전용 AI 어시스턴트입니다 🤖\n\n생산현황, 재고, 설비, 품질, 구매 등 MES 관련 질문을 해주세요.\n\n방금 등록한 데이터도 즉시 조회 가능합니다!',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  // 자연어로 리포트 요청 감지
  const isReportRequest = (text) => {
    const keywords = ['리포트', '보고서', '정리해', '요약해줘', '리포트 작성', '보고서 작성', '출력해줘', '정리하여']
    return keywords.some(k => text.includes(k))
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    // 리포트 요청 감지 → 모달 자동 오픈
    if (isReportRequest(text)) {
      setInput('')
      const userMsg = { role: 'user', content: text }
      setMessages(prev => [...prev, userMsg, {
        role: 'assistant',
        content: '📋 리포트 생성 창을 열었습니다! 범위를 선택하고 "리포트 생성" 버튼을 눌러주세요.',
        streaming: false,
      }])
      setReportModalOpen(true)
      return
    }

    setInput('')
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // AI 응답 placeholder
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      // 사용자 질의를 넘겨서 키워드 기반 DB 검색 수행
      const mesContext = await fetchMesContext(text)
      const systemWithContext = SYSTEM_PROMPT + '\n\n' + mesContext

      const apiMessages = [
        { role: 'system', content: systemWithContext },
        ...messages.filter(m => !m.streaming).map(m => ({ role: m.role, content: m.content })),
        userMsg,
      ]

      const res = await callOpenAI(apiMessages)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content || ''
            fullContent += delta
            setMessages(prev =>
              prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: fullContent } : m
              )
            )
          } catch { /* ignore parse errors */ }
        }
      }

      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { role: 'assistant', content: fullContent, streaming: false } : m
        )
      )
    } catch (err) {
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: 'assistant', content: `오류가 발생했습니다: ${err.message}`, streaming: false }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([{
      role: 'assistant',
      content: '대화가 초기화되었습니다. MES 관련 질문을 해주세요 🤖',
    }])
  }

  const handleOpenReport = () => {
    setReportModalOpen(true)
  }

  const renderContent = (content) => {
    if (!content) return null
    // 간단한 마크다운 렌더링
    const lines = content.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <div key={i} style={{ fontWeight: 700, fontSize: 13, marginTop: 6 }}>{line.slice(4)}</div>
      if (line.startsWith('## ')) return <div key={i} style={{ fontWeight: 700, fontSize: 14, marginTop: 8 }}>{line.slice(3)}</div>
      if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 600 }}>{line.slice(2, -2)}</div>
      if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: 12 }}>• {line.slice(2)}</div>
      if (line === '') return <div key={i} style={{ height: 6 }} />
      return <div key={i}>{line}</div>
    })
  }

  return (
    <>
      {/* 오버레이 (모바일용) */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.2)',
            zIndex: 998,
            display: 'none',
          }}
        />
      )}

      {/* AI Agent 패널 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: open ? 0 : -380,
          width: 360,
          height: '100vh',
          background: '#fff',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RobotOutlined style={{ color: '#fff', fontSize: 20 }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>MES AI Agent</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>실시간 DB 연동 · 즉시 검색</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Tooltip title="리포트 생성">
              <Button
                type="text"
                icon={<FileTextOutlined />}
                onClick={handleOpenReport}
                style={{ color: 'rgba(255,255,255,0.8)' }}
                size="small"
              />
            </Tooltip>
            <Tooltip title="대화 초기화">
              <Button
                type="text"
                icon={<ClearOutlined />}
                onClick={handleClear}
                style={{ color: 'rgba(255,255,255,0.8)' }}
                size="small"
              />
            </Tooltip>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              style={{ color: 'rgba(255,255,255,0.8)' }}
              size="small"
            />
          </div>
        </div>

        {/* 메시지 영역 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#f5f7fa',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1677ff, #0958d9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginRight: 8, marginTop: 2,
                  }}
                >
                  <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
                </div>
              )}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '10px 13px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #1677ff, #0958d9)'
                    : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1a1a1a',
                  fontSize: 13,
                  lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {msg.role === 'user' ? msg.content : renderContent(msg.content)}
                {msg.streaming && (
                  <span style={{ display: 'inline-block', width: 6, height: 14, background: '#1677ff', marginLeft: 2, animation: 'blink 1s infinite', verticalAlign: 'middle' }} />
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.content === '' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1677ff, #0958d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RobotOutlined style={{ color: '#fff', fontSize: 14 }} />
              </div>
              <div style={{ padding: '10px 14px', background: '#fff', borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <Spin size="small" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 추천 질문 */}
        {messages.length <= 1 && (
          <div style={{ padding: '8px 12px', background: '#f5f7fa', borderTop: '1px solid #f0f0f0' }}>
            <Text style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 6 }}>💡 추천 질문</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                '오늘 작업중인 작업지시 알려줘',
                '현재 재고현황 요약해줘',
                '이번 주 불량 현황은?',
                '고장난 설비 있어?',
                '대화 내용 리포트 작성해줘',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 12,
                    border: '1px solid #d0e4ff',
                    background: '#e8f3ff',
                    color: '#1677ff',
                    fontSize: 11,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div
          style={{
            padding: '10px 12px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <TextArea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="MES 관련 질문을 입력하세요... (Enter 전송)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={loading}
              style={{ flex: 1, borderRadius: 12, resize: 'none', fontSize: 13 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{ borderRadius: 12, height: 36, width: 36, padding: 0, flexShrink: 0 }}
            />
          </div>
          <Text style={{ fontSize: 10, color: '#bbb', display: 'block', marginTop: 4, textAlign: 'center' }}>
            MES 전용 AI · 실시간 DB 연동 · 즉시 반영
          </Text>
        </div>
      </div>

      {/* 리포트 모달 */}
      <AiReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        messages={messages}
      />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  )
}
