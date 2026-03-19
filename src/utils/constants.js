export const WORK_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
}

export const WORK_STATUS_LABEL = {
  waiting: '대기',
  in_progress: '진행중',
  completed: '완료',
  on_hold: '보류',
}

export const WORK_STATUS_COLOR = {
  waiting: 'default',
  in_progress: 'processing',
  completed: 'success',
  on_hold: 'warning',
}

export const EQUIP_STATUS = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  STANDBY: 'standby',
  ERROR: 'error',
}

export const EQUIP_STATUS_LABEL = {
  running: '가동',
  stopped: '정지',
  standby: '대기',
  error: '이상',
}

export const EQUIP_STATUS_COLOR = {
  running: 'success',
  stopped: 'default',
  standby: 'warning',
  error: 'error',
}

export const ORDER_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABEL = {
  waiting: '대기',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
}

export const ORDER_STATUS_COLOR = {
  waiting: 'default',
  in_progress: 'processing',
  completed: 'success',
  cancelled: 'error',
}

export const USER_ROLES = {
  ADMIN: 'admin',
  PRODUCTION_MANAGER: 'production_manager',
  WORKER: 'worker',
  QUALITY: 'quality',
  VIEWER: 'viewer',
}

export const USER_ROLE_LABEL = {
  admin: '관리자',
  production_manager: '생산관리자',
  worker: '작업자',
  quality: '품질담당자',
  viewer: '조회전용',
}

export const PO_STATUS_LABEL = {
  waiting: '대기',
  partial: '부분입고',
  completed: '완료',
  cancelled: '취소',
}

export const PO_STATUS_COLOR = {
  waiting: 'default',
  partial: 'processing',
  completed: 'success',
  cancelled: 'error',
}
