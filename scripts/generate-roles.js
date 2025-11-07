const fs = require('fs');
const path = require('path');

// Load users to get IT department users
const usersPath = path.join(__dirname, '../backend/data/users.json');
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const itUsers = users.filter(u => u.department === 'IT');

console.log(`Found ${itUsers.length} IT department users:`, itUsers.map(u => u.name).join(', '));

// 업무별 역할 데이터 (50개)
const roleDefinitions = [
  // 구매/조달 (5개)
  { name: 'purchasing_manager', displayName: '구매 관리자', description: '전사 구매 업무 총괄 및 승인', roleType: 'management' },
  { name: 'purchasing_staff', displayName: '구매 담당자', description: '일반 구매 업무 처리 및 발주 관리', roleType: 'general' },
  { name: 'supplier_manager', displayName: '공급업체 관리자', description: '협력업체 관리 및 계약 업무', roleType: 'general' },
  { name: 'procurement_analyst', displayName: '조달 분석가', description: '구매 데이터 분석 및 원가 절감 업무', roleType: 'general' },
  { name: 'purchasing_coordinator', displayName: '구매 코디네이터', description: '구매 일정 조율 및 부서간 협업', roleType: 'general' },

  // 설계/개발 (7개)
  { name: 'design_director', displayName: '설계 이사', description: '설계 부서 총괄 및 기술 전략 수립', roleType: 'management' },
  { name: 'senior_designer', displayName: '수석 설계사', description: '고급 설계 업무 및 후배 지도', roleType: 'general' },
  { name: 'mechanical_designer', displayName: '기계 설계 담당자', description: '기계 부품 및 시스템 설계', roleType: 'general' },
  { name: 'electrical_designer', displayName: '전기 설계 담당자', description: '전기 회로 및 시스템 설계', roleType: 'general' },
  { name: 'cad_specialist', displayName: 'CAD 전문가', description: 'CAD 도면 작성 및 3D 모델링', roleType: 'general' },
  { name: 'design_reviewer', displayName: '설계 검토자', description: '설계 도면 검토 및 승인', roleType: 'general' },
  { name: 'bim_coordinator', displayName: 'BIM 코디네이터', description: 'BIM 프로젝트 관리 및 협업', roleType: 'general' },

  // 인사 (6개)
  { name: 'hr_director', displayName: '인사 이사', description: '인사 정책 수립 및 전략 총괄', roleType: 'management' },
  { name: 'hr_manager', displayName: '인사 관리자', description: '인사 업무 관리 및 팀 운영', roleType: 'management' },
  { name: 'recruitment_specialist', displayName: '채용 담당자', description: '신규 인력 채용 및 면접 진행', roleType: 'general' },
  { name: 'payroll_specialist', displayName: '급여 담당자', description: '급여 계산 및 4대보험 관리', roleType: 'general' },
  { name: 'training_coordinator', displayName: '교육 담당자', description: '직원 교육 프로그램 기획 및 운영', roleType: 'general' },
  { name: 'hr_analyst', displayName: '인사 분석가', description: '인사 데이터 분석 및 리포팅', roleType: 'general' },

  // 재무/회계 (6개)
  { name: 'cfo', displayName: '재무 이사', description: '재무 전략 수립 및 자금 관리 총괄', roleType: 'management' },
  { name: 'finance_manager', displayName: '재무 관리자', description: '재무 업무 관리 및 예산 편성', roleType: 'management' },
  { name: 'accountant', displayName: '회계 담당자', description: '전표 처리 및 장부 관리', roleType: 'general' },
  { name: 'tax_specialist', displayName: '세무 담당자', description: '세무 신고 및 절세 전략 수립', roleType: 'general' },
  { name: 'budget_analyst', displayName: '예산 분석가', description: '예산 분석 및 집행 관리', roleType: 'general' },
  { name: 'financial_planner', displayName: '재무 기획자', description: '중장기 재무 계획 수립', roleType: 'general' },

  // 영업/마케팅 (6개)
  { name: 'sales_director', displayName: '영업 이사', description: '영업 전략 수립 및 목표 관리', roleType: 'management' },
  { name: 'sales_manager', displayName: '영업 관리자', description: '영업팀 관리 및 실적 평가', roleType: 'management' },
  { name: 'account_executive', displayName: '영업 담당자', description: '고객 관리 및 신규 수주 활동', roleType: 'general' },
  { name: 'marketing_specialist', displayName: '마케팅 담당자', description: '마케팅 캠페인 기획 및 실행', roleType: 'general' },
  { name: 'product_manager', displayName: '제품 관리자', description: '제품 기획 및 라이프사이클 관리', roleType: 'general' },
  { name: 'crm_specialist', displayName: 'CRM 담당자', description: '고객 관계 관리 시스템 운영', roleType: 'general' },

  // 생산/제조 (6개)
  { name: 'production_director', displayName: '생산 이사', description: '생산 계획 수립 및 공장 운영 총괄', roleType: 'management' },
  { name: 'production_manager', displayName: '생산 관리자', description: '생산 라인 관리 및 품질 관리', roleType: 'management' },
  { name: 'manufacturing_engineer', displayName: '생산 기술자', description: '생산 공정 개선 및 기술 지원', roleType: 'general' },
  { name: 'quality_inspector', displayName: '품질 검사원', description: '제품 품질 검사 및 불량 관리', roleType: 'general' },
  { name: 'maintenance_technician', displayName: '설비 보전 기술자', description: '생산 설비 유지보수 및 수리', roleType: 'general' },
  { name: 'production_planner', displayName: '생산 계획자', description: '생산 일정 수립 및 자재 소요 계획', roleType: 'general' },

  // IT/정보시스템 (6개)
  { name: 'cio', displayName: '정보 이사', description: 'IT 전략 수립 및 정보시스템 총괄', roleType: 'management' },
  { name: 'it_manager', displayName: 'IT 관리자', description: 'IT 인프라 관리 및 팀 운영', roleType: 'management' },
  { name: 'system_administrator', displayName: '시스템 관리자', description: '서버 및 네트워크 관리', roleType: 'general' },
  { name: 'developer', displayName: '개발자', description: '소프트웨어 개발 및 유지보수', roleType: 'general' },
  { name: 'security_specialist', displayName: '보안 담당자', description: '정보보안 관리 및 보안 사고 대응', roleType: 'general' },
  { name: 'helpdesk_support', displayName: '헬프데스크', description: '사용자 기술 지원 및 문제 해결', roleType: 'general' },

  // 법무/준법 (4개)
  { name: 'legal_director', displayName: '법무 이사', description: '법무 전략 수립 및 소송 관리', roleType: 'management' },
  { name: 'legal_counsel', displayName: '법무 담당자', description: '계약서 검토 및 법률 자문', roleType: 'general' },
  { name: 'compliance_officer', displayName: '준법 감시인', description: '내부 규정 준수 감시 및 리스크 관리', roleType: 'general' },
  { name: 'contract_specialist', displayName: '계약 관리자', description: '계약 관리 및 분쟁 해결', roleType: 'general' },

  // 연구개발 (4개)
  { name: 'rd_director', displayName: 'R&D 이사', description: '연구개발 전략 수립 및 프로젝트 총괄', roleType: 'management' },
  { name: 'senior_researcher', displayName: '수석 연구원', description: '핵심 기술 연구 및 개발', roleType: 'general' },
  { name: 'researcher', displayName: '연구원', description: '신제품 연구 및 시험', roleType: 'general' },
  { name: 'lab_technician', displayName: '실험실 기술자', description: '실험 지원 및 데이터 관리', roleType: 'general' }
];

// 기존 시스템 역할 유지
const systemRoles = [
  {
    id: 'role-001',
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access with all permissions',
    roleType: 'management',
    manager: null,
    representative: null,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system'
  },
  {
    id: 'role-002',
    name: 'manager',
    displayName: 'Manager',
    description: 'Can manage users and view reports',
    roleType: 'management',
    manager: null,
    representative: null,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system'
  },
  {
    id: 'role-003',
    name: 'user',
    displayName: 'User',
    description: 'Basic user access',
    roleType: 'general',
    manager: null,
    representative: null,
    isSystem: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system'
  }
];

// 역할 생성
function generateRoles() {
  // 랜덤 IT 사용자 선택 함수
  const getRandomITUser = () => {
    if (itUsers.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * itUsers.length);
    return itUsers[randomIndex].id;
  };

  const generatedRoles = roleDefinitions.map((roleDef, index) => {
    const roleId = `role-${String(index + 4).padStart(3, '0')}`;
    const now = new Date().toISOString();

    // 각 역할에 IT 부서 사용자를 임의로 배정
    const manager = getRandomITUser();
    const representative = getRandomITUser();

    return {
      id: roleId,
      name: roleDef.name,
      displayName: roleDef.displayName,
      description: roleDef.description,
      roleType: roleDef.roleType,
      manager: manager,
      representative: representative,
      isSystem: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: 'admin'
    };
  });

  return [...systemRoles, ...generatedRoles];
}

// 파일 저장
function saveRolesToFile() {
  const roles = generateRoles();
  const filePath = path.join(__dirname, '../backend/data/roles.json');

  const data = {
    roles: roles
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`✅ Successfully generated ${roles.length} roles (${systemRoles.length} system + ${roleDefinitions.length} custom)`);
  console.log(`📁 File saved to: ${filePath}`);
  console.log('\n📊 Role Statistics:');

  const stats = {
    management: roles.filter(r => r.roleType === 'management').length,
    general: roles.filter(r => r.roleType === 'general').length,
    system: roles.filter(r => r.isSystem).length,
    custom: roles.filter(r => !r.isSystem).length,
    withManager: roles.filter(r => r.manager !== null).length,
    withRepresentative: roles.filter(r => r.representative !== null).length
  };

  console.log(`   - Management roles: ${stats.management}`);
  console.log(`   - General roles: ${stats.general}`);
  console.log(`   - System roles: ${stats.system}`);
  console.log(`   - Custom roles: ${stats.custom}`);
  console.log(`   - Roles with Manager: ${stats.withManager}`);
  console.log(`   - Roles with Representative: ${stats.withRepresentative}`);

  // IT 사용자별 배정 통계
  if (itUsers.length > 0) {
    console.log('\n👥 IT Department Assignments:');
    itUsers.forEach(user => {
      const managerCount = roles.filter(r => r.manager === user.id).length;
      const repCount = roles.filter(r => r.representative === user.id).length;
      console.log(`   - ${user.name}: Manager(${managerCount}), Representative(${repCount})`);
    });
  }
}

// 실행
try {
  saveRolesToFile();
} catch (error) {
  console.error('❌ Error generating roles:', error);
  process.exit(1);
}
