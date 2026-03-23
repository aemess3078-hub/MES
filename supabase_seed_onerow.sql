INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DEFECT_TYPE', '불량유형', 'D001', '치수불량', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DEFECT_TYPE', '불량유형', 'D002', '외관불량', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DEFECT_TYPE', '불량유형', 'D003', '기능불량', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DEFECT_TYPE', '불량유형', 'D004', '재료불량', 4, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DEFECT_TYPE', '불량유형', 'D005', '용접불량', 5, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DOWNTIME_TYPE', '비가동유형', 'DT001', '설비고장', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DOWNTIME_TYPE', '비가동유형', 'DT002', '자재부족', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DOWNTIME_TYPE', '비가동유형', 'DT003', '계획정지', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DOWNTIME_TYPE', '비가동유형', 'DT004', '품질검사', 4, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('DOWNTIME_TYPE', '비가동유형', 'DT005', '작업준비', 5, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('WO_STATUS', '작업지시상태', 'planned', '계획', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('WO_STATUS', '작업지시상태', 'in_progress', '작업중', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('WO_STATUS', '작업지시상태', 'completed', '완료', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('WO_STATUS', '작업지시상태', 'cancelled', '취소', 4, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PO_STATUS', '생산지시상태', 'planned', '계획', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PO_STATUS', '생산지시상태', 'in_progress', '진행중', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PO_STATUS', '생산지시상태', 'completed', '완료', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PO_STATUS', '생산지시상태', 'cancelled', '취소', 4, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PARTNER_TYPE', '거래처구분', 'customer', '고객사', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PARTNER_TYPE', '거래처구분', 'supplier', '공급사', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('PARTNER_TYPE', '거래처구분', 'both', '고객/공급', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('EQUIP_STATUS', '설비상태', 'normal', '정상', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('EQUIP_STATUS', '설비상태', 'error', '고장', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.common_codes (group_code, group_name, code, code_name, sort_seq, is_active) VALUES
('EQUIP_STATUS', '설비상태', 'stopped', '정지', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'C001', '현대자동차', 'customer', '김민준', '02-1234-5678', 'mjkim@hyundai.com', '서울시 서초구 헌릉로 12', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000002', 'C002', 'LG전자', 'customer', '이서연', '02-2345-6789', 'sylee@lg.com', '서울시 영등포구 여의대로 128', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000003', 'C003', '삼성전자', 'customer', '박지훈', '031-200-1234', 'jhpark@samsung.com', '경기도 수원시 영통구 삼성로 129', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000004', 'S001', '포스코', 'supplier', '최수아', '054-220-0114', 'sacho@posco.com', '경북 포항시 남구 동해안로 6261', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000005', 'S002', '한화케미칼', 'supplier', '정도윤', '02-729-2000', 'dyjung@hanwha.com', '서울시 중구 청계천로 86', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.business_partners (id, partner_code, partner_name, partner_type, contact_name, phone, contact_email, address, is_active) VALUES
('a1000000-0000-0000-0000-000000000006', 'S003', '코오롱인더스트리', 'supplier', '윤하은', '031-500-3000', 'heyoon@kolon.com', '경기도 과천시 코오롱로 11', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'P001', '원자재투입', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000002', 'P002', '절단가공', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000003', 'P003', '프레스성형', 3, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000004', 'P004', '용접', 4, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000005', 'P005', '표면처리', 5, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000006', 'P006', '조립', 6, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000007', 'P007', '검사', 7, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.processes (id, process_code, process_name, process_seq, is_active) VALUES
('b1000000-0000-0000-0000-000000000008', 'P008', '포장', 8, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routings (id, routing_code, routing_name, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'RT001', '표준라우팅-A형', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routings (id, routing_code, routing_name, is_active) VALUES
('c1000000-0000-0000-0000-000000000002', 'RT002', '표준라우팅-B형', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routings (id, routing_code, routing_name, is_active) VALUES
('c1000000-0000-0000-0000-000000000003', 'RT003', '조립라우팅', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 1, 10)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 2, 15)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 3, 20)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 4, 12)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 5, 8)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 6, 5)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1, 5)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 2, 10)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 3, 15)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007', 4, 8)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 5, 5)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 1, 5)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 2, 25)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', 3, 10)
ON CONFLICT DO NOTHING;
INSERT INTO public.process_routing_details (routing_id, process_id, step_no, cycle_time) VALUES
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008', 4, 5)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000001', 'FG-001', '자동차 도어패널 A', 'finished', 'AL6061 T6, 1200x800x3mm', 'EA', 'c1000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000002', 'FG-002', '자동차 도어패널 B', 'finished', 'AL6061 T6, 1100x750x3mm', 'EA', 'c1000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000003', 'FG-003', '엔진 브라켓 조립체', 'finished', 'SS400, 300x200x5mm', 'EA', 'c1000000-0000-0000-0000-000000000003', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000004', 'FG-004', '전장 하우징', 'finished', 'SUS304, 200x150x100mm', 'EA', 'c1000000-0000-0000-0000-000000000002', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000005', 'SF-001', '도어패널 프레임', 'semi', 'AL6061, 1200x800mm', 'EA', 'c1000000-0000-0000-0000-000000000002', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000006', 'SF-002', '브라켓 용접체', 'semi', 'SS400 용접', 'EA', 'c1000000-0000-0000-0000-000000000002', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000007', 'RM-001', '알루미늄 판재 AL6061', 'raw', 'T6, 2000x1000x5mm', 'KG', null, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000008', 'RM-002', '냉연강판 SS400', 'raw', '1.6t, 1000x2000mm', 'KG', null, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000009', 'RM-003', '스테인리스 SUS304', 'raw', '2t, 1000x2000mm', 'KG', null, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000010', 'RM-004', '볼트 M8x20', 'raw', 'SUS, M8x20mm', 'EA', null, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.items (id, item_code, item_name, item_type, spec, unit, routing_id, is_active) VALUES
('d1000000-0000-0000-0000-000000000011', 'RM-005', '용접봉 E6013', 'raw', '3.2mm x 350mm', 'KG', null, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 1, 1, 'EA')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000007', 3, 2, 'KG')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000010', 8, 3, 'EA')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000005', 1, 1, 'EA')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000007', 2.5, 2, 'KG')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 2, 1, 'EA')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000008', 5, 2, 'KG')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000011', 0.5, 3, 'KG')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000009', 4, 1, 'KG')
ON CONFLICT DO NOTHING;
INSERT INTO public.bom (parent_item_id, child_item_id, quantity, seq, unit) VALUES
('d1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000010', 12, 2, 'EA')
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', 'EQ-001', 'CNC 레이저 절단기 #1', 'CNC', 'b1000000-0000-0000-0000-000000000002', 'normal', '2022-03-15', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000002', 'EQ-002', 'CNC 레이저 절단기 #2', 'CNC', 'b1000000-0000-0000-0000-000000000002', 'normal', '2022-06-20', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000003', 'EQ-003', '유압 프레스 #1', '프레스', 'b1000000-0000-0000-0000-000000000003', 'normal', '2021-11-10', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000004', 'EQ-004', '유압 프레스 #2', '프레스', 'b1000000-0000-0000-0000-000000000003', 'error', '2021-11-10', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000005', 'EQ-005', 'CO2 용접기 #1', '용접', 'b1000000-0000-0000-0000-000000000004', 'normal', '2023-01-05', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000006', 'EQ-006', 'CO2 용접기 #2', '용접', 'b1000000-0000-0000-0000-000000000004', 'normal', '2023-01-05', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000007', 'EQ-007', '쇼트블라스트', '표면처리', 'b1000000-0000-0000-0000-000000000005', 'normal', '2020-08-20', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equipments (id, equip_code, equip_name, equip_type, process_id, status, install_date, is_active) VALUES
('e1000000-0000-0000-0000-000000000008', 'EQ-008', '조립 라인 #1', '조립', 'b1000000-0000-0000-0000-000000000006', 'normal', '2023-05-15', true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', '레이저 출력 확인', 'daily', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', '냉각수 수위 점검', 'daily', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000001', '렌즈 청소 상태', 'weekly', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000003', '유압 오일 압력', 'daily', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000003', '안전장치 작동', 'daily', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000003', '오일 교체 여부', 'monthly', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000005', '와이어 공급 상태', 'daily', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.equip_check_items (equipment_id, check_name, cycle, sort_no, is_active) VALUES
('e1000000-0000-0000-0000-000000000005', '전류/전압 설정', 'daily', 2, true)
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000001', 'PO-20260306-001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000007', 500, 500, 8500, '2026-03-06', '2026-03-10', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000002', 'PO-20260306-002', 'a1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000008', 300, 300, 3200, '2026-03-06', '2026-03-11', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000003', 'PO-20260307-001', 'a1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000010', 2000, 2000, 120, '2026-03-07', '2026-03-12', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000004', 'PO-20260310-001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000009', 200, 200, 15000, '2026-03-10', '2026-03-14', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000005', 'PO-20260312-001', 'a1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000011', 100, 60, 12000, '2026-03-12', '2026-03-17', 'partial')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000006', 'PO-20260314-001', 'a1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000007', 400, 0, 8500, '2026-03-14', '2026-03-19', 'ordered')
ON CONFLICT DO NOTHING;
INSERT INTO public.purchase_orders (id, po_no, partner_id, item_id, order_qty, received_qty, unit_price, order_date, due_date, status) VALUES
('f1000000-0000-0000-0000-000000000007', 'PO-20260317-001', 'a1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000010', 3000, 0, 120, '2026-03-17', '2026-03-21', 'ordered')
ON CONFLICT DO NOTHING;
INSERT INTO public.goods_receipts (receipt_no, po_id, item_id, qty, lot_no, receipt_date) VALUES
('GR-20260309-001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000007', 500, 'LOT-260309-001', '2026-03-09')
ON CONFLICT DO NOTHING;
INSERT INTO public.goods_receipts (receipt_no, po_id, item_id, qty, lot_no, receipt_date) VALUES
('GR-20260310-001', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000008', 300, 'LOT-260310-001', '2026-03-10')
ON CONFLICT DO NOTHING;
INSERT INTO public.goods_receipts (receipt_no, po_id, item_id, qty, lot_no, receipt_date) VALUES
('GR-20260311-001', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000010', 2000, 'LOT-260311-001', '2026-03-11')
ON CONFLICT DO NOTHING;
INSERT INTO public.goods_receipts (receipt_no, po_id, item_id, qty, lot_no, receipt_date) VALUES
('GR-20260313-001', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000009', 200, 'LOT-260313-001', '2026-03-13')
ON CONFLICT DO NOTHING;
INSERT INTO public.goods_receipts (receipt_no, po_id, item_id, qty, lot_no, receipt_date) VALUES
('GR-20260316-001', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000011', 60, 'LOT-260316-001', '2026-03-16')
ON CONFLICT DO NOTHING;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000001', 85,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000002', 62,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000003', 43,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000004', 118, '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000005', 30,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000006', 25,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000007', 320, '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000008', 180, '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000009', 150, '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000010', 1650,'2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.inventory (item_id, qty, updated_at) VALUES
('d1000000-0000-0000-0000-000000000011', 45,  '2026-03-19 09:00:00')
ON CONFLICT (item_id) DO UPDATE SET qty = EXCLUDED.qty, updated_at = EXCLUDED.updated_at;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000001', 'PO-20260306-001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 100, 100, '2026-03-12', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000002', 'PO-20260306-002', 'd1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 150, 150, '2026-03-13', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000003', 'PO-20260307-001', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 80,  80,  '2026-03-14', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000004', 'PO-20260310-001', 'd1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 60,  35,  '2026-03-20', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000005', 'PO-20260311-001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 120, 45,  '2026-03-21', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000006', 'PO-20260312-001', 'd1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 200, 80,  '2026-03-22', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000007', 'PO-20260317-001', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 90,  0,   '2026-03-25', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000008', 'PO-20260318-001', 'd1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 50,  0,   '2026-03-26', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_orders (id, order_no, item_id, partner_id, order_qty, produced_qty, due_date, status) VALUES
('a2000000-0000-0000-0000-000000000009', 'PO-20260319-001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 75,  0,   '2026-03-28', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000001', 'WO-20260306-001', 'a2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 50, 50, '2026-03-06', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000002', 'WO-20260306-002', 'a2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 50, 50, '2026-03-07', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000003', 'WO-20260307-001', 'a2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 80, 80, '2026-03-07', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000004', 'WO-20260308-001', 'a2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 70, 70, '2026-03-08', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000005', 'WO-20260309-001', 'a2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 80, 80, '2026-03-09', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000006', 'WO-20260310-001', 'a2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 100, 100, '2026-03-10', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000007', 'WO-20260311-001', 'a2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000005', 150, 150, '2026-03-11', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000008', 'WO-20260312-001', 'a2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 80, 80, '2026-03-12', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000009', 'WO-20260314-001', 'a2000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 30, 30, '2026-03-14', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000010', 'WO-20260315-001', 'a2000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 30, 20, '2026-03-15', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000011', 'WO-20260316-001', 'a2000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 60, 45, '2026-03-16', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000012', 'WO-20260317-001', 'a2000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 100, 80, '2026-03-17', 'in_progress')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000013', 'WO-20260318-001', 'a2000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 60, 0,  '2026-03-18', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000014', 'WO-20260319-001', 'a2000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 100, 0, '2026-03-19', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.work_orders (id, work_order_no, production_order_id, item_id, process_id, plan_qty, produced_qty, plan_date, status) VALUES
('a3000000-0000-0000-0000-000000000015', 'WO-20260319-002', 'a2000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006', 30, 0, '2026-03-19', 'planned')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', '김철수', 48, 2, '2026-03-06 08:00:00', '2026-03-06 12:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', '이영희', 50, 0, '2026-03-07 08:00:00', '2026-03-07 11:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', '박민수', 79, 1, '2026-03-07 13:00:00', '2026-03-07 17:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', '김철수', 68, 2, '2026-03-08 08:00:00', '2026-03-08 13:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', '이영희', 78, 2, '2026-03-09 08:00:00', '2026-03-09 12:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', '정용준', 97, 3, '2026-03-10 08:00:00', '2026-03-10 17:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', '박민수', 148, 2, '2026-03-11 08:00:00', '2026-03-11 16:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', '김철수', 77, 3, '2026-03-12 08:00:00', '2026-03-12 15:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000002', '이영희', 29, 1, '2026-03-14 08:00:00', '2026-03-14 12:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', '정용준', 20, 0, '2026-03-15 08:00:00', '2026-03-15 14:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000002', '박민수', 43, 2, '2026-03-16 08:00:00', '2026-03-16 15:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.production_results (work_order_id, process_id, worker_name, good_qty, defect_qty, start_time, end_time) VALUES
('a3000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000002', '김철수', 78, 2, '2026-03-17 08:00:00', '2026-03-17 16:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'D001', 2, '2026-03-06 10:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'D002', 1, '2026-03-07 15:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'D001', 1, '2026-03-08 09:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'D003', 1, '2026-03-08 11:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'D002', 2, '2026-03-09 10:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'D005', 2, '2026-03-10 11:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'D001', 1, '2026-03-10 14:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', 'D002', 2, '2026-03-11 10:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'D001', 2, '2026-03-12 09:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000003', 'D004', 1, '2026-03-12 13:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000002', 'D002', 1, '2026-03-14 11:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000002', 'D001', 1, '2026-03-16 10:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000002', 'D003', 1, '2026-03-16 14:00:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.defects (work_order_id, process_id, defect_type_code, defect_qty, occurred_at) VALUES
('a3000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000002', 'D002', 2, '2026-03-17 09:30:00')
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'DT005', '2026-03-06 07:30:00', '2026-03-06 08:00:00', 30)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'DT001', '2026-03-07 14:00:00', '2026-03-07 14:45:00', 45)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000005', 'DT004', '2026-03-10 10:00:00', '2026-03-10 10:30:00', 30)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000007', 'DT003', '2026-03-11 12:00:00', '2026-03-11 13:00:00', 60)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000003', 'DT001', '2026-03-12 10:00:00', '2026-03-12 11:30:00', 90)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000004', 'DT001', '2026-03-15 09:00:00', '2026-03-15 11:00:00', 120)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000001', 'DT002', '2026-03-16 11:00:00', '2026-03-16 11:30:00', 30)
ON CONFLICT DO NOTHING;
INSERT INTO public.downtimes (work_order_id, equipment_id, downtime_type_code, start_time, end_time, duration_min) VALUES
('a3000000-0000-0000-0000-000000000012', 'e1000000-0000-0000-0000-000000000005', 'DT005', '2026-03-17 07:30:00', '2026-03-17 08:00:00', 30)
ON CONFLICT DO NOTHING;
INSERT INTO public.shipments (shipment_no, production_order_id, item_id, partner_id, qty, shipment_date, status) VALUES
('SH-20260311-001', 'a2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 100, '2026-03-11', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.shipments (shipment_no, production_order_id, item_id, partner_id, qty, shipment_date, status) VALUES
('SH-20260313-001', 'a2000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 150, '2026-03-13', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.shipments (shipment_no, production_order_id, item_id, partner_id, qty, shipment_date, status) VALUES
('SH-20260314-001', 'a2000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 80,  '2026-03-14', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.shipments (shipment_no, production_order_id, item_id, partner_id, qty, shipment_date, status) VALUES
('SH-20260318-001', 'a2000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 35,  '2026-03-18', 'completed')
ON CONFLICT DO NOTHING;
INSERT INTO public.shipments (shipment_no, production_order_id, item_id, partner_id, qty, shipment_date, status) VALUES
('SH-20260319-001', 'a2000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 45,  '2026-03-19', 'completed')
ON CONFLICT DO NOTHING;