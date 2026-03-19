import { Badge, Tag } from 'antd'
import {
  WORK_STATUS_LABEL, WORK_STATUS_COLOR,
  EQUIP_STATUS_LABEL, EQUIP_STATUS_COLOR,
  ORDER_STATUS_LABEL, ORDER_STATUS_COLOR,
} from '../../utils/constants'

export function WorkStatusTag({ status }) {
  return (
    <Tag color={WORK_STATUS_COLOR[status] === 'default' ? undefined : WORK_STATUS_COLOR[status]}>
      {WORK_STATUS_LABEL[status] ?? status}
    </Tag>
  )
}

export function EquipStatusBadge({ status }) {
  const statusMap = {
    running: 'processing',
    stopped: 'default',
    standby: 'warning',
    error: 'error',
  }
  return (
    <Badge status={statusMap[status] ?? 'default'} text={EQUIP_STATUS_LABEL[status] ?? status} />
  )
}

export function OrderStatusTag({ status }) {
  return (
    <Tag color={ORDER_STATUS_COLOR[status] === 'default' ? undefined : ORDER_STATUS_COLOR[status]}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </Tag>
  )
}
