-- Update help content with detailed, beginner-friendly descriptions - Part 2
-- Generated: 2025-11-25
-- This script enhances remaining 16 programs with comprehensive help content

-- 5. PROG-CODE-MGMT - Code Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📋 코드 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템에서 사용하는 공통 코드를 관리합니다. 드롭다운 목록, 상태 값, 카테고리 등 다양한 곳에서 사용되는 코드를 중앙에서 통합 관리하여 데이터 일관성을 유지하고 유지보수를 쉽게 만듭니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #38b2ac;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>데이터 일관성:</strong> 시스템 전체에서 동일한 코드 값을 사용하여 데이터 무결성을 보장합니다</li>
            <li><strong>쉬운 유지보수:</strong> 코드 값을 변경할 때 한 곳에서만 수정하면 전체에 반영됩니다</li>
            <li><strong>다국어 지원:</strong> 같은 코드를 여러 언어로 표시할 수 있습니다</li>
            <li><strong>유연한 확장:</strong> 새로운 코드 타입과 값을 쉽게 추가할 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>이미 사용 중인 코드를 삭제하면 관련 데이터에 문제가 발생할 수 있습니다</li>
            <li>코드 값(code)은 변경할 수 없으므로 신중하게 설정하세요</li>
            <li>코드 순서를 변경하면 드롭다운 목록의 표시 순서가 변경됩니다</li>
            <li>시스템 필수 코드는 삭제할 수 없습니다</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "코드 체계 이해하기",
            "content": "<p><strong>코드 타입(Code Type):</strong> 관련된 코드들을 그룹화하는 상위 카테고리입니다. 예를 들어 ''LANGUAGE''는 언어 관련 코드들의 그룹입니다.</p><p><strong>코드 값(Code):</strong> 실제 데이터베이스에 저장되는 값입니다. 예: ''ko'', ''en'', ''zh''</p><p><strong>코드명(Code Name):</strong> 사용자에게 표시되는 이름입니다. 다국어를 지원하여 각 언어별로 다른 이름을 설정할 수 있습니다.</p><p><strong>정렬 순서:</strong> 드롭다운이나 목록에서 표시될 순서를 결정합니다. 낮은 숫자가 먼저 표시됩니다.</p><p><strong>예시:</strong><br/>• 코드 타입: LANGUAGE<br/>• 코드 값: ko → 코드명: 한국어 (Korean, 韩语, Tiếng Hàn)<br/>• 코드 값: en → 코드명: 영어 (English, 英语, Tiếng Anh)</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 코드 타입 추가하기",
            "content": "<p><strong>1단계: 코드 타입 계획</strong><br/>새 코드 타입이 필요한지 먼저 검토하세요:<br/>• 기존 코드 타입을 확장할 수 있는가?<br/>• 3개 이상의 고정된 값이 필요한가?<br/>• 여러 곳에서 재사용될 것인가?</p><p><strong>2단계: 코드 타입 생성</strong><br/>1. <strong>추가</strong> 버튼을 클릭합니다<br/>2. <strong>코드 타입:</strong> 영문 대문자와 언더스코어 사용 (예: USER_STATUS, ORDER_TYPE)<br/>3. <strong>코드 타입명:</strong> 한국어, 영어 등으로 입력 (예: 사용자 상태, User Status)<br/>4. <strong>설명:</strong> 이 코드 타입의 용도를 명확하게 작성</p><p><strong>3단계: 코드 값 추가</strong><br/>코드 타입을 생성한 후, 해당 타입에 속하는 개별 코드 값들을 추가합니다.</p><p><strong>💡 명명 규칙:</strong><br/>• 코드 타입: 전체 대문자, 언더스코어로 단어 구분<br/>• 짧고 명확한 이름 사용<br/>• 도메인 용어 활용 (예: ORDER_STATUS, PAYMENT_METHOD)</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "코드 값 추가 및 수정",
            "content": "<p><strong>코드 값 추가:</strong><br/>1. 코드 타입을 선택합니다<br/>2. <strong>코드 추가</strong> 버튼을 클릭합니다<br/>3. <strong>코드 값:</strong> 시스템에서 사용할 값 (예: ACTIVE, PENDING, INACTIVE)<br/>4. <strong>코드명:</strong> 각 언어별로 사용자에게 표시될 이름 입력<br/>5. <strong>정렬 순서:</strong> 표시 순서 지정 (10, 20, 30... 단위 권장)<br/>6. <strong>활성 여부:</strong> 현재 사용 가능한 코드인지 설정</p><p><strong>코드 값 수정:</strong><br/>1. 수정할 코드를 찾아 <strong>편집</strong> 아이콘 클릭<br/>2. 코드명, 설명, 정렬 순서, 활성 여부를 수정<br/>3. 코드 값 자체는 변경할 수 없습니다</p><p><strong>다국어 입력:</strong><br/>• 한국어: 한글로 명확하게 입력<br/>• 영어: 영문으로 입력<br/>• 중국어, 베트남어: 필요시 입력<br/>• 최소한 한국어와 영어는 필수로 입력하세요</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "코드 순서 및 활성화 관리",
            "content": "<p><strong>표시 순서 변경:</strong><br/>1. 코드 편집 화면에서 ''정렬 순서'' 값을 변경<br/>2. 낮은 숫자가 먼저 표시됩니다<br/>3. 10단위로 설정하면 나중에 중간에 추가하기 편합니다<br/>4. 예: 10(최상위), 20(높음), 30(보통), 40(낮음)</p><p><strong>코드 비활성화:</strong><br/>더 이상 사용하지 않는 코드는 삭제 대신 비활성화하세요:<br/>1. 코드 편집에서 ''활성'' 체크박스를 해제<br/>2. 비활성 코드는 새로운 데이터 입력 시 선택할 수 없습니다<br/>3. 기존 데이터는 유지되므로 과거 기록을 보존할 수 있습니다</p><p><strong>코드 삭제:</strong><br/>1. 해당 코드를 사용하는 데이터가 없는지 먼저 확인<br/>2. 체크박스를 선택하고 <strong>삭제</strong> 버튼 클릭<br/>3. 시스템 필수 코드는 삭제할 수 없습니다</p><p><strong>⚠️ 권장사항:</strong> 가능하면 삭제 대신 비활성화를 사용하세요.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "코드 활용 및 모범 사례",
            "content": "<p><strong>코드 사용 예시:</strong><br/>• <strong>드롭다운 목록:</strong> 사용자 선택 옵션 (언어, 상태, 유형 등)<br/>• <strong>필터링:</strong> 데이터 검색 조건<br/>• <strong>상태 관리:</strong> 데이터의 라이프사이클 표현<br/>• <strong>분류:</strong> 데이터 카테고리 구분</p><p><strong>코드 설계 원칙:</strong><br/>• <strong>명확성:</strong> 코드 값만 봐도 의미를 알 수 있도록<br/>• <strong>일관성:</strong> 비슷한 코드는 같은 패턴 사용<br/>• <strong>확장성:</strong> 나중에 추가될 값을 고려하여 설계<br/>• <strong>간결성:</strong> 너무 많은 코드 타입은 관리가 어려움</p><p><strong>성능 최적화:</strong><br/>• 자주 사용되는 코드는 캐싱됩니다<br/>• 불필요한 코드는 비활성화하여 성능 향상<br/>• 코드 개수는 타입당 50개 이하 권장</p><p><strong>💡 팁:</strong><br/>• 엑셀로 내보내기하여 전체 코드 현황 파악<br/>• 정기적으로 사용하지 않는 코드 정리<br/>• 코드 변경 시 영향 범위 사전 확인</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-CODE-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📋 Code Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Manage common codes used throughout the system. Centrally manage codes used in various places such as dropdown lists, status values, and categories to maintain data consistency and ease maintenance.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #38b2ac;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Data Consistency:</strong> Ensure data integrity by using the same code values across the system</li>
            <li><strong>Easy Maintenance:</strong> Change code values in one place and they reflect everywhere</li>
            <li><strong>Multi-language Support:</strong> Display the same code in multiple languages</li>
            <li><strong>Flexible Extension:</strong> Easily add new code types and values</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Deleting codes in use may cause problems with related data</li>
            <li>Code values cannot be changed once created, so set them carefully</li>
            <li>Changing code order will change the display order in dropdown lists</li>
            <li>System-required codes cannot be deleted</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Code Structure",
            "content": "<p><strong>Code Type:</strong> A parent category that groups related codes. For example, ''LANGUAGE'' is a group of language-related codes.</p><p><strong>Code Value:</strong> The actual value stored in the database. Examples: ''ko'', ''en'', ''zh''</p><p><strong>Code Name:</strong> The name displayed to users. Supports multiple languages, allowing different names for each language.</p><p><strong>Sort Order:</strong> Determines the display order in dropdowns or lists. Lower numbers display first.</p><p><strong>Example:</strong><br/>• Code Type: LANGUAGE<br/>• Code Value: ko → Code Name: 한국어 (Korean, 韩语, Tiếng Hàn)<br/>• Code Value: en → Code Name: 영어 (English, 英语, Tiếng Anh)</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Code Types",
            "content": "<p><strong>Step 1: Plan the Code Type</strong><br/>Review whether a new code type is necessary:<br/>• Can you extend an existing code type?<br/>• Do you need 3 or more fixed values?<br/>• Will it be reused in multiple places?</p><p><strong>Step 2: Create Code Type</strong><br/>1. Click the <strong>Add</strong> button<br/>2. <strong>Code Type:</strong> Use uppercase letters and underscores (e.g., USER_STATUS, ORDER_TYPE)<br/>3. <strong>Code Type Name:</strong> Enter in Korean, English, etc. (e.g., User Status)<br/>4. <strong>Description:</strong> Clearly describe the purpose of this code type</p><p><strong>Step 3: Add Code Values</strong><br/>After creating the code type, add individual code values belonging to that type.</p><p><strong>💡 Naming Conventions:</strong><br/>• Code Type: All uppercase, words separated by underscores<br/>• Use short, clear names<br/>• Use domain terminology (e.g., ORDER_STATUS, PAYMENT_METHOD)</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Adding and Modifying Code Values",
            "content": "<p><strong>Adding Code Values:</strong><br/>1. Select a code type<br/>2. Click the <strong>Add Code</strong> button<br/>3. <strong>Code Value:</strong> Value to use in the system (e.g., ACTIVE, PENDING, INACTIVE)<br/>4. <strong>Code Name:</strong> Enter the name to display to users in each language<br/>5. <strong>Sort Order:</strong> Specify display order (increments of 10, 20, 30... recommended)<br/>6. <strong>Active Status:</strong> Set whether this code is currently usable</p><p><strong>Modifying Code Values:</strong><br/>1. Find the code to modify and click the <strong>Edit</strong> icon<br/>2. Modify code name, description, sort order, active status<br/>3. The code value itself cannot be changed</p><p><strong>Multi-language Input:</strong><br/>• Korean: Enter clearly in Hangul<br/>• English: Enter in English<br/>• Chinese, Vietnamese: Enter if needed<br/>• At minimum, Korean and English are required</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Managing Code Order and Activation",
            "content": "<p><strong>Changing Display Order:</strong><br/>1. Change the ''Sort Order'' value in the code edit screen<br/>2. Lower numbers display first<br/>3. Setting in increments of 10 makes it easier to insert codes later<br/>4. Example: 10(Top), 20(High), 30(Medium), 40(Low)</p><p><strong>Deactivating Codes:</strong><br/>For codes no longer in use, deactivate instead of deleting:<br/>1. Uncheck the ''Active'' checkbox in code editing<br/>2. Inactive codes cannot be selected when entering new data<br/>3. Existing data is preserved, maintaining historical records</p><p><strong>Deleting Codes:</strong><br/>1. First verify there is no data using this code<br/>2. Select checkbox and click <strong>Delete</strong> button<br/>3. System-required codes cannot be deleted</p><p><strong>⚠️ Recommendation:</strong> Use deactivation instead of deletion when possible.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Code Usage and Best Practices",
            "content": "<p><strong>Code Usage Examples:</strong><br/>• <strong>Dropdown Lists:</strong> User selection options (language, status, type, etc.)<br/>• <strong>Filtering:</strong> Data search criteria<br/>• <strong>Status Management:</strong> Represent data lifecycle<br/>• <strong>Classification:</strong> Data category distinction</p><p><strong>Code Design Principles:</strong><br/>• <strong>Clarity:</strong> Code value should convey meaning at a glance<br/>• <strong>Consistency:</strong> Similar codes use the same pattern<br/>• <strong>Extensibility:</strong> Design considering values to be added later<br/>• <strong>Simplicity:</strong> Too many code types are hard to manage</p><p><strong>Performance Optimization:</strong><br/>• Frequently used codes are cached<br/>• Deactivate unnecessary codes for better performance<br/>• Recommended to keep codes under 50 per type</p><p><strong>💡 Tips:</strong><br/>• Export to Excel to review overall code status<br/>• Regularly clean up unused codes<br/>• Verify impact scope before code changes</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-CODE-MGMT' AND language = 'en';

-- 6. PROG-MESSAGE-MGMT - Message Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">💬 메시지 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템에서 사용자에게 표시되는 모든 메시지를 중앙에서 관리합니다. 오류 메시지, 안내 메시지, 확인 메시지 등을 다국어로 관리하여 일관성 있고 이해하기 쉬운 사용자 경험을 제공합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #f56565; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f56565;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>일관성 있는 메시지:</strong> 전체 시스템에서 통일된 메시지 스타일과 톤을 유지합니다</li>
            <li><strong>다국어 지원:</strong> 여러 언어로 메시지를 제공하여 글로벌 사용자를 지원합니다</li>
            <li><strong>쉬운 번역:</strong> 개발자가 아닌 번역가도 메시지를 수정할 수 있습니다</li>
            <li><strong>빠른 수정:</strong> 코드 수정 없이 메시지를 즉시 변경할 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>메시지 키는 변경할 수 없으므로 신중하게 설정하세요</li>
            <li>오류 메시지는 사용자가 이해하기 쉬운 언어로 작성하세요</li>
            <li>메시지에 변수({0}, {1})가 있다면 모든 언어에서 동일하게 사용해야 합니다</li>
            <li>메시지 변경 후에는 반드시 테스트하세요</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "메시지 유형 이해하기",
            "content": "<p><strong>메시지 분류:</strong></p><p><strong>1. 오류 메시지 (ERROR):</strong><br/>• 작업 실패 시 표시되는 메시지<br/>• 예: ''사용자를 찾을 수 없습니다'', ''필수 항목을 입력하세요''<br/>• 명확하고 구체적으로 작성하여 사용자가 문제를 이해할 수 있도록 합니다</p><p><strong>2. 안내 메시지 (INFO):</strong><br/>• 사용자에게 정보를 제공하는 메시지<br/>• 예: ''데이터가 성공적으로 저장되었습니다'', ''로그인되었습니다''<br/>• 긍정적이고 친절한 톤으로 작성합니다</p><p><strong>3. 경고 메시지 (WARNING):</strong><br/>• 주의가 필요한 상황을 알리는 메시지<br/>• 예: ''이 작업은 되돌릴 수 없습니다'', ''세션이 곧 만료됩니다''</p><p><strong>4. 확인 메시지 (CONFIRM):</strong><br/>• 사용자의 확인이 필요한 메시지<br/>• 예: ''정말로 삭제하시겠습니까?'', ''변경사항을 저장하시겠습니까?''</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 메시지 추가하기",
            "content": "<p><strong>1단계: 메시지 키 설정</strong><br/>1. <strong>추가</strong> 버튼을 클릭합니다<br/>2. <strong>메시지 키:</strong> 고유한 식별자 (예: error.user.notFound, msg.save.success)<br/>3. 명명 규칙: 타입.모듈.설명 형식 권장</p><p><strong>2단계: 메시지 내용 입력</strong><br/>1. <strong>한국어:</strong> 한글로 메시지 작성<br/>2. <strong>영어:</strong> 영문으로 메시지 작성<br/>3. <strong>중국어, 베트남어:</strong> 필요시 입력</p><p><strong>3단계: 메시지 유형 선택</strong><br/>1. ERROR, INFO, WARNING, CONFIRM 중 선택<br/>2. 유형에 따라 표시 스타일이 달라집니다</p><p><strong>4단계: 변수 사용 (선택사항)</strong><br/>메시지에 동적 값을 넣으려면:<br/>• 한국어: ''{0}님의 데이터가 삭제되었습니다''<br/>• 영어: ''{0}''s data has been deleted''<br/>• 시스템이 {0}을 실제 값으로 교체합니다</p><p><strong>💡 변수 사용 예시:</strong><br/>• {0}: 첫 번째 변수<br/>• {1}: 두 번째 변수<br/>• 모든 언어에서 같은 순서로 사용해야 합니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "메시지 작성 가이드",
            "content": "<p><strong>효과적인 메시지 작성 원칙:</strong></p><p><strong>1. 명확성:</strong><br/>• 무엇이 문제인지 명확하게 설명<br/>• 나쁜 예: ''오류가 발생했습니다''<br/>• 좋은 예: ''이메일 형식이 올바르지 않습니다''</p><p><strong>2. 실행 가능성:</strong><br/>• 사용자가 무엇을 해야 하는지 알려주기<br/>• 나쁜 예: ''로그인 실패''<br/>• 좋은 예: ''비밀번호가 일치하지 않습니다. 다시 입력해주세요''</p><p><strong>3. 친절한 톤:</strong><br/>• 비난하지 않고 도움을 주는 톤<br/>• 나쁜 예: ''잘못된 입력''<br/>• 좋은 예: ''필수 항목을 입력해주세요''</p><p><strong>4. 간결성:</strong><br/>• 핵심만 전달하되, 필요한 정보는 모두 포함<br/>• 한 문장 또는 두 문장으로 제한</p><p><strong>5. 일관성:</strong><br/>• 비슷한 상황에는 비슷한 메시지 사용<br/>• 전체 시스템에서 통일된 스타일 유지</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "메시지 번역 관리",
            "content": "<p><strong>번역 작업 프로세스:</strong><br/>1. 한국어 메시지를 먼저 작성합니다<br/>2. 영어로 번역합니다 (필수)<br/>3. 필요시 중국어, 베트남어로 번역합니다<br/>4. 각 언어의 문화적 뉘앙스를 고려합니다</p><p><strong>번역 시 주의사항:</strong><br/>• 직역보다는 의역으로 자연스럽게<br/>• 각 언어의 문법 구조에 맞게 조정<br/>• 변수 위치는 언어별로 다를 수 있음<br/>• 예: ''사용자 {0}명'' → ''{0} users''</p><p><strong>번역 품질 관리:</strong><br/>1. 네이티브 스피커에게 검토 요청<br/>2. 실제 화면에서 메시지 길이 확인<br/>3. 문맥에 맞는지 테스트<br/>4. 오타나 문법 오류 확인</p><p><strong>💡 팁:</strong><br/>• 엑셀로 내보내기하여 번역가에게 전달<br/>• 번역 완료 후 일괄 업로드<br/>• 번역 용어집을 별도로 관리</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "메시지 테스트 및 유지보수",
            "content": "<p><strong>메시지 테스트:</strong><br/>1. 각 언어로 전환하여 메시지 확인<br/>2. 변수가 제대로 치환되는지 테스트<br/>3. 메시지 길이가 UI에 맞는지 확인<br/>4. 모바일 화면에서도 잘 보이는지 검증</p><p><strong>메시지 검색:</strong><br/>• 메시지 키나 내용으로 빠르게 검색<br/>• 특정 모듈의 메시지만 필터링<br/>• 미번역 메시지 찾기</p><p><strong>일괄 수정:</strong><br/>1. 엑셀로 내보내기<br/>2. 스프레드시트에서 편집<br/>3. 다시 가져오기 기능으로 업로드</p><p><strong>버전 관리:</strong><br/>• 메시지 변경 이력을 기록<br/>• 이전 버전으로 롤백 가능<br/>• 변경 사항을 정기적으로 백업</p><p><strong>성능 최적화:</strong><br/>• 메시지는 자동으로 캐싱됨<br/>• 자주 사용되는 메시지 우선 로드<br/>• 사용하지 않는 메시지 정리</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-MESSAGE-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">💬 Message Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Centrally manage all messages displayed to users in the system. Manage error messages, information messages, and confirmation messages in multiple languages to provide a consistent and easy-to-understand user experience.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #f56565; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f56565;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Consistent Messages:</strong> Maintain unified message style and tone across the system</li>
            <li><strong>Multi-language Support:</strong> Provide messages in multiple languages for global users</li>
            <li><strong>Easy Translation:</strong> Translators, not just developers, can modify messages</li>
            <li><strong>Quick Updates:</strong> Change messages instantly without code modifications</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Message keys cannot be changed, so set them carefully</li>
            <li>Write error messages in language users can easily understand</li>
            <li>If messages have variables ({0}, {1}), use them identically in all languages</li>
            <li>Always test after changing messages</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Message Types",
            "content": "<p><strong>Message Classification:</strong></p><p><strong>1. Error Messages (ERROR):</strong><br/>• Messages displayed when operations fail<br/>• Examples: ''User not found'', ''Please enter required fields''<br/>• Write clearly and specifically so users understand the problem</p><p><strong>2. Information Messages (INFO):</strong><br/>• Messages providing information to users<br/>• Examples: ''Data saved successfully'', ''You are logged in''<br/>• Write in positive and friendly tone</p><p><strong>3. Warning Messages (WARNING):</strong><br/>• Messages alerting to situations requiring attention<br/>• Examples: ''This action cannot be undone'', ''Session will expire soon''</p><p><strong>4. Confirmation Messages (CONFIRM):</strong><br/>• Messages requiring user confirmation<br/>• Examples: ''Do you really want to delete?'', ''Save changes?''</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Messages",
            "content": "<p><strong>Step 1: Set Message Key</strong><br/>1. Click the <strong>Add</strong> button<br/>2. <strong>Message Key:</strong> Unique identifier (e.g., error.user.notFound, msg.save.success)<br/>3. Naming convention: type.module.description format recommended</p><p><strong>Step 2: Enter Message Content</strong><br/>1. <strong>Korean:</strong> Write message in Korean<br/>2. <strong>English:</strong> Write message in English<br/>3. <strong>Chinese, Vietnamese:</strong> Enter if needed</p><p><strong>Step 3: Select Message Type</strong><br/>1. Choose from ERROR, INFO, WARNING, CONFIRM<br/>2. Display style varies by type</p><p><strong>Step 4: Use Variables (Optional)</strong><br/>To insert dynamic values in messages:<br/>• Korean: ''{0}님의 데이터가 삭제되었습니다''<br/>• English: ''{0}''s data has been deleted''<br/>• System replaces {0} with actual value</p><p><strong>💡 Variable Usage Examples:</strong><br/>• {0}: First variable<br/>• {1}: Second variable<br/>• Must use same order in all languages</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Message Writing Guidelines",
            "content": "<p><strong>Principles for Writing Effective Messages:</strong></p><p><strong>1. Clarity:</strong><br/>• Clearly explain what the problem is<br/>• Bad: ''An error occurred''<br/>• Good: ''Email format is invalid''</p><p><strong>2. Actionability:</strong><br/>• Tell users what they should do<br/>• Bad: ''Login failed''<br/>• Good: ''Password does not match. Please try again''</p><p><strong>3. Friendly Tone:</strong><br/>• Helpful tone without blaming<br/>• Bad: ''Invalid input''<br/>• Good: ''Please enter required fields''</p><p><strong>4. Brevity:</strong><br/>• Deliver only the essentials, but include all necessary information<br/>• Limit to one or two sentences</p><p><strong>5. Consistency:</strong><br/>• Use similar messages for similar situations<br/>• Maintain unified style across entire system</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Managing Message Translation",
            "content": "<p><strong>Translation Workflow:</strong><br/>1. Write Korean message first<br/>2. Translate to English (required)<br/>3. Translate to Chinese, Vietnamese if needed<br/>4. Consider cultural nuances of each language</p><p><strong>Translation Precautions:</strong><br/>• Localize naturally rather than literal translation<br/>• Adjust to fit grammar structure of each language<br/>• Variable positions may differ by language<br/>• Example: ''사용자 {0}명'' → ''{0} users''</p><p><strong>Translation Quality Control:</strong><br/>1. Request review from native speakers<br/>2. Check message length on actual screen<br/>3. Test if it fits the context<br/>4. Check for typos or grammar errors</p><p><strong>💡 Tips:</strong><br/>• Export to Excel and send to translators<br/>• Bulk upload after translation complete<br/>• Maintain separate translation glossary</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Message Testing and Maintenance",
            "content": "<p><strong>Testing Messages:</strong><br/>1. Switch to each language and verify messages<br/>2. Test if variables are properly substituted<br/>3. Verify message length fits UI<br/>4. Validate it displays well on mobile screens</p><p><strong>Searching Messages:</strong><br/>• Quickly search by message key or content<br/>• Filter messages from specific modules<br/>• Find untranslated messages</p><p><strong>Bulk Editing:</strong><br/>1. Export to Excel<br/>2. Edit in spreadsheet<br/>3. Upload with import function</p><p><strong>Version Control:</strong><br/>• Record message change history<br/>• Rollback to previous version possible<br/>• Regularly backup changes</p><p><strong>Performance Optimization:</strong><br/>• Messages are automatically cached<br/>• Frequently used messages loaded first<br/>• Clean up unused messages</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-MESSAGE-MGMT' AND language = 'en';

-- Note: Continuing with remaining programs...
-- Due to length, creating in batches. This covers CODE-MGMT and MESSAGE-MGMT.
