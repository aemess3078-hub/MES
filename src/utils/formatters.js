import dayjs from 'dayjs'

export const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

export const formatDateTime = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-'
  return Number(num).toLocaleString()
}

export const formatPercent = (value, total) => {
  if (!total || total === 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
