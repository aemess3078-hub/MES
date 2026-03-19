import { QRCodeSVG } from 'qrcode.react'
import { Divider } from 'antd'

const labelStyle = {
  width: 320,
  padding: '20px 24px',
  border: '2px solid #333',
  fontFamily: 'Arial, sans-serif',
  background: '#fff',
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  fontSize: 13,
  borderBottom: '1px solid #eee',
}

const labelCol = { color: '#666', minWidth: 80, fontWeight: 600 }
const valueCol = { fontWeight: 700, fontSize: 14, textAlign: 'right' }

export default function ReceiptLabel({ receipt }) {
  if (!receipt) return null

  const qrValue = [
    receipt.receipt_no,
    receipt.lot_no ?? '',
    receipt.items?.item_name ?? '',
    receipt.qty,
    receipt.receipt_date,
  ].join('|')

  return (
    <div style={labelStyle} id="receipt-label">
      <div style={{ textAlign: 'center', marginBottom: 12, fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
        입고 식별표
      </div>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <QRCodeSVG value={qrValue} size={130} />
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div style={rowStyle}>
        <span style={labelCol}>입고일</span>
        <span style={valueCol}>{receipt.receipt_date ?? '-'}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelCol}>발주번호</span>
        <span style={valueCol}>{receipt.purchase_orders?.po_no ?? '-'}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelCol}>LOT번호</span>
        <span style={{ ...valueCol, color: '#1677ff', fontSize: 15 }}>{receipt.lot_no ?? '-'}</span>
      </div>
      <div style={rowStyle}>
        <span style={labelCol}>품명</span>
        <span style={valueCol}>{receipt.items?.item_name ?? '-'}</span>
      </div>
      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <span style={labelCol}>수량</span>
        <span style={{ ...valueCol, fontSize: 18, color: '#1677ff' }}>
          {Number(receipt.qty).toLocaleString()} {receipt.items?.unit ?? ''}
        </span>
      </div>
    </div>
  )
}
