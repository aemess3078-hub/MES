-- ============================================================
-- MES 전체 테이블 스키마 (완전 재생성용)
-- ⚠️ 기존 테이블 전체 삭제 후 재생성
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 기존 테이블 전체 삭제 (의존성 순서대로)
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.downtimes CASCADE;
DROP TABLE IF EXISTS public.defects CASCADE;
DROP TABLE IF EXISTS public.production_results CASCADE;
DROP TABLE IF EXISTS public.work_order_processes CASCADE;
DROP TABLE IF EXISTS public.work_orders CASCADE;
DROP TABLE IF EXISTS public.production_orders CASCADE;
DROP TABLE IF EXISTS public.inventory_lots CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.goods_receipts CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.equip_check_logs CASCADE;
DROP TABLE IF EXISTS public.equip_check_items CASCADE;
DROP TABLE IF EXISTS public.equipments CASCADE;
DROP TABLE IF EXISTS public.bom CASCADE;
DROP TABLE IF EXISTS public.process_routing_details CASCADE;
DROP TABLE IF EXISTS public.process_routings CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.processes CASCADE;
DROP TABLE IF EXISTS public.business_partners CASCADE;
DROP TABLE IF EXISTS public.common_codes CASCADE;

-- ============================================================
-- 테이블 생성
-- ============================================================

-- 1. 공통코드
CREATE TABLE public.common_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code text NOT NULL,
  group_name text,
  code text NOT NULL,
  code_name text NOT NULL,
  sort_no integer DEFAULT 0,
  sort_seq integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_code, code)
);

-- 2. 거래처
CREATE TABLE public.business_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_code text UNIQUE NOT NULL,
  partner_name text NOT NULL,
  partner_type text,
  contact_name text,
  contact_phone text,
  contact_email text,
  phone text,
  address text,
  note text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 공정
CREATE TABLE public.processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_code text UNIQUE NOT NULL,
  process_name text NOT NULL,
  process_seq integer DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. 공정 라우팅
CREATE TABLE public.process_routings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_code text UNIQUE NOT NULL,
  routing_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. 품목
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  item_name text NOT NULL,
  item_type text,
  spec text,
  unit text DEFAULT 'EA',
  routing_id uuid REFERENCES public.process_routings(id) ON DELETE SET NULL,
  work_standard_url text,
  work_standard_name text,
  work_standard_path text,
  note text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. 공정 라우팅 상세
CREATE TABLE public.process_routing_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routing_id uuid REFERENCES public.process_routings(id) ON DELETE CASCADE,
  process_id uuid REFERENCES public.processes(id),
  step_no integer NOT NULL,
  cycle_time numeric,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 7. BOM
CREATE TABLE public.bom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  child_item_id uuid REFERENCES public.items(id),
  qty numeric DEFAULT 1,
  quantity numeric DEFAULT 1,
  seq integer DEFAULT 1,
  unit text DEFAULT 'EA',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. 설비
CREATE TABLE public.equipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equip_code text UNIQUE NOT NULL,
  equip_name text NOT NULL,
  equip_type text,
  process_id uuid REFERENCES public.processes(id),
  status text DEFAULT 'normal',
  reason_code text,
  photo_url text,
  install_date date,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. 설비 점검 항목
CREATE TABLE public.equip_check_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES public.equipments(id) ON DELETE CASCADE,
  check_name text NOT NULL,
  cycle text NOT NULL,
  sort_no integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 10. 설비 점검 실적
CREATE TABLE public.equip_check_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES public.equipments(id),
  check_item_id uuid REFERENCES public.equip_check_items(id),
  cycle text,
  check_date date NOT NULL,
  result text,
  note text,
  checked_by text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(check_item_id, check_date)
);

-- 11. 사용자
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role text DEFAULT 'user',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 12. 구매발주
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_no text UNIQUE NOT NULL,
  partner_id uuid REFERENCES public.business_partners(id),
  item_id uuid REFERENCES public.items(id),
  order_qty numeric NOT NULL DEFAULT 0,
  received_qty numeric DEFAULT 0,
  unit_price numeric DEFAULT 0,
  order_date date,
  due_date date,
  status text DEFAULT 'ordered',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 13. 입고
CREATE TABLE public.goods_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no text UNIQUE NOT NULL,
  po_id uuid REFERENCES public.purchase_orders(id),
  item_id uuid REFERENCES public.items(id),
  qty numeric NOT NULL DEFAULT 0,
  lot_no text,
  receipt_date date DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 14. 재고
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid UNIQUE REFERENCES public.items(id),
  qty numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 15. 재고 LOT
CREATE TABLE public.inventory_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES public.items(id),
  receipt_id uuid REFERENCES public.goods_receipts(id),
  lot_no text,
  qty numeric DEFAULT 0,
  receipt_date date,
  created_at timestamptz DEFAULT now()
);

-- 16. 생산지시
CREATE TABLE public.production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no text UNIQUE NOT NULL,
  item_id uuid REFERENCES public.items(id),
  partner_id uuid REFERENCES public.business_partners(id),
  order_qty numeric NOT NULL DEFAULT 0,
  produced_qty numeric DEFAULT 0,
  due_date date,
  status text DEFAULT 'planned',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 17. 작업지시
CREATE TABLE public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_no text UNIQUE NOT NULL,
  production_order_id uuid REFERENCES public.production_orders(id),
  item_id uuid REFERENCES public.items(id),
  process_id uuid REFERENCES public.processes(id),
  plan_qty numeric NOT NULL DEFAULT 0,
  produced_qty numeric DEFAULT 0,
  plan_date date,
  status text DEFAULT 'planned',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 18. 작업지시 공정단계
CREATE TABLE public.work_order_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE,
  process_id uuid REFERENCES public.processes(id),
  step_no integer NOT NULL,
  status text DEFAULT 'waiting',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 19. 생산실적
CREATE TABLE public.production_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES public.work_orders(id),
  process_id uuid REFERENCES public.processes(id),
  worker_name text,
  good_qty numeric DEFAULT 0,
  defect_qty numeric DEFAULT 0,
  start_time timestamptz,
  end_time timestamptz,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 20. 불량
CREATE TABLE public.defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES public.work_orders(id),
  process_id uuid REFERENCES public.processes(id),
  defect_type_code text,
  defect_qty numeric DEFAULT 0,
  occurred_at timestamptz DEFAULT now(),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 21. 비가동
CREATE TABLE public.downtimes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES public.work_orders(id),
  equipment_id uuid REFERENCES public.equipments(id),
  downtime_type_code text,
  start_time timestamptz,
  end_time timestamptz,
  duration_min integer,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 22. 출하
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_no text UNIQUE NOT NULL,
  production_order_id uuid REFERENCES public.production_orders(id),
  item_id uuid REFERENCES public.items(id),
  partner_id uuid REFERENCES public.business_partners(id),
  qty numeric NOT NULL DEFAULT 0,
  shipment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'completed',
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- RLS 설정 (로그인한 사용자 전체 허용)
-- ============================================================
ALTER TABLE public.common_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_routings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_routing_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equip_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equip_check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_authenticated" ON public.common_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.business_partners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.processes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.process_routings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.process_routing_details FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.bom FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.equipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.equip_check_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.equip_check_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.users FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.purchase_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.goods_receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.inventory_lots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.production_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.work_order_processes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.production_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.defects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.downtimes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_authenticated" ON public.shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
