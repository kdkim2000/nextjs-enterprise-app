-- Insert Korean help content for all programs
-- Generated: 2025-11-24

-- 1. PROG-USER-LIST (prog-001) - 사용자 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    faq,
    tips,
    troubleshooting,
    video_url,
    related_topics,
    created_at,
    updated_at,
    language,
    status
) VALUES (
    'help-ko-001',
    'prog-001',
    '사용자 관리 도움말',
    '<h4>이 페이지에서 시스템의 모든 사용자를 관리할 수 있습니다. 사용자 검색, 추가, 편집 및 삭제 기능을 제공합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "사용자 검색",
            "content": "<p><strong>빠른 검색:</strong> 상단의 검색 바를 사용하여 사용자명, 이름 또는 이메일로 빠르게 사용자를 찾을 수 있습니다.</p><p><strong>고급 검색:</strong> 필터 아이콘을 클릭하여 역할, 부서, 상태별로 필터링할 수 있는 고급 검색 옵션에 액세스할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 사용자 추가",
            "content": "<p>1. 툴바에서 <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 필수 필드를 입력합니다 (사용자명, 비밀번호, 이름, 이메일)</p><p>3. 적절한 역할과 부서를 선택합니다</p><p>4. <strong>저장</strong>을 클릭하여 사용자를 생성합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "사용자 정보 편집",
            "content": "<p>1. 목록에서 사용자를 찾습니다</p><p>2. 작업 열의 <strong>편집</strong> 아이콘을 클릭합니다</p><p>3. 필요한 정보를 업데이트합니다</p><p>4. <strong>저장</strong>을 클릭하여 변경사항을 적용합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "사용자 삭제",
            "content": "<p>1. 체크박스를 사용하여 한 명 이상의 사용자를 선택합니다</p><p>2. 툴바에서 <strong>삭제</strong> 버튼을 클릭합니다</p><p>3. 나타나는 대화상자에서 삭제를 확인합니다</p><p><strong>참고:</strong> 자신의 계정은 삭제할 수 없습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "데이터 내보내기",
            "content": "<p>툴바의 내보내기 버튼을 사용하여 사용자 데이터를 Excel 또는 PDF 형식으로 내보낼 수 있습니다.</p>"
        }
    ]'::jsonb,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW(),
    'ko',
    'published'
);

-- 2. PROG-DEPT-MGMT (prog-002) - 부서 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-002',
    'prog-002',
    '부서 관리 도움말',
    '<h4>조직의 부서 구조를 관리합니다. 부서 추가, 편집, 삭제 및 계층 구조 설정이 가능합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "부서 구조 이해",
            "content": "<p><strong>계층 구조:</strong> 부서는 5단계 계층(전사 → 부문 → 팀 → 부 → 과)으로 구성됩니다.</p><p><strong>부서 코드:</strong> 각 부서는 고유한 코드로 식별됩니다.</p><p><strong>다국어 지원:</strong> 부서명은 한국어, 영어, 중국어, 베트남어로 관리됩니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "부서 추가",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 부서 코드와 각 언어별 이름을 입력합니다</p><p>3. 상위 부서를 선택합니다 (최상위 부서인 경우 선택하지 않음)</p><p>4. 부서 관리자를 지정합니다</p><p>5. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "부서 정보 수정",
            "content": "<p>1. 목록에서 부서를 찾습니다</p><p>2. <strong>편집</strong> 아이콘을 클릭합니다</p><p>3. 부서 정보를 수정합니다</p><p>4. <strong>저장</strong>을 클릭하여 변경사항을 적용합니다</p><p><strong>주의:</strong> 부서 코드 변경 시 관련 사용자 정보도 확인하세요.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "부서 삭제",
            "content": "<p>1. 삭제할 부서를 선택합니다</p><p>2. <strong>삭제</strong> 버튼을 클릭합니다</p><p>3. 확인 대화상자에서 삭제를 승인합니다</p><p><strong>경고:</strong> 하위 부서나 소속 직원이 있는 부서는 삭제할 수 없습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "부서 관리자 지정",
            "content": "<p>각 부서에 관리자를 지정할 수 있습니다. 관리자는 해당 부서의 승인 권한 및 관리 기능을 사용할 수 있습니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 3. PROG-MENU-MGMT (prog-003) - 메뉴 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-003',
    'prog-003',
    '메뉴 관리 도움말',
    '<h4>시스템의 메뉴 구조를 관리합니다. 메뉴 추가, 편집, 순서 변경 및 권한 설정이 가능합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "메뉴 구조",
            "content": "<p><strong>계층 메뉴:</strong> 메뉴는 최대 3단계 계층으로 구성할 수 있습니다.</p><p><strong>메뉴 아이콘:</strong> 각 메뉴에 Material-UI 아이콘을 지정할 수 있습니다.</p><p><strong>다국어 메뉴명:</strong> 메뉴명은 여러 언어로 설정 가능합니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 메뉴 추가",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 메뉴 코드와 각 언어별 이름을 입력합니다</p><p>3. 상위 메뉴를 선택합니다 (최상위 메뉴인 경우 선택하지 않음)</p><p>4. 메뉴 경로(URL)를 입력합니다</p><p>5. 아이콘을 선택합니다</p><p>6. 표시 순서를 지정합니다</p><p>7. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "메뉴 순서 변경",
            "content": "<p>1. 메뉴 목록에서 순서를 변경할 메뉴를 선택합니다</p><p>2. <strong>편집</strong>을 클릭합니다</p><p>3. 표시 순서 값을 변경합니다</p><p>4. <strong>저장</strong>을 클릭합니다</p><p><strong>팁:</strong> 순서 번호가 작을수록 위에 표시됩니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "메뉴 권한 설정",
            "content": "<p>메뉴 접근 권한은 역할-메뉴 매핑 메뉴에서 설정할 수 있습니다. 특정 역할에 메뉴를 할당하여 접근을 제어합니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "메뉴 비활성화",
            "content": "<p>메뉴를 삭제하지 않고 일시적으로 숨기려면 메뉴의 상태를 비활성으로 변경하세요. 비활성 메뉴는 사용자 화면에 표시되지 않습니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 4. PROG-ROLE-MGMT (prog-004) - 역할 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-004',
    'prog-004',
    '역할 관리 도움말',
    '<h4>시스템의 역할을 관리합니다. 역할 추가, 편집, 삭제 및 권한 설정이 가능합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "역할 시스템 이해",
            "content": "<p><strong>역할이란:</strong> 역할은 유사한 권한을 가진 사용자 그룹을 정의합니다.</p><p><strong>역할 유형:</strong> 시스템 관리자, 부서 관리자, 일반 사용자 등의 역할을 정의할 수 있습니다.</p><p><strong>권한 상속:</strong> 역할 간 권한 상속을 설정할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 역할 추가",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 역할 코드와 이름을 입력합니다</p><p>3. 역할 설명을 작성합니다</p><p>4. 역할 우선순위를 지정합니다</p><p>5. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "역할 권한 설정",
            "content": "<p>1. 역할을 선택하고 <strong>편집</strong>을 클릭합니다</p><p>2. <strong>권한</strong> 탭으로 이동합니다</p><p>3. 메뉴 접근 권한을 설정합니다 (역할-메뉴 매핑)</p><p>4. 프로그램 실행 권한을 설정합니다 (역할-프로그램 매핑)</p><p>5. 데이터 접근 권한을 설정합니다</p><p>6. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "역할에 사용자 할당",
            "content": "<p>사용자-역할 매핑 메뉴에서 사용자에게 역할을 할당할 수 있습니다. 한 사용자에게 여러 역할을 할당할 수 있습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "기본 역할",
            "content": "<p>시스템에는 다음과 같은 기본 역할이 있습니다:</p><ul><li><strong>SUPER_ADMIN:</strong> 모든 권한을 가진 최고 관리자</li><li><strong>ADMIN:</strong> 시스템 관리 권한</li><li><strong>USER:</strong> 일반 사용자 권한</li></ul><p><strong>경고:</strong> 기본 역할은 삭제할 수 없습니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 5. PROG-CODE-MGMT (prog-005) - 코드 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-005',
    'prog-005',
    '코드 관리 도움말',
    '<h4>시스템에서 사용하는 공통 코드를 관리합니다. 코드 그룹 및 코드 상세를 추가, 편집, 삭제할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "코드 시스템 이해",
            "content": "<p><strong>코드 타입:</strong> 관련 코드를 그룹화하는 최상위 카테고리입니다.</p><p><strong>코드:</strong> 코드 타입에 속하는 개별 코드 항목입니다.</p><p><strong>다국어 지원:</strong> 코드명은 여러 언어로 관리할 수 있습니다.</p><p><strong>사용 예:</strong> 사용자 상태(활성, 비활성, 휴면), 부서 유형, 권한 레벨 등</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "코드 타입 관리",
            "content": "<p>1. 코드 타입 탭에서 <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 코드 타입 코드를 입력합니다 (예: USER_STATUS)</p><p>3. 각 언어별 이름과 설명을 입력합니다</p><p>4. <strong>저장</strong>을 클릭합니다</p><p><strong>참고:</strong> 코드 타입 코드는 영문 대문자와 언더스코어만 사용하는 것을 권장합니다.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "코드 추가 및 편집",
            "content": "<p>1. 코드 목록에서 <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 코드 타입을 선택합니다</p><p>3. 코드 값을 입력합니다</p><p>4. 각 언어별 코드명을 입력합니다</p><p>5. 표시 순서를 지정합니다</p><p>6. 활성 여부를 선택합니다</p><p>7. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "코드 검색 및 필터링",
            "content": "<p>1. 상단 검색바에서 코드 타입 또는 코드명으로 검색합니다</p><p>2. 필터 버튼을 클릭하여 활성 상태별로 필터링합니다</p><p>3. 특정 코드 타입의 코드만 보려면 코드 타입을 선택합니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "코드 사용 시 주의사항",
            "content": "<p><strong>코드 삭제:</strong> 시스템에서 사용 중인 코드는 삭제하지 마세요. 대신 비활성화하세요.</p><p><strong>코드 변경:</strong> 코드 값 변경 시 관련 데이터에 영향을 줄 수 있으므로 주의하세요.</p><p><strong>표시 순서:</strong> 드롭다운 등에서 표시되는 순서를 제어합니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 6. PROG-MESSAGE-MGMT (prog-006) - 메시지 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-006',
    'prog-006',
    '메시지 관리 도움말',
    '<h4>시스템에서 사용하는 다국어 메시지를 관리합니다. 오류 메시지, 안내 메시지, 버튼 텍스트 등을 관리할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "메시지 시스템 이해",
            "content": "<p><strong>메시지 키:</strong> 시스템에서 메시지를 식별하는 고유 키입니다.</p><p><strong>다국어 지원:</strong> 각 메시지는 한국어, 영어, 중국어, 베트남어로 관리됩니다.</p><p><strong>메시지 카테고리:</strong> common, validation, error, success 등으로 분류됩니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 메시지 추가",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 메시지 키를 입력합니다 (예: user.login.success)</p><p>3. 메시지 카테고리를 선택합니다</p><p>4. 각 언어별 메시지 내용을 입력합니다</p><p>5. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "메시지 검색",
            "content": "<p>1. 검색바에서 메시지 키 또는 내용으로 검색합니다</p><p>2. 카테고리 필터를 사용하여 특정 카테고리의 메시지만 표시합니다</p><p>3. 언어별 탭을 전환하여 각 언어의 메시지를 확인합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "메시지 일괄 편집",
            "content": "<p>Excel 파일을 사용하여 메시지를 일괄 편집할 수 있습니다:</p><p>1. <strong>내보내기</strong> 버튼을 클릭하여 현재 메시지를 Excel로 다운로드합니다</p><p>2. Excel 파일에서 메시지를 편집합니다</p><p>3. <strong>가져오기</strong> 버튼을 클릭하여 수정된 파일을 업로드합니다</p><p>4. 미리보기에서 변경사항을 확인합니다</p><p>5. <strong>적용</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "메시지 키 네이밍 규칙",
            "content": "<p>메시지 키는 다음 규칙을 따르는 것을 권장합니다:</p><ul><li>소문자와 점(.)을 사용합니다</li><li>모듈.기능.용도 형식을 사용합니다</li><li>예: user.login.error, board.create.success</li></ul>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 7. PROG-HELP-MGMT (prog-007) - 도움말 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-007',
    'prog-007',
    '도움말 관리 도움말',
    '<h4>각 프로그램의 도움말 콘텐츠를 작성하고 관리합니다. Main Content, Sections, FAQs로 구성된 체계적인 도움말을 제공할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "도움말 구조",
            "content": "<p><strong>Main Content:</strong> 프로그램의 주요 기능을 설명하는 핵심 내용입니다.</p><p><strong>Sections:</strong> 기능별로 구분된 상세 설명 섹션입니다.</p><p><strong>FAQs:</strong> 자주 묻는 질문과 답변 목록입니다.</p><p><strong>다국어 지원:</strong> 각 프로그램의 도움말을 여러 언어로 작성할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 도움말 작성",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 대상 프로그램을 선택합니다</p><p>3. 언어를 선택합니다 (ko, en, zh, vi)</p><p>4. 도움말 제목을 입력합니다</p><p>5. Main Content를 작성합니다 (Rich Text Editor 사용)</p><p>6. Sections를 추가하고 작성합니다</p><p>7. 필요시 FAQs를 추가합니다</p><p>8. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "섹션 관리",
            "content": "<p>1. 도움말 편집 화면에서 <strong>섹션 추가</strong> 버튼을 클릭합니다</p><p>2. 섹션 제목을 입력합니다</p><p>3. 섹션 내용을 Rich Text Editor로 작성합니다</p><p>4. 드래그 앤 드롭으로 섹션 순서를 변경할 수 있습니다</p><p>5. 불필요한 섹션은 삭제 버튼으로 제거합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Rich Text Editor 사용",
            "content": "<p>도움말 작성 시 다음 기능을 사용할 수 있습니다:</p><ul><li>텍스트 서식 (굵게, 기울임, 밑줄)</li><li>제목 스타일 (H1-H6)</li><li>목록 (순서 있음/없음)</li><li>링크 삽입</li><li>이미지 삽입</li><li>표 삽입</li><li>코드 블록</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "도움말 미리보기 및 배포",
            "content": "<p>1. 작성 중인 도움말은 <strong>초안</strong> 상태로 저장됩니다</p><p>2. <strong>미리보기</strong> 버튼으로 실제 표시 형태를 확인합니다</p><p>3. 내용이 완성되면 상태를 <strong>배포</strong>로 변경합니다</p><p>4. 배포된 도움말은 사용자가 해당 프로그램에서 볼 수 있습니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 8. PROG-USER-ROLE-MAP (prog-008) - 사용자-역할 매핑
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-008',
    'prog-008',
    '사용자-역할 매핑 도움말',
    '<h4>사용자에게 역할을 할당하고 관리합니다. 한 사용자에게 여러 역할을 부여하거나 제거할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "역할 할당 이해",
            "content": "<p><strong>다중 역할:</strong> 한 사용자는 여러 역할을 동시에 가질 수 있습니다.</p><p><strong>권한 누적:</strong> 여러 역할의 권한이 합산되어 적용됩니다.</p><p><strong>즉시 적용:</strong> 역할 변경은 즉시 적용되며, 사용자가 다시 로그인할 필요가 없습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "사용자에게 역할 할당",
            "content": "<p>1. 사용자를 검색하거나 목록에서 선택합니다</p><p>2. <strong>역할 할당</strong> 버튼을 클릭합니다</p><p>3. 할당할 역할을 체크박스로 선택합니다</p><p>4. <strong>저장</strong>을 클릭합니다</p><p><strong>팁:</strong> 검색 기능을 사용하여 역할을 빠르게 찾을 수 있습니다.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "역할 제거",
            "content": "<p>1. 사용자를 선택합니다</p><p>2. 현재 할당된 역할 목록을 확인합니다</p><p>3. 제거할 역할의 체크박스를 해제합니다</p><p>4. <strong>저장</strong>을 클릭합니다</p><p><strong>주의:</strong> 모든 역할을 제거하면 사용자는 시스템에 접근할 수 없게 됩니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "일괄 역할 할당",
            "content": "<p>여러 사용자에게 동시에 역할을 할당할 수 있습니다:</p><p>1. 체크박스로 여러 사용자를 선택합니다</p><p>2. <strong>일괄 역할 할당</strong> 버튼을 클릭합니다</p><p>3. 할당할 역할을 선택합니다</p><p>4. <strong>적용</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "역할별 사용자 조회",
            "content": "<p>특정 역할을 가진 사용자 목록을 조회할 수 있습니다:</p><p>1. <strong>역할별 조회</strong> 탭을 선택합니다</p><p>2. 조회할 역할을 선택합니다</p><p>3. 해당 역할을 가진 모든 사용자 목록이 표시됩니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 9. PROG-ROLE-MENU-MAP (prog-009) - 역할-메뉴 매핑
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-009',
    'prog-009',
    '역할-메뉴 매핑 도움말',
    '<h4>각 역할이 접근할 수 있는 메뉴를 설정합니다. 역할별로 메뉴 가시성과 접근 권한을 제어할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "메뉴 접근 제어",
            "content": "<p><strong>역할 기반 메뉴:</strong> 사용자는 자신의 역할에 할당된 메뉴만 볼 수 있습니다.</p><p><strong>계층 구조:</strong> 상위 메뉴 권한이 있어야 하위 메뉴에 접근할 수 있습니다.</p><p><strong>동적 메뉴:</strong> 사용자의 역할에 따라 메뉴가 동적으로 구성됩니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "역할에 메뉴 할당",
            "content": "<p>1. 역할을 선택합니다</p><p>2. 할당 가능한 메뉴 트리가 표시됩니다</p><p>3. 체크박스를 사용하여 메뉴를 선택합니다</p><p>4. 하위 메뉴도 함께 선택하려면 상위 메뉴를 클릭합니다</p><p>5. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "메뉴 권한 복사",
            "content": "<p>기존 역할의 메뉴 권한을 다른 역할로 복사할 수 있습니다:</p><p>1. 원본 역할을 선택합니다</p><p>2. <strong>권한 복사</strong> 버튼을 클릭합니다</p><p>3. 대상 역할을 선택합니다</p><p>4. <strong>복사</strong>를 클릭합니다</p><p><strong>참고:</strong> 기존 권한은 덮어쓰기됩니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "메뉴별 역할 조회",
            "content": "<p>특정 메뉴에 접근 가능한 역할 목록을 확인할 수 있습니다:</p><p>1. <strong>메뉴별 조회</strong> 탭을 선택합니다</p><p>2. 조회할 메뉴를 선택합니다</p><p>3. 해당 메뉴에 접근 가능한 모든 역할이 표시됩니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "권한 테스트",
            "content": "<p>설정한 메뉴 권한을 테스트할 수 있습니다:</p><p>1. <strong>권한 테스트</strong> 버튼을 클릭합니다</p><p>2. 테스트할 사용자를 선택합니다</p><p>3. 해당 사용자가 볼 수 있는 메뉴 구조가 미리보기로 표시됩니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 10. PROG-PROGRAM-MGMT (prog-010) - 프로그램 관리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-010',
    'prog-010',
    '프로그램 관리 도움말',
    '<h4>시스템에서 사용하는 프로그램(화면)을 등록하고 관리합니다. 프로그램별 권한 및 속성을 설정할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "프로그램 개념",
            "content": "<p><strong>프로그램이란:</strong> 시스템의 각 기능 화면을 프로그램 단위로 관리합니다.</p><p><strong>프로그램 코드:</strong> 각 프로그램은 고유한 코드로 식별됩니다.</p><p><strong>프로그램 권한:</strong> 역할별로 프로그램 실행 권한을 설정할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 프로그램 등록",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 프로그램 코드를 입력합니다 (예: PROG-USER-001)</p><p>3. 각 언어별 프로그램명과 설명을 입력합니다</p><p>4. 프로그램 카테고리를 선택합니다</p><p>5. 프로그램 타입(메뉴, 팝업, 배치 등)을 선택합니다</p><p>6. 프로그램 경로(URL)를 입력합니다</p><p>7. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "프로그램 권한 설정",
            "content": "<p>프로그램별 상세 권한을 JSON 형식으로 설정할 수 있습니다:</p><p>1. 프로그램을 선택하고 <strong>편집</strong>을 클릭합니다</p><p>2. <strong>권한</strong> 탭으로 이동합니다</p><p>3. 권한 JSON을 작성합니다 (예: {\"read\": true, \"write\": false})</p><p>4. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "프로그램 카테고리",
            "content": "<p>프로그램은 다음과 같은 카테고리로 분류할 수 있습니다:</p><ul><li><strong>시스템 관리:</strong> 사용자, 역할, 메뉴 등 시스템 관리 프로그램</li><li><strong>업무:</strong> 실제 업무를 수행하는 프로그램</li><li><strong>보고서:</strong> 데이터 조회 및 보고서 프로그램</li><li><strong>설정:</strong> 각종 설정 프로그램</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "프로그램 상태 관리",
            "content": "<p>프로그램은 다음 상태로 관리됩니다:</p><ul><li><strong>개발중:</strong> 개발 중인 프로그램</li><li><strong>활성:</strong> 사용자가 사용할 수 있는 프로그램</li><li><strong>비활성:</strong> 일시적으로 사용 중지된 프로그램</li><li><strong>폐기:</strong> 더 이상 사용하지 않는 프로그램</li></ul>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 11. PROG-LOGS (prog-011) - 시스템 로그
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-011',
    'prog-011',
    '시스템 로그 도움말',
    '<h4>시스템의 모든 활동을 기록한 로그를 조회하고 분석합니다. 사용자 활동, 에러, 시스템 이벤트를 추적할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "로그 유형",
            "content": "<p><strong>접근 로그:</strong> 사용자의 로그인, 로그아웃 기록</p><p><strong>활동 로그:</strong> 사용자의 프로그램 실행 및 데이터 변경 기록</p><p><strong>에러 로그:</strong> 시스템에서 발생한 오류 기록</p><p><strong>시스템 로그:</strong> 시스템 이벤트 및 배치 작업 기록</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "로그 조회",
            "content": "<p>1. 조회할 날짜 범위를 선택합니다</p><p>2. 로그 유형을 선택합니다 (전체, 접근, 활동, 에러, 시스템)</p><p>3. 필요시 사용자, 프로그램, 키워드로 필터링합니다</p><p>4. <strong>조회</strong> 버튼을 클릭합니다</p><p><strong>팁:</strong> 대용량 로그 조회 시 날짜 범위를 좁히면 빠르게 조회됩니다.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "로그 상세 보기",
            "content": "<p>1. 로그 목록에서 확인할 로그를 클릭합니다</p><p>2. 로그 상세 정보가 표시됩니다:</p><ul><li>발생 시각</li><li>사용자 정보</li><li>프로그램 정보</li><li>작업 내용</li><li>변경 전/후 데이터 (있는 경우)</li><li>에러 메시지 (있는 경우)</li></ul>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "로그 내보내기",
            "content": "<p>조회한 로그를 Excel 파일로 내보낼 수 있습니다:</p><p>1. 로그를 조회합니다</p><p>2. <strong>내보내기</strong> 버튼을 클릭합니다</p><p>3. 파일 형식(Excel, CSV)을 선택합니다</p><p>4. 다운로드됩니다</p><p><strong>제한:</strong> 한 번에 최대 10,000건까지 내보낼 수 있습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "로그 보관 정책",
            "content": "<p><strong>보관 기간:</strong> 로그는 기본적으로 90일간 보관됩니다.</p><p><strong>자동 삭제:</strong> 보관 기간이 지난 로그는 자동으로 삭제됩니다.</p><p><strong>백업:</strong> 중요 로그는 별도로 백업하는 것을 권장합니다.</p><p><strong>규정 준수:</strong> 개인정보 관련 로그는 관련 법규에 따라 관리됩니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 12. PROG-SALES-RPT (prog-012) - 판매 보고서
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-012',
    'prog-012',
    '판매 보고서 도움말',
    '<h4>판매 데이터를 다양한 관점에서 조회하고 분석합니다. 기간별, 제품별, 지역별 판매 현황을 확인할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "보고서 개요",
            "content": "<p><strong>판매 현황:</strong> 전체 판매 실적을 요약하여 보여줍니다.</p><p><strong>트렌드 분석:</strong> 시계열 차트로 판매 추이를 시각화합니다.</p><p><strong>비교 분석:</strong> 전년 동기 대비, 전월 대비 등의 비교 분석을 제공합니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "기간별 판매 조회",
            "content": "<p>1. 조회 기간을 선택합니다 (일, 주, 월, 분기, 연)</p><p>2. 시작일과 종료일을 지정합니다</p><p>3. <strong>조회</strong> 버튼을 클릭합니다</p><p>4. 기간별 판매 금액, 수량, 건수가 표시됩니다</p><p>5. 차트 유형(막대, 선, 파이)을 변경하여 다양한 시각화를 확인합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "제품별 판매 분석",
            "content": "<p>1. <strong>제품별</strong> 탭을 선택합니다</p><p>2. 조회 기간을 설정합니다</p><p>3. 제품 카테고리를 선택합니다 (선택사항)</p><p>4. <strong>조회</strong> 버튼을 클릭합니다</p><p>5. 제품별 판매 순위, 매출 비중 등이 표시됩니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "상세 데이터 조회",
            "content": "<p>요약 데이터의 특정 항목을 클릭하면 상세 거래 내역을 확인할 수 있습니다:</p><p>1. 차트나 표의 항목을 클릭합니다</p><p>2. 해당 항목의 상세 거래 목록이 팝업으로 표시됩니다</p><p>3. 거래 내역을 Excel로 내보낼 수 있습니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "보고서 내보내기 및 인쇄",
            "content": "<p><strong>Excel 내보내기:</strong> <strong>내보내기</strong> 버튼을 클릭하여 데이터를 Excel 파일로 다운로드합니다.</p><p><strong>PDF 출력:</strong> <strong>PDF</strong> 버튼을 클릭하여 보고서를 PDF로 저장하거나 인쇄합니다.</p><p><strong>이메일 발송:</strong> <strong>공유</strong> 버튼을 클릭하여 보고서를 이메일로 발송할 수 있습니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 13. PROG-DASHBOARD (prog-013) - 대시보드
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-013',
    'prog-013',
    '대시보드 도움말',
    '<h4>시스템의 주요 지표와 현황을 한눈에 확인할 수 있는 대시보드입니다. 실시간 데이터와 요약 통계를 제공합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "대시보드 구성",
            "content": "<p><strong>KPI 카드:</strong> 주요 성과 지표를 카드 형태로 표시합니다.</p><p><strong>차트:</strong> 다양한 차트로 데이터를 시각화합니다.</p><p><strong>최근 활동:</strong> 최근 시스템 활동 및 알림을 표시합니다.</p><p><strong>빠른 링크:</strong> 자주 사용하는 기능으로 빠르게 이동할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "대시보드 위젯 관리",
            "content": "<p>대시보드의 위젯을 사용자 정의할 수 있습니다:</p><p>1. 우측 상단의 <strong>편집</strong> 버튼을 클릭합니다</p><p>2. 위젯을 드래그하여 위치를 변경합니다</p><p>3. 위젯의 크기를 조절할 수 있습니다</p><p>4. 불필요한 위젯은 X 버튼으로 제거합니다</p><p>5. <strong>위젯 추가</strong> 버튼으로 새 위젯을 추가합니다</p><p>6. <strong>저장</strong>을 클릭하여 레이아웃을 저장합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "데이터 필터링",
            "content": "<p>대시보드 데이터를 필터링할 수 있습니다:</p><p>1. 상단의 필터 옵션을 사용합니다</p><p>2. 기간을 선택합니다 (오늘, 이번 주, 이번 달, 사용자 지정)</p><p>3. 부서 또는 팀을 선택합니다</p><p>4. <strong>적용</strong>을 클릭하면 선택한 필터에 따라 대시보드가 업데이트됩니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "실시간 데이터 업데이트",
            "content": "<p><strong>자동 새로고침:</strong> 대시보드 데이터는 5분마다 자동으로 업데이트됩니다.</p><p><strong>수동 새로고침:</strong> <strong>새로고침</strong> 버튼을 클릭하여 즉시 최신 데이터를 불러옵니다.</p><p><strong>실시간 알림:</strong> 중요 이벤트 발생 시 실시간으로 알림을 받을 수 있습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "대시보드 공유",
            "content": "<p>대시보드 설정을 다른 사용자와 공유할 수 있습니다:</p><p>1. <strong>공유</strong> 버튼을 클릭합니다</p><p>2. 공유할 사용자 또는 팀을 선택합니다</p><p>3. 읽기 전용 또는 편집 가능 권한을 선택합니다</p><p>4. <strong>공유</strong>를 클릭합니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 14. PROG-SETTINGS (prog-014) - 사용자 설정
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-014',
    'prog-014',
    '사용자 설정 도움말',
    '<h4>개인 환경 설정을 관리합니다. 언어, 테마, 알림 등 사용자 개인 설정을 변경할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "기본 설정",
            "content": "<p><strong>언어 설정:</strong> 시스템 표시 언어를 한국어, 영어, 중국어, 베트남어 중 선택할 수 있습니다.</p><p><strong>시간대:</strong> 날짜와 시간 표시 형식을 설정합니다.</p><p><strong>홈 화면:</strong> 로그인 후 처음 표시될 화면을 설정합니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "테마 설정",
            "content": "<p>1. <strong>테마</strong> 탭을 선택합니다</p><p>2. 밝은 모드 또는 어두운 모드를 선택합니다</p><p>3. 기본 색상 테마를 선택합니다 (파랑, 녹색, 보라 등)</p><p>4. 글꼴 크기를 조정합니다 (작게, 보통, 크게)</p><p>5. <strong>저장</strong>을 클릭합니다</p><p><strong>미리보기:</strong> 변경사항을 저장하기 전에 미리 볼 수 있습니다.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "알림 설정",
            "content": "<p>1. <strong>알림</strong> 탭을 선택합니다</p><p>2. 받고 싶은 알림 유형을 선택합니다:</p><ul><li>시스템 알림</li><li>메시지 알림</li><li>게시판 알림</li><li>승인 요청 알림</li></ul><p>3. 알림 방법을 선택합니다 (화면, 이메일)</p><p>4. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "보안 설정",
            "content": "<p>1. <strong>보안</strong> 탭을 선택합니다</p><p>2. 비밀번호를 변경할 수 있습니다</p><p>3. 2단계 인증(OTP)을 활성화/비활성화합니다</p><p>4. 활성 세션을 확인하고 관리합니다</p><p>5. 로그인 기록을 확인합니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "데이터 관리",
            "content": "<p><strong>개인 데이터 내보내기:</strong> 자신의 개인 데이터를 다운로드할 수 있습니다.</p><p><strong>캐시 지우기:</strong> 브라우저 캐시를 지워 문제를 해결할 수 있습니다.</p><p><strong>설정 초기화:</strong> 모든 설정을 기본값으로 되돌립니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 15. PROG-COMPONENTS (prog-015) - 컴포넌트 라이브러리
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-015',
    'prog-015',
    '컴포넌트 라이브러리 도움말',
    '<h4>시스템에서 사용 가능한 UI 컴포넌트를 확인하고 테스트할 수 있습니다. 개발자를 위한 참고 자료입니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "컴포넌트 카테고리",
            "content": "<p><strong>입력 컴포넌트:</strong> TextField, Select, DatePicker, Checkbox, Radio 등</p><p><strong>표시 컴포넌트:</strong> Card, Table, DataGrid, Chart 등</p><p><strong>네비게이션:</strong> Menu, Breadcrumb, Tabs, Stepper 등</p><p><strong>피드백:</strong> Alert, Dialog, Snackbar, Progress 등</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "컴포넌트 미리보기",
            "content": "<p>1. 좌측 메뉴에서 컴포넌트 카테고리를 선택합니다</p><p>2. 컴포넌트 목록에서 확인할 컴포넌트를 클릭합니다</p><p>3. 컴포넌트의 다양한 상태와 변형을 확인합니다</p><p>4. 속성 값을 변경하여 실시간으로 결과를 확인합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "코드 예제",
            "content": "<p>각 컴포넌트의 사용 예제 코드를 확인할 수 있습니다:</p><p>1. 컴포넌트 페이지에서 <strong>코드 보기</strong> 탭을 선택합니다</p><p>2. React 코드 예제가 표시됩니다</p><p>3. <strong>복사</strong> 버튼을 클릭하여 코드를 복사합니다</p><p>4. 프로젝트에 붙여넣어 사용합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "속성 및 API",
            "content": "<p><strong>Props:</strong> 컴포넌트가 받을 수 있는 모든 속성 목록과 설명을 확인합니다.</p><p><strong>기본값:</strong> 각 속성의 기본값을 확인합니다.</p><p><strong>타입:</strong> TypeScript 타입 정의를 확인합니다.</p><p><strong>이벤트:</strong> 컴포넌트가 발생시키는 이벤트를 확인합니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "접근성 가이드",
            "content": "<p>각 컴포넌트의 접근성(Accessibility) 가이드라인을 제공합니다:</p><ul><li>키보드 네비게이션 지원</li><li>스크린 리더 호환성</li><li>ARIA 속성 사용법</li><li>색상 대비 가이드</li></ul>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 16. PROG-THEME-DEMO (prog-016) - 테마 시스템 데모
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-016',
    'prog-016',
    '테마 시스템 데모 도움말',
    '<h4>시스템의 테마 및 스타일링 시스템을 확인하고 테스트할 수 있습니다. 색상, 타이포그래피, 간격 등을 미리 볼 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "테마 시스템",
            "content": "<p><strong>기본 테마:</strong> 라이트 모드와 다크 모드를 지원합니다.</p><p><strong>색상 팔레트:</strong> Primary, Secondary, Error, Warning, Info, Success 색상을 정의합니다.</p><p><strong>커스터마이징:</strong> 조직의 브랜드에 맞게 테마를 커스터마이징할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "색상 팔레트",
            "content": "<p>1. <strong>색상</strong> 탭을 선택합니다</p><p>2. 각 색상 카테고리를 확인합니다:</p><ul><li>Primary: 주요 브랜드 색상</li><li>Secondary: 보조 색상</li><li>Error: 오류 표시 색상</li><li>Warning: 경고 색상</li><li>Info: 정보 색상</li><li>Success: 성공 색상</li></ul><p>3. 각 색상의 다양한 shade를 확인합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "타이포그래피",
            "content": "<p><strong>글꼴:</strong> 시스템에서 사용하는 기본 글꼴을 확인합니다.</p><p><strong>글꼴 크기:</strong> h1~h6, body1, body2, caption 등의 크기를 확인합니다.</p><p><strong>글꼴 굵기:</strong> light, regular, medium, bold 등의 굵기를 확인합니다.</p><p><strong>줄 높이:</strong> 각 텍스트 스타일의 줄 높이를 확인합니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "간격 및 레이아웃",
            "content": "<p><strong>Spacing:</strong> 8px 기반 간격 시스템을 사용합니다 (8, 16, 24, 32, 40px 등).</p><p><strong>Grid:</strong> 12컬럼 그리드 시스템을 확인합니다.</p><p><strong>Breakpoints:</strong> 반응형 디자인을 위한 중단점을 확인합니다 (xs, sm, md, lg, xl).</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "테마 적용 방법",
            "content": "<p>커스텀 테마를 적용하는 방법:</p><p>1. theme.ts 파일에서 테마 설정을 수정합니다</p><p>2. 색상, 글꼴, 간격 등을 커스터마이징합니다</p><p>3. ThemeProvider로 애플리케이션을 감쌉니다</p><p>4. 변경사항을 저장하고 애플리케이션을 재시작합니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 17. PROG-REACT-STUDY (prog-017) - React 연구회
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-017',
    'prog-017',
    'React 연구회 도움말',
    '<h4>React 개발 관련 학습 자료, 예제 코드, 베스트 프랙티스를 공유하는 공간입니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "React 연구회 소개",
            "content": "<p><strong>목적:</strong> React 및 관련 기술 스택을 학습하고 공유합니다.</p><p><strong>대상:</strong> React 개발에 관심있는 모든 개발자</p><p><strong>활동:</strong> 코드 리뷰, 학습 자료 공유, 기술 토론</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "학습 자료",
            "content": "<p>다양한 React 학습 자료를 확인할 수 있습니다:</p><ul><li>React 공식 문서</li><li>TypeScript 가이드</li><li>Next.js 튜토리얼</li><li>상태 관리 (Zustand, Redux)</li><li>스타일링 (Emotion, Tailwind CSS)</li><li>테스팅 (Jest, React Testing Library)</li></ul>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "코드 예제",
            "content": "<p>실무에서 자주 사용하는 패턴의 예제 코드를 제공합니다:</p><p>1. <strong>예제</strong> 탭을 선택합니다</p><p>2. 카테고리별로 예제를 찾습니다 (Hooks, Forms, API 연동 등)</p><p>3. 예제 코드를 확인하고 실행해 봅니다</p><p>4. 코드를 복사하여 프로젝트에 적용합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "베스트 프랙티스",
            "content": "<p>프로젝트에서 따르는 React 개발 규칙과 베스트 프랙티스:</p><ul><li>컴포넌트 설계 원칙</li><li>파일 및 폴더 구조</li><li>네이밍 컨벤션</li><li>상태 관리 전략</li><li>성능 최적화 기법</li><li>접근성 고려사항</li></ul>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "토론 및 Q&A",
            "content": "<p>개발 중 겪은 문제나 궁금한 점을 공유하고 토론할 수 있습니다:</p><p>1. <strong>토론</strong> 탭을 선택합니다</p><p>2. <strong>새 토론</strong> 버튼을 클릭합니다</p><p>3. 제목과 내용을 작성합니다</p><p>4. 코드나 이미지를 첨부할 수 있습니다</p><p>5. 다른 개발자들의 답변과 의견을 확인합니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 18. PROG-BOARD-TYPE (게시판 종류 관리)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-018',
    'PROG-BOARD-TYPE',
    '게시판 종류 관리 도움말',
    '<h4>시스템에서 사용할 게시판 종류를 생성하고 관리합니다. 공지사항, 자유게시판, Q&A 등 다양한 게시판을 설정할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "게시판 종류 이해",
            "content": "<p><strong>게시판 타입:</strong> 공지사항, 일반 게시판, Q&A, 갤러리 등 게시판의 용도를 정의합니다.</p><p><strong>권한 설정:</strong> 게시판별로 읽기, 쓰기, 댓글, 첨부파일 권한을 설정할 수 있습니다.</p><p><strong>다국어 지원:</strong> 게시판명은 여러 언어로 관리할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 게시판 종류 추가",
            "content": "<p>1. <strong>추가</strong> 버튼을 클릭합니다</p><p>2. 게시판 코드를 입력합니다 (예: NOTICE, FREE)</p><p>3. 각 언어별 게시판 이름을 입력합니다</p><p>4. 게시판 타입을 선택합니다</p><p>5. 게시판 설명을 작성합니다</p><p>6. 기본 권한을 설정합니다</p><p>7. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "게시판 설정",
            "content": "<p>게시판별로 다양한 옵션을 설정할 수 있습니다:</p><ul><li><strong>댓글 허용:</strong> 댓글 작성 가능 여부</li><li><strong>첨부파일:</strong> 파일 첨부 가능 여부 및 최대 크기</li><li><strong>익명 작성:</strong> 익명 게시글 허용 여부</li><li><strong>비밀글:</strong> 비밀글 작성 허용 여부</li><li><strong>에디터 타입:</strong> 일반 텍스트 또는 Rich Text Editor</li></ul>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "게시판 권한 관리",
            "content": "<p>1. 게시판을 선택하고 <strong>권한</strong> 탭을 클릭합니다</p><p>2. 역할별 권한을 설정합니다:</p><ul><li>목록 조회</li><li>상세 조회</li><li>글 작성</li><li>글 수정</li><li>글 삭제</li><li>댓글 작성</li></ul><p>3. <strong>저장</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "게시판 순서 및 표시",
            "content": "<p><strong>표시 순서:</strong> 게시판 목록에서 표시되는 순서를 지정합니다.</p><p><strong>활성화/비활성화:</strong> 게시판을 일시적으로 숨기거나 표시할 수 있습니다.</p><p><strong>아이콘 설정:</strong> 게시판을 나타내는 아이콘을 선택할 수 있습니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 19. PROG-BOARD-USER (게시판)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-019',
    'PROG-BOARD-USER',
    '게시판 도움말',
    '<h4>게시판에서 글을 작성하고 조회할 수 있습니다. 댓글, 좋아요, 파일 첨부 등 다양한 기능을 제공합니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "게시글 조회",
            "content": "<p><strong>목록 보기:</strong> 게시판 목록에서 제목, 작성자, 작성일, 조회수를 확인합니다.</p><p><strong>검색:</strong> 제목, 내용, 작성자로 게시글을 검색할 수 있습니다.</p><p><strong>정렬:</strong> 최신순, 조회수순, 좋아요순으로 정렬할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "게시글 작성",
            "content": "<p>1. 게시판에서 <strong>글쓰기</strong> 버튼을 클릭합니다</p><p>2. 제목을 입력합니다</p><p>3. Rich Text Editor로 내용을 작성합니다:</p><ul><li>텍스트 서식 적용</li><li>이미지 삽입</li><li>링크 삽입</li><li>표 삽입</li></ul><p>4. 필요시 파일을 첨부합니다</p><p>5. 카테고리를 선택합니다 (있는 경우)</p><p>6. <strong>등록</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "게시글 상세 보기",
            "content": "<p>1. 게시글 제목을 클릭하여 상세 화면으로 이동합니다</p><p>2. 게시글 내용, 첨부파일, 댓글을 확인합니다</p><p>3. <strong>좋아요</strong> 버튼을 클릭하여 공감을 표시합니다</p><p>4. 이전 글/다음 글로 이동할 수 있습니다</p><p>5. 자신의 글인 경우 <strong>수정</strong>, <strong>삭제</strong> 버튼이 표시됩니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "댓글 작성",
            "content": "<p>1. 게시글 하단의 댓글 입력란에 내용을 작성합니다</p><p>2. <strong>등록</strong>을 클릭합니다</p><p>3. 대댓글을 작성하려면 <strong>답글</strong> 버튼을 클릭합니다</p><p>4. 자신의 댓글은 수정 및 삭제할 수 있습니다</p><p>5. 댓글에도 좋아요를 표시할 수 있습니다</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "파일 첨부",
            "content": "<p><strong>업로드:</strong> 글 작성 시 <strong>파일 첨부</strong> 버튼을 클릭하여 파일을 업로드합니다.</p><p><strong>제한:</strong> 파일 크기 및 형식 제한은 게시판 설정에 따릅니다.</p><p><strong>다운로드:</strong> 첨부파일명을 클릭하여 다운로드합니다.</p><p><strong>미리보기:</strong> 이미지 파일은 본문에 미리보기로 표시됩니다.</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);

-- 20. PROG-POST-ADMIN (게시글 관리)
INSERT INTO help (
    id,
    program_id,
    title,
    content,
    sections,
    language,
    status,
    created_at,
    updated_at
) VALUES (
    'help-ko-020',
    'PROG-POST-ADMIN',
    '게시글 관리 도움말',
    '<h4>모든 게시판의 게시글을 통합 관리합니다. 부적절한 게시글 삭제, 공지사항 설정, 통계 확인 등을 할 수 있습니다.</h4><hr><p></p>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "게시글 통합 관리",
            "content": "<p><strong>전체 게시글 조회:</strong> 모든 게시판의 게시글을 한 화면에서 확인합니다.</p><p><strong>필터링:</strong> 게시판, 작성자, 기간, 상태별로 필터링합니다.</p><p><strong>검색:</strong> 제목, 내용, 작성자로 통합 검색합니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "게시글 관리 기능",
            "content": "<p>관리자는 다음 작업을 수행할 수 있습니다:</p><p>1. <strong>공지사항 설정:</strong> 중요 게시글을 공지사항으로 지정합니다</p><p>2. <strong>게시글 삭제:</strong> 부적절한 게시글을 삭제합니다</p><p>3. <strong>게시글 이동:</strong> 게시글을 다른 게시판으로 이동합니다</p><p>4. <strong>게시 중지:</strong> 게시글을 일시적으로 숨김 처리합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "일괄 관리",
            "content": "<p>여러 게시글을 선택하여 일괄 작업을 수행할 수 있습니다:</p><p>1. 체크박스로 게시글을 선택합니다</p><p>2. <strong>일괄 작업</strong> 드롭다운을 클릭합니다</p><p>3. 작업을 선택합니다 (삭제, 이동, 공지 설정 등)</p><p>4. 확인 후 <strong>실행</strong>을 클릭합니다</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "게시판 통계",
            "content": "<p><strong>통계</strong> 탭에서 다양한 통계를 확인할 수 있습니다:</p><ul><li>게시판별 게시글 수</li><li>기간별 게시글 추이</li><li>인기 게시글 TOP 10</li><li>활발한 사용자 TOP 10</li><li>댓글 통계</li></ul><p>통계는 차트와 표로 시각화됩니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "신고 게시글 관리",
            "content": "<p>사용자가 신고한 게시글을 관리합니다:</p><p>1. <strong>신고 관리</strong> 탭을 선택합니다</p><p>2. 신고된 게시글 목록을 확인합니다</p><p>3. 신고 내용과 사유를 검토합니다</p><p>4. 적절한 조치를 취합니다 (삭제, 경고, 신고 기각)</p><p>5. 조치 결과를 기록합니다</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
);
