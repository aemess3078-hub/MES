/**
 * CNC 설비 SVG 일러스트 컴포넌트
 * machineType: 'vmc' | '5axis' | 'hmc' | 'turning'
 * status: 'running' | 'stopped' | 'alarm' | 'standby'
 */

// ── 공통 헬퍼 ─────────────────────────────────────────────
function statusLight(status) {
  if (status === 'running') return '#52c41a'
  if (status === 'alarm')   return '#ff4d4f'
  if (status === 'standby') return '#faad14'
  return '#555'
}

function ScreenText({ running, alarm }) {
  if (alarm)   return <tspan fill="#ff4d4f">ALARM</tspan>
  if (running) return <tspan fill="#39d353">AUTO</tspan>
  return <tspan fill="#888">STOP</tspan>
}

// ── VMC (수직 머시닝 센터) — FANUC 0i-MF / FANUC 30i-B ───
function VMC({ status }) {
  const running = status === 'running'
  const alarm   = status === 'alarm'
  const sc      = statusLight(status)

  return (
    <svg viewBox="0 0 200 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="vmc-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3e5068" />
          <stop offset="100%" stopColor="#5a6e84" />
        </linearGradient>
        <linearGradient id="vmc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(120,180,240,0.18)" />
          <stop offset="100%" stopColor="rgba(80,140,200,0.06)" />
        </linearGradient>
      </defs>

      {/* ── 받침대 ── */}
      <rect x="8"  y="144" width="152" height="12" rx="3" fill="#2a3a4a" />
      <rect x="14" y="138" width="140" height="10" rx="2" fill="#364656" />

      {/* ── 본체 프레임 ── */}
      <rect x="14" y="18"  width="140" height="124" rx="4" fill="url(#vmc-body)" stroke="#2a3a4a" strokeWidth="1" />

      {/* ── 컬럼 (좌측 후면) ── */}
      <rect x="17" y="21" width="30" height="118" rx="2" fill="#2e3e50" />
      <rect x="19" y="23" width="26" height="114" rx="2" fill="#3a4e62" />

      {/* ── Z축 빔 (상단 수평) ── */}
      <rect x="44" y="21" width="106" height="20" rx="2" fill="#2e3e50" />
      <rect x="46" y="23" width="102" height="16" rx="2" fill="#4a5e72" />

      {/* ── 주축 헤드 ── */}
      <rect x="80" y="41" width="36" height="34" rx="3" fill="#2e3e50" />
      <rect x="82" y="43" width="32" height="30" rx="2" fill="#3a4e62" />

      {/* ── 주축 샤프트 ── */}
      <rect x="93" y="71" width="12" height="26" rx="3" fill="#1e2e3e" />

      {/* ── 주축 회전 표시 ── */}
      {running ? (
        <g>
          <animateTransform attributeName="transform" attributeType="XML"
            type="rotate" from="0 99 84" to="360 99 84"
            dur="0.35s" repeatCount="indefinite" />
          <line x1="99" y1="78" x2="99" y2="90" stroke="#7aabcb" strokeWidth="2" strokeLinecap="round" />
          <line x1="93" y1="84" x2="105" y2="84" stroke="#7aabcb" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : (
        <>
          <line x1="99" y1="78" x2="99" y2="90" stroke="#3a4e62" strokeWidth="2" strokeLinecap="round" />
          <line x1="93" y1="84" x2="105" y2="84" stroke="#3a4e62" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      {/* ── 공구 팁 ── */}
      <polygon points="93,97 105,97 99,108" fill="#1e2e3e" />

      {/* ── 절삭유 ── */}
      {running && (
        <g>
          <line x1="96" y1="104" x2="89" y2="118" stroke="#2a8fd9" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.7s" repeatCount="indefinite" />
          </line>
          <line x1="99" y1="106" x2="99" y2="122" stroke="#2a8fd9" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="0.5s" repeatCount="indefinite" />
          </line>
          <line x1="102" y1="104" x2="109" y2="118" stroke="#2a8fd9" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="0.9s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* ── 테이블 ── */}
      <rect x="46" y="122" width="106" height="14" rx="2" fill="#3a4e62" />
      <rect x="50" y="124" width="98" height="10" rx="1" fill="#4a5e72" />
      {[63, 80, 97, 114, 131].map(x => (
        <rect key={x} x={x} y="123" width="2.5" height="12" fill="#2e3e50" />
      ))}

      {/* ── 공작물 (가동중/정지 상태에 따라) ── */}
      {(running || status === 'stopped') && (
        <rect x="82" y="114" width="34" height="9" rx="1" fill="#7a8a6a" opacity="0.9" />
      )}

      {/* ── 유리문 ── */}
      <rect x="46" y="41"  width="34" height="82" rx="2" fill="url(#vmc-glass)" stroke="#5a7a9a" strokeWidth="0.8" />
      <rect x="82" y="41"  width="68" height="82" rx="2" fill="url(#vmc-glass)" stroke="#5a7a9a" strokeWidth="0.8" />
      <rect x="78" y="70"  width="5"  height="22" rx="2" fill="#6a8aaa" opacity="0.7" />

      {/* ── ATC 공구 매거진 ── */}
      <circle cx="140" cy="32" r="13" fill="none" stroke="#2e3e50" strokeWidth="5" />
      <circle cx="140" cy="32" r="6"  fill="#2e3e50" />
      <circle cx="140" cy="32" r="3"  fill="#1e2e3e" />
      {[0,45,90,135,180,225,270,315].map(deg => {
        const r = (deg * Math.PI) / 180
        return <circle key={deg} cx={140 + 10 * Math.sin(r)} cy={32 - 10 * Math.cos(r)} r="2" fill="#1e2e3e" />
      })}

      {/* ── 컨트롤 패널 ── */}
      <rect x="156" y="18" width="30" height="138" rx="3" fill="#111d2c" />
      <rect x="158" y="20" width="26" height="134" rx="2" fill="#162030" />

      {/* 화면 */}
      <rect x="159" y="23" width="22" height="30" rx="2" fill="#050f1a" />
      <text x="170" y="31" textAnchor="middle" fill="#39d353" fontSize="4" fontFamily="monospace">FANUC</text>
      <text x="170" y="38" textAnchor="middle" fontSize="3.5" fontFamily="monospace">
        <ScreenText running={running} alarm={alarm} />
      </text>
      <text x="170" y="45" textAnchor="middle" fill="#1a6bbf" fontSize="3" fontFamily="monospace">
        {running ? 'S:3500' : '------'}
      </text>

      {/* 버튼들 */}
      <circle cx="164" cy="61" r="3" fill={running ? '#52c41a' : '#333'} />
      <circle cx="172" cy="61" r="3" fill="#e74c3c" />
      <circle cx="180" cy="61" r="3" fill="#f39c12" />
      <circle cx="170" cy="71" r="6" fill="#c0392b" stroke="#e74c3c" strokeWidth="1" />
      <text x="170" y="73.5" textAnchor="middle" fill="white" fontSize="5" fontFamily="sans-serif">E</text>
      <circle cx="170" cy="85" r="8" fill="#162030" stroke="#2c3e50" strokeWidth="1" />
      <circle cx="170" cy="85" r="5" fill="#1e2d3e" />
      <line x1="170" y1="85" x2="170" y2="80" stroke="#7f8c8d" strokeWidth="1.5" strokeLinecap="round" />
      {[96,102,108,114,120].map(y => (
        <rect key={y} x="160" y={y} width="20" height="3" rx="1" fill="#1e2d3e" />
      ))}

      {/* ── 상태등 ── */}
      <rect x="20" y="10" width="14" height="10" rx="2" fill="#1e2e3e" />
      <circle cx="27" cy="15" r="4" fill={sc}>
        {running && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        {alarm   && <animate attributeName="opacity" values="1;0;1"   dur="0.4s" repeatCount="indefinite" />}
      </circle>

      {/* ── 칩 컨베이어 ── */}
      <rect x="8" y="150" width="152" height="4" rx="1" fill="#1e2e3e" />
      {running && (
        <rect width="35" height="2" rx="1" y="151" fill="#5a4535" opacity="0.7">
          <animate attributeName="x" values="8;155;8" dur="2.5s" repeatCount="indefinite" />
        </rect>
      )}
    </svg>
  )
}

// ── 5-Axis (MAZAK VARIAXIS) ────────────────────────────────
function FiveAxis({ status }) {
  const running = status === 'running'
  const alarm   = status === 'alarm'
  const sc      = statusLight(status)

  return (
    <svg viewBox="0 0 200 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="fa-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3a5040" />
          <stop offset="100%" stopColor="#50704a" />
        </linearGradient>
        <linearGradient id="fa-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(100,220,140,0.15)" />
          <stop offset="100%" stopColor="rgba(60,180,100,0.04)" />
        </linearGradient>
      </defs>

      {/* 받침대 */}
      <rect x="8"  y="144" width="152" height="12" rx="3" fill="#2a3a2a" />
      <rect x="14" y="138" width="140" height="10" rx="2" fill="#364836" />

      {/* 본체 */}
      <rect x="14" y="18" width="140" height="124" rx="4" fill="url(#fa-body)" stroke="#2a3a2a" strokeWidth="1" />

      {/* 더블 컬럼 (양쪽) */}
      <rect x="17" y="21" width="25" height="118" rx="2" fill="#2a3a2a" />
      <rect x="19" y="23" width="21" height="114" rx="2" fill="#384838" />
      <rect x="120" y="21" width="25" height="118" rx="2" fill="#2a3a2a" />
      <rect x="122" y="23" width="21" height="114" rx="2" fill="#384838" />

      {/* 크로스 레일 */}
      <rect x="40" y="25" width="82" height="18" rx="2" fill="#2a3a2a" />
      <rect x="42" y="27" width="78" height="14" rx="2" fill="#405040" />

      {/* 5축 주축 헤드 (기울어진 형태) */}
      <g transform="rotate(-15, 81, 60)">
        <rect x="68" y="43" width="30" height="30" rx="3" fill="#2a3a2a" />
        <rect x="70" y="45" width="26" height="26" rx="2" fill="#384838" />
      </g>
      {/* 주축 샤프트 (5축이라 약간 기울어짐) */}
      <rect x="76" y="70" width="10" height="24" rx="3" fill="#1a2a1a" transform="rotate(-10, 81, 82)" />
      <polygon points="73,91 84,88 84,100 73,103" fill="#1a2a1a" />

      {/* 주축 회전 */}
      {running ? (
        <g transform="rotate(-10, 81, 82)">
          <animateTransform attributeName="transform" attributeType="XML"
            type="rotate" from="0 81 82" to="360 81 82"
            dur="0.3s" repeatCount="indefinite" />
          <line x1="81" y1="76" x2="81" y2="88" stroke="#7acba0" strokeWidth="2" strokeLinecap="round" />
          <line x1="75" y1="82" x2="87" y2="82" stroke="#7acba0" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : null}

      {/* 트러니언 테이블 (5축 특징) */}
      <ellipse cx="98" cy="120" rx="28" ry="8" fill="#2a3a2a" stroke="#405040" strokeWidth="1.5" />
      <ellipse cx="98" cy="118" rx="24" ry="6" fill="#405040" />
      <ellipse cx="98" cy="117" rx="18" ry="4" fill="#4a5a4a" />
      {/* 회전축 지지대 */}
      <rect x="65" y="112" width="8" height="16" rx="2" fill="#2a3a2a" />
      <rect x="123" y="112" width="8" height="16" rx="2" fill="#2a3a2a" />
      {/* 회전 표시 */}
      {running && (
        <path d="M 75 118 A 23 6 0 0 1 121 118" stroke="#7acba0" strokeWidth="1.5" fill="none" strokeDasharray="4,3">
          <animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite" />
        </path>
      )}

      {/* 팔레트/공작물 */}
      <rect x="82" y="110" width="32" height="8" rx="1" fill="#6a8a5a" opacity="0.9" />

      {/* 절삭유 */}
      {running && (
        <g>
          <line x1="79" y1="100" x2="74" y2="113" stroke="#2ab060" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.6s" repeatCount="indefinite" />
          </line>
          <line x1="82" y1="102" x2="82" y2="116" stroke="#2ab060" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
          </line>
        </g>
      )}

      {/* 유리문 */}
      <rect x="42" y="43" width="78" height="68" rx="2" fill="url(#fa-glass)" stroke="#5a8a6a" strokeWidth="0.8" />
      <rect x="78" y="65" width="4" height="24" rx="2" fill="#6a9a7a" opacity="0.7" />

      {/* ATC */}
      <circle cx="130" cy="35" r="11" fill="none" stroke="#2a3a2a" strokeWidth="5" />
      <circle cx="130" cy="35" r="5"  fill="#2a3a2a" />
      {[0,60,120,180,240,300].map(deg => {
        const r = (deg * Math.PI) / 180
        return <circle key={deg} cx={130 + 8 * Math.sin(r)} cy={35 - 8 * Math.cos(r)} r="2" fill="#1a2a1a" />
      })}

      {/* 컨트롤 패널 */}
      <rect x="156" y="18" width="30" height="138" rx="3" fill="#0f1d0f" />
      <rect x="158" y="20" width="26" height="134" rx="2" fill="#142014" />
      <rect x="159" y="23" width="22" height="30" rx="2" fill="#050f05" />
      <text x="170" y="31" textAnchor="middle" fill="#39d353" fontSize="4"   fontFamily="monospace">MAZAK</text>
      <text x="170" y="38" textAnchor="middle" fontSize="3.5" fontFamily="monospace">
        <ScreenText running={running} alarm={alarm} />
      </text>
      <text x="170" y="45" textAnchor="middle" fill="#1ab060" fontSize="3"   fontFamily="monospace">
        {running ? '5-AXIS' : '------'}
      </text>
      <circle cx="164" cy="61" r="3" fill={running ? '#52c41a' : '#333'} />
      <circle cx="172" cy="61" r="3" fill="#e74c3c" />
      <circle cx="180" cy="61" r="3" fill="#f39c12" />
      <circle cx="170" cy="71" r="6" fill="#c0392b" stroke="#e74c3c" strokeWidth="1" />
      <text x="170" y="73.5" textAnchor="middle" fill="white" fontSize="5">E</text>
      <circle cx="170" cy="85" r="8" fill="#142014" stroke="#2c4030" strokeWidth="1" />
      <circle cx="170" cy="85" r="5" fill="#1e301e" />
      <line x1="170" y1="85" x2="170" y2="80" stroke="#7f8c8d" strokeWidth="1.5" strokeLinecap="round" />
      {[96,102,108,114,120].map(y => (
        <rect key={y} x="160" y={y} width="20" height="3" rx="1" fill="#1e301e" />
      ))}

      {/* 상태등 */}
      <rect x="20" y="10" width="14" height="10" rx="2" fill="#1a2a1a" />
      <circle cx="27" cy="15" r="4" fill={sc}>
        {running && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        {alarm   && <animate attributeName="opacity" values="1;0;1"   dur="0.4s" repeatCount="indefinite" />}
      </circle>

      {/* 칩 컨베이어 */}
      <rect x="8" y="150" width="152" height="4" rx="1" fill="#1a2a1a" />
      {running && (
        <rect width="35" height="2" rx="1" y="151" fill="#4a5535" opacity="0.7">
          <animate attributeName="x" values="8;155;8" dur="2s" repeatCount="indefinite" />
        </rect>
      )}
    </svg>
  )
}

// ── HMC (수평 머시닝 센터) — SIEMENS 828D / 840D ──────────
function HMC({ status }) {
  const running = status === 'running'
  const alarm   = status === 'alarm'
  const sc      = statusLight(status)

  return (
    <svg viewBox="0 0 200 160" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="hmc-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3a3a5a" />
          <stop offset="100%" stopColor="#505078" />
        </linearGradient>
        <linearGradient id="hmc-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(140,140,240,0.18)" />
          <stop offset="100%" stopColor="rgba(100,100,200,0.04)" />
        </linearGradient>
      </defs>

      {/* 받침대 */}
      <rect x="8"  y="144" width="152" height="12" rx="3" fill="#22223a" />
      <rect x="14" y="138" width="140" height="10" rx="2" fill="#2e2e4e" />

      {/* 본체 */}
      <rect x="14" y="18" width="140" height="124" rx="4" fill="url(#hmc-body)" stroke="#22223a" strokeWidth="1" />

      {/* 메인 컬럼 (센터) */}
      <rect x="55" y="21" width="40" height="118" rx="2" fill="#22223a" />
      <rect x="57" y="23" width="36" height="114" rx="2" fill="#2e2e4e" />

      {/* 수평 주축 헤드 */}
      <rect x="90" y="55" width="35" height="35" rx="3" fill="#22223a" />
      <rect x="92" y="57" width="31" height="31" rx="2" fill="#2e2e4e" />

      {/* 수평 주축 (수평으로 돌출) */}
      <rect x="120" y="66" width="30" height="12" rx="3" fill="#1a1a2a" />

      {/* 공구 팁 */}
      <polygon points="150,66 158,72 150,78" fill="#1a1a2a" />

      {/* 주축 회전 */}
      {running ? (
        <g>
          <animateTransform attributeName="transform" attributeType="XML"
            type="rotate" from="0 135 72" to="360 135 72"
            dur="0.35s" repeatCount="indefinite" />
          <line x1="135" y1="66" x2="135" y2="78" stroke="#9a9acb" strokeWidth="2" strokeLinecap="round" />
          <line x1="129" y1="72" x2="141" y2="72" stroke="#9a9acb" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : null}

      {/* 절삭유 */}
      {running && (
        <g>
          <line x1="153" y1="70" x2="162" y2="80" stroke="#5a5add" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="0.7s" repeatCount="indefinite" />
          </line>
          <line x1="155" y1="72" x2="163" y2="85" stroke="#5a5add" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.5s" repeatPoint="indefinite" />
          </line>
        </g>
      )}

      {/* 팔레트 테이블 (수직) */}
      <rect x="15" y="52" width="40" height="80" rx="2" fill="#2e2e4e" />
      <rect x="17" y="54" width="36" height="76" rx="2" fill="#3e3e5e" />
      {/* T-슬롯 */}
      {[65, 78, 91, 105, 118].map(y => (
        <rect key={y} x="16" y={y} width="38" height="2.5" fill="#22223a" />
      ))}
      {/* 팔레트 핀 */}
      <circle cx="35" cy="92" r="6" fill="#2e2e3e" stroke="#4e4e6e" strokeWidth="1" />
      <circle cx="35" cy="92" r="3" fill="#1a1a2a" />

      {/* 공작물 */}
      {(running || status === 'stopped') && (
        <rect x="25" y="75" width="20" height="34" rx="2" fill="#6a6a8a" opacity="0.9" />
      )}

      {/* 팔레트 체인저 (좌측) */}
      <rect x="8" y="90" width="8" height="20" rx="1" fill="#22223a" />
      <circle cx="12" cy="85" r="5" fill="none" stroke="#22223a" strokeWidth="3" />

      {/* 유리문 */}
      <rect x="93" y="41" width="58" height="100" rx="2" fill="url(#hmc-glass)" stroke="#6a6aaa" strokeWidth="0.8" />

      {/* ATC */}
      <circle cx="68" cy="32" r="12" fill="none" stroke="#22223a" strokeWidth="5" />
      <circle cx="68" cy="32" r="6"  fill="#22223a" />
      <circle cx="68" cy="32" r="3"  fill="#1a1a2a" />
      {[0,45,90,135,180,225,270,315].map(deg => {
        const r = (deg * Math.PI) / 180
        return <circle key={deg} cx={68 + 9 * Math.sin(r)} cy={32 - 9 * Math.cos(r)} r="1.8" fill="#1a1a2a" />
      })}

      {/* 컨트롤 패널 */}
      <rect x="156" y="18" width="30" height="138" rx="3" fill="#0f0f1f" />
      <rect x="158" y="20" width="26" height="134" rx="2" fill="#141428" />
      <rect x="159" y="23" width="22" height="30" rx="2" fill="#050510" />
      <text x="170" y="31" textAnchor="middle" fill="#8080ff" fontSize="3.5" fontFamily="monospace">SIEMENS</text>
      <text x="170" y="38" textAnchor="middle" fontSize="3.5" fontFamily="monospace">
        <ScreenText running={running} alarm={alarm} />
      </text>
      <text x="170" y="45" textAnchor="middle" fill="#6060cc" fontSize="3" fontFamily="monospace">
        {running ? '828D' : '------'}
      </text>
      <circle cx="164" cy="61" r="3" fill={running ? '#52c41a' : '#333'} />
      <circle cx="172" cy="61" r="3" fill="#e74c3c" />
      <circle cx="180" cy="61" r="3" fill="#f39c12" />
      <circle cx="170" cy="71" r="6" fill="#c0392b" stroke="#e74c3c" strokeWidth="1" />
      <text x="170" y="73.5" textAnchor="middle" fill="white" fontSize="5">E</text>
      <circle cx="170" cy="85" r="8" fill="#141428" stroke="#222244" strokeWidth="1" />
      <circle cx="170" cy="85" r="5" fill="#1a1a30" />
      <line x1="170" y1="85" x2="170" y2="80" stroke="#7f8c8d" strokeWidth="1.5" strokeLinecap="round" />
      {[96,102,108,114,120].map(y => (
        <rect key={y} x="160" y={y} width="20" height="3" rx="1" fill="#1a1a30" />
      ))}

      {/* 상태등 */}
      <rect x="20" y="10" width="14" height="10" rx="2" fill="#1a1a2a" />
      <circle cx="27" cy="15" r="4" fill={sc}>
        {running && <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />}
        {alarm   && <animate attributeName="opacity" values="1;0;1"   dur="0.4s" repeatCount="indefinite" />}
      </circle>

      {/* 칩 컨베이어 */}
      <rect x="8" y="150" width="152" height="4" rx="1" fill="#1a1a2a" />
      {running && (
        <rect width="35" height="2" rx="1" y="151" fill="#45354a" opacity="0.7">
          <animate attributeName="x" values="8;155;8" dur="2.2s" repeatCount="indefinite" />
        </rect>
      )}
    </svg>
  )
}

// ── 메인 export ───────────────────────────────────────────
const TYPE_MAP = {
  vmc:     VMC,
  '5axis': FiveAxis,
  hmc:     HMC,
}

export default function CncMachineIllustration({ machineType = 'vmc', status = 'stopped' }) {
  const Component = TYPE_MAP[machineType] ?? VMC
  return <Component status={status} />
}
