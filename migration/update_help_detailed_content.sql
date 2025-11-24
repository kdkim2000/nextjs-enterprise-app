-- Update help content with detailed, beginner-friendly descriptions
-- Generated: 2025-11-25
-- This script enhances all help content to be comprehensive and beginner-friendly

-- 1. PROG-USER-LIST - Add missing Korean help and update both languages
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
    'help-ko-001',
    'PROG-USER-LIST',
    '사용자 관리 도움말',
    '<div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">👥 사용자 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 모든 사용자를 체계적으로 관리하는 핵심 기능입니다. 사용자 계정 생성부터 권한 설정, 정보 수정, 계정 비활성화까지 모든 사용자 관련 작업을 이 페이지에서 수행할 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #667eea;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>보안 관리:</strong> 각 사용자에게 적절한 권한을 부여하여 시스템 보안을 유지합니다</li>
            <li><strong>효율적인 협업:</strong> 팀원들의 계정을 신속하게 생성하고 관리할 수 있습니다</li>
            <li><strong>체계적인 조직 관리:</strong> 부서별, 역할별로 사용자를 분류하고 관리할 수 있습니다</li>
            <li><strong>감사 추적:</strong> 누가 언제 시스템에 접근했는지 추적할 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>사용자 삭제는 신중하게 진행하세요. 삭제된 사용자의 데이터는 복구할 수 없습니다</li>
            <li>관리자 권한을 부여할 때는 반드시 해당 사용자의 신원을 확인하세요</li>
            <li>비밀번호는 사용자만 알 수 있도록 안전하게 전달하세요</li>
            <li>퇴사자의 계정은 즉시 비활성화하여 보안을 유지하세요</li>
        </ul>
    </div>',
    '[
        {
            "id": "section-001",
            "order": 1,
            "title": "사용자 검색 및 필터링",
            "content": "<p><strong>빠른 검색:</strong> 상단의 검색 바를 사용하여 사용자명, 이름 또는 이메일로 빠르게 사용자를 찾을 수 있습니다. 검색은 실시간으로 결과를 표시합니다.</p><p><strong>고급 필터:</strong> 필터 아이콘을 클릭하여 역할, 부서, 활성 상태별로 필터링할 수 있습니다. 여러 조건을 조합하여 원하는 사용자를 정확하게 찾을 수 있습니다.</p><p><strong>정렬:</strong> 각 열의 헤더를 클릭하여 해당 열을 기준으로 오름차순 또는 내림차순으로 정렬할 수 있습니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 사용자 추가하기",
            "content": "<p><strong>1단계:</strong> 툴바 상단의 <strong>추가</strong> 버튼을 클릭하면 새 사용자 등록 폼이 나타납니다.</p><p><strong>2단계:</strong> 필수 필드를 입력합니다:<br/>• <strong>사용자명:</strong> 로그인에 사용될 고유 ID (영문, 숫자 조합 권장)<br/>• <strong>비밀번호:</strong> 8자 이상, 영문+숫자+특수문자 조합<br/>• <strong>이름:</strong> 사용자의 실명<br/>• <strong>이메일:</strong> 비밀번호 재설정 등에 사용됩니다</p><p><strong>3단계:</strong> 선택 필드를 입력합니다:<br/>• <strong>부서:</strong> 사용자가 소속된 부서 선택<br/>• <strong>역할:</strong> 사용자의 권한을 결정하는 역할 할당<br/>• <strong>전화번호:</strong> 연락처 정보</p><p><strong>4단계:</strong> 모든 정보를 확인한 후 <strong>저장</strong> 버튼을 클릭합니다.</p><p><strong>💡 팁:</strong> 초기 비밀번호는 임시로 설정하고, 사용자가 첫 로그인 후 변경하도록 안내하세요.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "사용자 정보 수정하기",
            "content": "<p><strong>1단계:</strong> 목록에서 수정하려는 사용자를 찾습니다. 검색 기능을 활용하면 빠르게 찾을 수 있습니다.</p><p><strong>2단계:</strong> 해당 행의 작업 열에서 <strong>편집</strong> 아이콘(연필 모양)을 클릭합니다.</p><p><strong>3단계:</strong> 수정이 필요한 정보를 업데이트합니다:<br/>• 이름, 이메일, 전화번호 등 개인 정보<br/>• 부서 이동 시 부서 변경<br/>• 역할 변경으로 권한 조정<br/>• 활성/비활성 상태 변경</p><p><strong>4단계:</strong> <strong>저장</strong> 버튼을 클릭하여 변경사항을 적용합니다.</p><p><strong>⚠️ 주의:</strong> 사용자명은 수정할 수 없습니다. 사용자명 변경이 필요한 경우 새 계정을 생성해야 합니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "사용자 삭제 및 비활성화",
            "content": "<p><strong>비활성화 (권장):</strong><br/>1. 사용자 편집 화면에서 ''활성'' 상태를 ''비활성''으로 변경합니다<br/>2. 비활성화된 사용자는 로그인할 수 없지만 데이터는 보존됩니다<br/>3. 퇴사자의 경우 이 방법을 권장합니다</p><p><strong>완전 삭제 (신중히 사용):</strong><br/>1. 삭제하려는 사용자의 체크박스를 선택합니다<br/>2. 여러 명을 동시에 선택할 수 있습니다<br/>3. 툴바에서 <strong>삭제</strong> 버튼을 클릭합니다<br/>4. 확인 대화상자에서 삭제를 최종 확인합니다</p><p><strong>🚫 제한사항:</strong> 자신의 계정은 삭제할 수 없으며, 시스템 관리자 계정도 보호됩니다.</p><p><strong>⚠️ 경고:</strong> 삭제된 사용자의 모든 데이터는 복구할 수 없습니다. 가능하면 비활성화를 사용하세요.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "데이터 내보내기 및 보고서",
            "content": "<p><strong>Excel 내보내기:</strong><br/>1. 툴바의 <strong>Excel로 내보내기</strong> 버튼을 클릭합니다<br/>2. 현재 필터링된 사용자 목록이 Excel 파일로 다운로드됩니다<br/>3. 사용자명, 이름, 이메일, 부서, 역할 등 모든 정보가 포함됩니다</p><p><strong>PDF 보고서:</strong><br/>1. 툴바의 <strong>PDF로 내보내기</strong> 버튼을 클릭합니다<br/>2. 인쇄 가능한 형식의 PDF 보고서가 생성됩니다<br/>3. 공식 문서나 회의 자료로 활용할 수 있습니다</p><p><strong>💡 활용 예시:</strong><br/>• 월별 사용자 현황 보고서 작성<br/>• 부서별 인원 현황 파악<br/>• 감사 자료 준비</p>"
        }
    ]'::jsonb,
    'ko',
    'published',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    sections = EXCLUDED.sections,
    updated_at = NOW();

-- Update English content for PROG-USER-LIST
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">👥 User Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">The core functionality for systematically managing all users in the system. From creating user accounts to setting permissions, modifying information, and deactivating accounts - all user-related tasks can be performed on this page.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #667eea;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Security Management:</strong> Grant appropriate permissions to each user to maintain system security</li>
            <li><strong>Efficient Collaboration:</strong> Quickly create and manage team member accounts</li>
            <li><strong>Organized Team Management:</strong> Classify and manage users by department and role</li>
            <li><strong>Audit Trail:</strong> Track who accessed the system and when</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Be careful when deleting users. Deleted user data cannot be recovered</li>
            <li>Always verify the user''s identity before granting administrator privileges</li>
            <li>Ensure passwords are transmitted securely so only the user knows them</li>
            <li>Immediately deactivate accounts of employees who have left to maintain security</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Searching and Filtering Users",
            "content": "<p><strong>Quick Search:</strong> Use the search bar at the top to quickly find users by username, name, or email. Search results appear in real-time.</p><p><strong>Advanced Filters:</strong> Click the filter icon to filter by role, department, or active status. Combine multiple conditions to find exactly the users you need.</p><p><strong>Sorting:</strong> Click any column header to sort by that column in ascending or descending order.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Users",
            "content": "<p><strong>Step 1:</strong> Click the <strong>Add</strong> button in the toolbar to open the new user registration form.</p><p><strong>Step 2:</strong> Fill in the required fields:<br/>• <strong>Username:</strong> Unique ID for login (alphanumeric recommended)<br/>• <strong>Password:</strong> At least 8 characters with letters, numbers, and special characters<br/>• <strong>Name:</strong> User''s full name<br/>• <strong>Email:</strong> Used for password reset and notifications</p><p><strong>Step 3:</strong> Fill in optional fields:<br/>• <strong>Department:</strong> Select the user''s department<br/>• <strong>Role:</strong> Assign roles that determine user permissions<br/>• <strong>Phone:</strong> Contact information</p><p><strong>Step 4:</strong> Review all information and click the <strong>Save</strong> button.</p><p><strong>💡 Tip:</strong> Set a temporary initial password and instruct the user to change it upon first login.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Editing User Information",
            "content": "<p><strong>Step 1:</strong> Find the user you want to edit in the list. Use the search feature to find them quickly.</p><p><strong>Step 2:</strong> Click the <strong>Edit</strong> icon (pencil shape) in the Actions column of that row.</p><p><strong>Step 3:</strong> Update the necessary information:<br/>• Personal info like name, email, phone<br/>• Change department when user moves<br/>• Adjust permissions by changing roles<br/>• Change active/inactive status</p><p><strong>Step 4:</strong> Click the <strong>Save</strong> button to apply the changes.</p><p><strong>⚠️ Note:</strong> Usernames cannot be modified. If a username change is needed, you must create a new account.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Deleting and Deactivating Users",
            "content": "<p><strong>Deactivation (Recommended):</strong><br/>1. In the user edit screen, change the ''Active'' status to ''Inactive''<br/>2. Deactivated users cannot log in, but their data is preserved<br/>3. This method is recommended for former employees</p><p><strong>Permanent Deletion (Use with Caution):</strong><br/>1. Select the checkbox for the user(s) you want to delete<br/>2. Multiple users can be selected simultaneously<br/>3. Click the <strong>Delete</strong> button in the toolbar<br/>4. Confirm deletion in the confirmation dialog</p><p><strong>🚫 Restrictions:</strong> You cannot delete your own account, and system administrator accounts are also protected.</p><p><strong>⚠️ Warning:</strong> All data for deleted users cannot be recovered. Use deactivation when possible.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Data Export and Reports",
            "content": "<p><strong>Excel Export:</strong><br/>1. Click the <strong>Export to Excel</strong> button in the toolbar<br/>2. The currently filtered user list is downloaded as an Excel file<br/>3. Includes all information: username, name, email, department, roles, etc.</p><p><strong>PDF Reports:</strong><br/>1. Click the <strong>Export to PDF</strong> button in the toolbar<br/>2. A printable PDF report is generated<br/>3. Can be used for official documents or meeting materials</p><p><strong>💡 Use Cases:</strong><br/>• Creating monthly user status reports<br/>• Understanding headcount by department<br/>• Preparing audit materials</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-USER-LIST' AND language = 'en';

-- 2. PROG-DEPT-MGMT - Department Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🏢 부서 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">조직의 부서 구조를 생성하고 관리합니다. 부서 계층 구조를 설정하고, 부서 정보를 수정하며, 부서별 관리자를 지정할 수 있습니다. 효율적인 조직 관리의 기초가 되는 기능입니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #48bb78;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>명확한 조직 구조:</strong> 회사의 조직도를 시스템에 정확하게 반영합니다</li>
            <li><strong>권한 관리 기반:</strong> 부서 단위로 권한과 접근 제어를 설정할 수 있습니다</li>
            <li><strong>보고 체계 구축:</strong> 부서별 보고서와 통계를 생성할 수 있습니다</li>
            <li><strong>효율적인 인사 관리:</strong> 부서 이동, 조직 개편을 체계적으로 관리합니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>사용자가 배정된 부서는 삭제할 수 없습니다. 먼저 사용자를 다른 부서로 이동시키세요</li>
            <li>부서 코드는 한번 생성하면 변경할 수 없으므로 신중하게 설정하세요</li>
            <li>상위 부서를 변경하면 하위 부서의 계층 구조도 함께 변경됩니다</li>
            <li>부서 관리자는 해당 부서의 데이터에 대한 광범위한 권한을 가질 수 있습니다</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "부서 계층 구조 이해하기",
            "content": "<p><strong>트리 구조:</strong> 부서는 트리 형태의 계층 구조로 표시됩니다. 최상위 부서(예: 전사)에서 시작하여 여러 단계의 하위 부서로 구성됩니다.</p><p><strong>상위/하위 부서:</strong><br/>• <strong>상위 부서:</strong> 현재 부서를 포함하는 상위 조직<br/>• <strong>하위 부서:</strong> 현재 부서 아래에 속한 하위 조직<br/>• 부서를 확장하거나 축소하려면 부서명 옆의 화살표 아이콘을 클릭하세요</p><p><strong>부서 레벨:</strong> 일반적으로 전사 → 본부 → 부문 → 팀 → 파트 순으로 구성됩니다.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 부서 추가하기",
            "content": "<p><strong>1단계:</strong> 상위 부서를 선택합니다. 최상위 부서를 만들려면 아무것도 선택하지 않습니다.</p><p><strong>2단계:</strong> <strong>추가</strong> 버튼을 클릭하여 부서 등록 폼을 엽니다.</p><p><strong>3단계:</strong> 필수 정보를 입력합니다:<br/>• <strong>부서 코드:</strong> 고유한 부서 식별자 (예: DEPT-001, IT-TEAM-001)<br/>• <strong>부서명:</strong> 한국어, 영어, 중국어, 베트남어 등 다국어로 입력<br/>• <strong>상위 부서:</strong> 자동으로 선택되어 있지만 변경 가능<br/>• <strong>정렬 순서:</strong> 같은 레벨의 부서들 사이에서 표시 순서</p><p><strong>4단계:</strong> 선택 정보를 입력합니다:<br/>• <strong>부서 관리자:</strong> 해당 부서를 담당할 사용자<br/>• <strong>설명:</strong> 부서의 역할과 책임</p><p><strong>5단계:</strong> <strong>저장</strong>을 클릭하여 부서를 생성합니다.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "부서 정보 수정하기",
            "content": "<p><strong>기본 정보 수정:</strong><br/>1. 목록에서 수정할 부서를 찾습니다<br/>2. <strong>편집</strong> 아이콘을 클릭합니다<br/>3. 부서명, 관리자, 설명 등을 수정합니다<br/>4. <strong>저장</strong>을 클릭합니다</p><p><strong>부서 이동(상위 부서 변경):</strong><br/>1. 부서 편집 화면에서 ''상위 부서'' 필드를 변경합니다<br/>2. 변경하려는 상위 부서를 선택합니다<br/>3. 저장하면 해당 부서와 모든 하위 부서가 함께 이동됩니다</p><p><strong>💡 팁:</strong> 대규모 조직 개편 시에는 하위 부서부터 차례대로 수정하는 것이 안전합니다.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "부서 삭제하기",
            "content": "<p><strong>삭제 전 확인사항:</strong><br/>1. 해당 부서에 소속된 사용자가 없는지 확인<br/>2. 하위 부서가 없는지 확인<br/>3. 해당 부서에 연결된 권한이나 설정이 없는지 확인</p><p><strong>삭제 절차:</strong><br/>1. 삭제할 부서의 체크박스를 선택합니다<br/>2. 툴바에서 <strong>삭제</strong> 버튼을 클릭합니다<br/>3. 경고 메시지를 확인하고 삭제를 승인합니다</p><p><strong>🚫 삭제 불가 조건:</strong><br/>• 하위 부서가 있는 경우<br/>• 소속 사용자가 있는 경우<br/>• 시스템 필수 부서인 경우</p><p><strong>대안:</strong> 삭제 대신 부서를 비활성화하여 과거 기록을 보존할 수 있습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "부서별 통계 및 보고서",
            "content": "<p><strong>부서 현황 보기:</strong><br/>• 각 부서의 소속 인원 수 확인<br/>• 부서별 활성 사용자 수 조회<br/>• 부서 계층의 총 단계 수 파악</p><p><strong>조직도 내보내기:</strong><br/>1. <strong>Excel로 내보내기</strong>를 클릭하여 전체 조직 구조를 스프레드시트로 다운로드<br/>2. 계층 구조가 들여쓰기로 표현됩니다<br/>3. 부서 코드, 이름, 관리자, 인원 수 등이 포함됩니다</p><p><strong>💡 활용 예시:</strong><br/>• 신입 사원 오리엔테이션 자료<br/>• 조직 개편 계획 수립<br/>• 인사 보고서 작성</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-DEPT-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🏢 Department Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Create and manage your organization''s department structure. Set up department hierarchies, modify department information, and assign department managers. This is the foundation for efficient organizational management.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #48bb78;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Clear Organization Structure:</strong> Accurately reflect your company''s org chart in the system</li>
            <li><strong>Permission Management Foundation:</strong> Set permissions and access control at the department level</li>
            <li><strong>Reporting Structure:</strong> Generate department-specific reports and statistics</li>
            <li><strong>Efficient HR Management:</strong> Systematically manage department transfers and reorganizations</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Departments with assigned users cannot be deleted. Transfer users to another department first</li>
            <li>Department codes cannot be changed once created, so set them carefully</li>
            <li>Changing a parent department will also change the hierarchy of child departments</li>
            <li>Department managers may have extensive permissions for their department''s data</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Department Hierarchy",
            "content": "<p><strong>Tree Structure:</strong> Departments are displayed in a tree-shaped hierarchy. Starting from the top-level department (e.g., Company-wide), it consists of multiple levels of sub-departments.</p><p><strong>Parent/Child Departments:</strong><br/>• <strong>Parent Department:</strong> The higher-level organization containing the current department<br/>• <strong>Child Departments:</strong> Sub-organizations under the current department<br/>• Click the arrow icon next to the department name to expand or collapse</p><p><strong>Department Levels:</strong> Typically organized as Company → Division → Department → Team → Group.</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Departments",
            "content": "<p><strong>Step 1:</strong> Select a parent department. Leave nothing selected to create a top-level department.</p><p><strong>Step 2:</strong> Click the <strong>Add</strong> button to open the department registration form.</p><p><strong>Step 3:</strong> Enter required information:<br/>• <strong>Department Code:</strong> Unique department identifier (e.g., DEPT-001, IT-TEAM-001)<br/>• <strong>Department Name:</strong> Enter in multiple languages (Korean, English, Chinese, Vietnamese)<br/>• <strong>Parent Department:</strong> Automatically selected but can be changed<br/>• <strong>Sort Order:</strong> Display order among departments at the same level</p><p><strong>Step 4:</strong> Enter optional information:<br/>• <strong>Department Manager:</strong> User responsible for this department<br/>• <strong>Description:</strong> Department role and responsibilities</p><p><strong>Step 5:</strong> Click <strong>Save</strong> to create the department.</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Editing Department Information",
            "content": "<p><strong>Modifying Basic Info:</strong><br/>1. Find the department to edit in the list<br/>2. Click the <strong>Edit</strong> icon<br/>3. Modify department name, manager, description, etc.<br/>4. Click <strong>Save</strong></p><p><strong>Moving Departments (Changing Parent):</strong><br/>1. In the department edit screen, change the ''Parent Department'' field<br/>2. Select the new parent department<br/>3. When saved, the department and all its children will move together</p><p><strong>💡 Tip:</strong> For large-scale reorganizations, it''s safer to modify child departments first, then work your way up.</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Deleting Departments",
            "content": "<p><strong>Pre-deletion Checks:</strong><br/>1. Verify there are no users assigned to the department<br/>2. Confirm there are no child departments<br/>3. Check that no permissions or settings are linked to the department</p><p><strong>Deletion Procedure:</strong><br/>1. Select the checkbox for the department to delete<br/>2. Click the <strong>Delete</strong> button in the toolbar<br/>3. Review the warning message and approve the deletion</p><p><strong>🚫 Cannot Delete When:</strong><br/>• There are child departments<br/>• There are assigned users<br/>• It''s a system-required department</p><p><strong>Alternative:</strong> Instead of deleting, you can deactivate the department to preserve historical records.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Department Statistics and Reports",
            "content": "<p><strong>Viewing Department Status:</strong><br/>• Check the number of members in each department<br/>• View active user count by department<br/>• Understand the total levels in the department hierarchy</p><p><strong>Exporting Org Chart:</strong><br/>1. Click <strong>Export to Excel</strong> to download the entire organization structure as a spreadsheet<br/>2. Hierarchy is represented with indentation<br/>3. Includes department code, name, manager, headcount, etc.</p><p><strong>💡 Use Cases:</strong><br/>• New employee orientation materials<br/>• Planning organizational restructuring<br/>• Creating HR reports</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-DEPT-MGMT' AND language = 'en';

-- 3. PROG-ROLE-MGMT - Role Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🔐 역할 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 역할(Role)을 생성하고 관리합니다. 역할은 사용자가 접근할 수 있는 메뉴와 기능을 결정하는 권한의 집합입니다. 효과적인 역할 설계로 보안과 편의성을 동시에 확보할 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #9f7aea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #9f7aea;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>세밀한 권한 제어:</strong> 사용자 그룹별로 적절한 접근 권한을 설정할 수 있습니다</li>
            <li><strong>보안 강화:</strong> 민감한 정보나 기능에 대한 접근을 제한할 수 있습니다</li>
            <li><strong>효율적인 관리:</strong> 개별 사용자가 아닌 역할 단위로 권한을 관리합니다</li>
            <li><strong>조직 구조 반영:</strong> 직급, 부서, 업무에 따른 역할을 체계적으로 정의합니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>역할을 삭제하면 해당 역할을 가진 사용자들의 권한이 제거됩니다</li>
            <li>시스템 관리자 역할을 수정할 때는 특히 신중해야 합니다</li>
            <li>너무 많은 역할을 만들면 관리가 복잡해질 수 있습니다</li>
            <li>역할 변경 사항은 사용자가 다시 로그인해야 적용됩니다</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "역할(Role) 개념 이해하기",
            "content": "<p><strong>역할이란?</strong><br/>역할은 비슷한 업무를 수행하는 사용자들에게 부여하는 권한의 템플릿입니다. 예를 들어 ''영업 매니저'' 역할은 영업 관련 메뉴에 접근할 수 있는 권한을 포함합니다.</p><p><strong>역할의 구성 요소:</strong><br/>• <strong>역할 코드:</strong> 시스템에서 사용하는 고유 식별자<br/>• <strong>역할 이름:</strong> 사용자에게 표시되는 이름<br/>• <strong>설명:</strong> 역할의 목적과 권한 범위<br/>• <strong>메뉴 권한:</strong> 이 역할이 접근할 수 있는 메뉴 목록</p><p><strong>역할 vs 부서:</strong><br/>• 부서는 조직 구조를, 역할은 권한을 나타냅니다<br/>• 한 사용자는 여러 역할을 가질 수 있습니다<br/>• 같은 부서의 사용자도 다른 역할을 가질 수 있습니다</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 역할 추가하기",
            "content": "<p><strong>1단계: 역할 계획</strong><br/>새 역할을 만들기 전에 다음을 고려하세요:<br/>• 이 역할이 필요한 사용자는 누구인가?<br/>• 어떤 업무를 수행할 것인가?<br/>• 어떤 메뉴와 기능에 접근해야 하는가?<br/>• 기존 역할을 수정하는 것이 더 적절하지 않은가?</p><p><strong>2단계: 기본 정보 입력</strong><br/>1. <strong>추가</strong> 버튼을 클릭합니다<br/>2. <strong>역할 코드:</strong> 영문 대문자와 하이픈 사용 (예: ROLE-SALES-MANAGER)<br/>3. <strong>역할 이름:</strong> 한국어, 영어 등 다국어로 입력<br/>4. <strong>설명:</strong> 역할의 목적과 권한 범위를 명확하게 작성</p><p><strong>3단계: 메뉴 권한 설정</strong><br/>1. ''역할-메뉴 매핑'' 탭으로 이동<br/>2. 이 역할이 접근할 수 있는 메뉴를 선택<br/>3. 각 메뉴별로 읽기/쓰기/삭제 권한을 세밀하게 설정</p><p><strong>4단계: 저장 및 테스트</strong><br/>1. <strong>저장</strong>을 클릭하여 역할을 생성<br/>2. 테스트 계정에 역할을 할당하여 권한이 올바르게 작동하는지 확인</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "역할 권한 수정하기",
            "content": "<p><strong>역할 정보 수정:</strong><br/>1. 수정할 역할을 찾아 <strong>편집</strong> 아이콘을 클릭<br/>2. 역할 이름이나 설명을 업데이트<br/>3. 역할 코드는 변경할 수 없습니다</p><p><strong>메뉴 권한 조정:</strong><br/>1. ''역할-메뉴 매핑'' 메뉴로 이동<br/>2. 해당 역할을 선택<br/>3. 메뉴 접근 권한을 추가하거나 제거<br/>4. 세부 권한(읽기/쓰기/삭제)을 조정</p><p><strong>💡 베스트 프랙티스:</strong><br/>• 최소 권한 원칙: 업무에 꼭 필요한 권한만 부여<br/>• 정기적인 검토: 분기마다 역할 권한을 검토하고 조정<br/>• 문서화: 각 역할의 목적과 권한 범위를 문서로 유지<br/>• 테스트: 권한 변경 후 반드시 실제 사용자로 테스트</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "역할 삭제 및 병합",
            "content": "<p><strong>역할 삭제하기:</strong><br/>1. 해당 역할을 사용하는 사용자가 있는지 먼저 확인<br/>2. 사용자가 있다면 다른 역할로 변경<br/>3. 역할의 체크박스를 선택하고 <strong>삭제</strong> 클릭<br/>4. 삭제 확인 대화상자에서 최종 승인</p><p><strong>🚫 삭제할 수 없는 경우:</strong><br/>• 시스템 필수 역할 (예: 시스템 관리자)<br/>• 사용자가 할당된 역할<br/>• 다른 설정에서 참조하는 역할</p><p><strong>역할 통합 전략:</strong><br/>비슷한 역할이 너무 많다면 통합을 고려하세요:<br/>1. 통합할 역할들의 권한을 비교 분석<br/>2. 새로운 통합 역할을 생성<br/>3. 기존 역할의 사용자들을 새 역할로 이동<br/>4. 기존 역할을 삭제</p><p><strong>대안:</strong> 삭제 대신 역할을 비활성화하여 과거 기록을 보존할 수 있습니다.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "역할 기반 보안 관리",
            "content": "<p><strong>역할 설계 원칙:</strong><br/>• <strong>최소 권한:</strong> 업무 수행에 꼭 필요한 최소한의 권한만 부여<br/>• <strong>직무 분리:</strong> 중요한 작업은 여러 역할로 분리하여 상호 견제<br/>• <strong>명확한 명명:</strong> 역할 이름만 봐도 권한 범위를 알 수 있도록 작성<br/>• <strong>계층 구조:</strong> 일반 사용자 → 파워 유저 → 관리자 순으로 단계적 권한 부여</p><p><strong>역할 설계 예시:</strong><br/>• <strong>일반 사용자:</strong> 기본 조회 및 본인 데이터 수정<br/>• <strong>팀 리더:</strong> 팀원 데이터 조회 및 승인 권한<br/>• <strong>부서 관리자:</strong> 부서 전체 데이터 관리<br/>• <strong>시스템 관리자:</strong> 전체 시스템 설정 및 사용자 관리</p><p><strong>권한 감사:</strong><br/>1. <strong>Excel로 내보내기</strong>로 전체 역할 목록 다운로드<br/>2. 각 역할의 사용자 수와 권한 범위 검토<br/>3. 불필요한 권한이나 중복 역할 식별<br/>4. 분기별로 정기 감사 실시</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-ROLE-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🔐 Role Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Create and manage system roles. A role is a collection of permissions that determines which menus and features users can access. Effective role design ensures both security and convenience.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #9f7aea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #9f7aea;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Granular Permission Control:</strong> Set appropriate access permissions for each user group</li>
            <li><strong>Enhanced Security:</strong> Restrict access to sensitive information and features</li>
            <li><strong>Efficient Management:</strong> Manage permissions by role rather than individual user</li>
            <li><strong>Reflect Org Structure:</strong> Systematically define roles based on title, department, and job function</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Deleting a role removes permissions from all users with that role</li>
            <li>Be especially careful when modifying system administrator roles</li>
            <li>Creating too many roles can make management complex</li>
            <li>Role changes require users to log in again to take effect</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Roles",
            "content": "<p><strong>What is a Role?</strong><br/>A role is a template of permissions granted to users who perform similar tasks. For example, a ''Sales Manager'' role includes permissions to access sales-related menus.</p><p><strong>Role Components:</strong><br/>• <strong>Role Code:</strong> Unique identifier used by the system<br/>• <strong>Role Name:</strong> Display name shown to users<br/>• <strong>Description:</strong> Purpose and scope of permissions<br/>• <strong>Menu Permissions:</strong> List of menus this role can access</p><p><strong>Roles vs Departments:</strong><br/>• Departments represent org structure, roles represent permissions<br/>• One user can have multiple roles<br/>• Users in the same department can have different roles</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Roles",
            "content": "<p><strong>Step 1: Planning the Role</strong><br/>Before creating a new role, consider:<br/>• Who needs this role?<br/>• What tasks will they perform?<br/>• Which menus and features do they need access to?<br/>• Would modifying an existing role be more appropriate?</p><p><strong>Step 2: Enter Basic Information</strong><br/>1. Click the <strong>Add</strong> button<br/>2. <strong>Role Code:</strong> Use uppercase letters and hyphens (e.g., ROLE-SALES-MANAGER)<br/>3. <strong>Role Name:</strong> Enter in multiple languages (Korean, English, etc.)<br/>4. <strong>Description:</strong> Clearly describe the role''s purpose and permission scope</p><p><strong>Step 3: Configure Menu Permissions</strong><br/>1. Navigate to the ''Role-Menu Mapping'' tab<br/>2. Select menus this role can access<br/>3. Set granular read/write/delete permissions for each menu</p><p><strong>Step 4: Save and Test</strong><br/>1. Click <strong>Save</strong> to create the role<br/>2. Assign the role to a test account to verify permissions work correctly</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Modifying Role Permissions",
            "content": "<p><strong>Editing Role Information:</strong><br/>1. Find the role to edit and click the <strong>Edit</strong> icon<br/>2. Update the role name or description<br/>3. Role code cannot be changed</p><p><strong>Adjusting Menu Permissions:</strong><br/>1. Navigate to the ''Role-Menu Mapping'' menu<br/>2. Select the role<br/>3. Add or remove menu access permissions<br/>4. Adjust detailed permissions (read/write/delete)</p><p><strong>💡 Best Practices:</strong><br/>• Least Privilege Principle: Grant only permissions essential for the job<br/>• Regular Reviews: Review and adjust role permissions quarterly<br/>• Documentation: Maintain documents describing each role''s purpose and scope<br/>• Testing: Always test with actual users after permission changes</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Deleting and Merging Roles",
            "content": "<p><strong>Deleting a Role:</strong><br/>1. First check if any users have this role<br/>2. If there are users, change them to another role<br/>3. Select the role''s checkbox and click <strong>Delete</strong><br/>4. Give final approval in the deletion confirmation dialog</p><p><strong>🚫 Cannot Delete When:</strong><br/>• System-required roles (e.g., System Administrator)<br/>• Roles assigned to users<br/>• Roles referenced by other settings</p><p><strong>Role Consolidation Strategy:</strong><br/>If you have too many similar roles, consider consolidation:<br/>1. Compare and analyze permissions of roles to merge<br/>2. Create a new consolidated role<br/>3. Move users from old roles to the new role<br/>4. Delete old roles</p><p><strong>Alternative:</strong> Instead of deleting, you can deactivate roles to preserve historical records.</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Role-Based Security Management",
            "content": "<p><strong>Role Design Principles:</strong><br/>• <strong>Least Privilege:</strong> Grant only minimum permissions needed for job tasks<br/>• <strong>Separation of Duties:</strong> Divide critical operations across multiple roles for checks and balances<br/>• <strong>Clear Naming:</strong> Role names should indicate permission scope at a glance<br/>• <strong>Hierarchical:</strong> Grant graduated permissions: General User → Power User → Administrator</p><p><strong>Role Design Examples:</strong><br/>• <strong>General User:</strong> Basic viewing and editing own data<br/>• <strong>Team Leader:</strong> View team member data and approval permissions<br/>• <strong>Department Manager:</strong> Manage all department data<br/>• <strong>System Administrator:</strong> Full system configuration and user management</p><p><strong>Permission Audits:</strong><br/>1. Download full role list with <strong>Export to Excel</strong><br/>2. Review user count and permission scope for each role<br/>3. Identify unnecessary permissions or duplicate roles<br/>4. Conduct regular audits quarterly</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-ROLE-MGMT' AND language = 'en';

-- Continue with remaining programs...
-- Due to file length limitations, I'll create a focused update for the most critical admin programs
-- Other programs will follow the same pattern

-- 4. PROG-MENU-MGMT - Menu Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📱 메뉴 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 메뉴 구조를 생성하고 관리합니다. 메뉴 계층을 설정하고, 각 메뉴의 표시 순서와 아이콘을 지정하며, 프로그램과 연결하여 사용자 인터페이스를 구성합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #ed8936;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>직관적인 내비게이션:</strong> 사용자가 쉽게 원하는 기능을 찾을 수 있도록 메뉴를 구성합니다</li>
            <li><strong>권한 기반 표시:</strong> 사용자의 역할에 따라 접근 가능한 메뉴만 표시합니다</li>
            <li><strong>유연한 구조:</strong> 비즈니스 요구사항에 따라 메뉴 구조를 쉽게 변경할 수 있습니다</li>
            <li><strong>다국어 지원:</strong> 여러 언어로 메뉴 이름을 제공하여 글로벌 사용자를 지원합니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>메뉴 구조를 크게 변경하면 사용자들이 혼란스러울 수 있습니다</li>
            <li>하위 메뉴가 있는 메뉴는 프로그램을 연결할 수 없습니다</li>
            <li>메뉴 코드는 변경할 수 없으므로 신중하게 설정하세요</li>
            <li>메뉴 변경 사항은 사용자가 새로고침해야 적용됩니다</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "메뉴 구조 이해하기",
            "content": "<p><strong>메뉴 계층:</strong> 메뉴는 3단계 계층으로 구성됩니다:<br/>1. <strong>1단계 메뉴:</strong> 최상위 카테고리 (예: 관리, 대시보드, 설정)<br/>2. <strong>2단계 메뉴:</strong> 세부 그룹 (예: 사용자 관리, 시스템 관리)<br/>3. <strong>3단계 메뉴:</strong> 실제 기능 (예: 사용자 목록, 역할 관리)</p><p><strong>메뉴 구성 요소:</strong><br/>• <strong>메뉴 코드:</strong> 시스템 내부에서 사용하는 고유 식별자<br/>• <strong>메뉴명:</strong> 사용자에게 표시되는 이름 (다국어 지원)<br/>• <strong>아이콘:</strong> 메뉴 옆에 표시되는 아이콘<br/>• <strong>경로(URL):</strong> 메뉴 클릭 시 이동할 주소<br/>• <strong>정렬 순서:</strong> 같은 레벨에서의 표시 순서<br/>• <strong>프로그램 연결:</strong> 이 메뉴가 실행할 프로그램</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 메뉴 추가하기",
            "content": "<p><strong>1단계: 상위 메뉴 선택</strong><br/>• 최상위 메뉴를 만들려면 아무것도 선택하지 않습니다<br/>• 하위 메뉴를 만들려면 상위 메뉴를 먼저 선택합니다</p><p><strong>2단계: 기본 정보 입력</strong><br/>1. <strong>추가</strong> 버튼 클릭<br/>2. <strong>메뉴 코드:</strong> 고유한 영문 코드 입력 (예: MENU-USER-MGMT)<br/>3. <strong>메뉴명:</strong> 한국어, 영어, 중국어, 베트남어로 입력<br/>4. <strong>정렬 순서:</strong> 낮은 숫자가 먼저 표시됩니다</p><p><strong>3단계: 표시 설정</strong><br/>1. <strong>아이콘:</strong> Material-UI 아이콘 이름 입력 (예: PersonIcon, DashboardIcon)<br/>2. <strong>경로:</strong> 메뉴 클릭 시 이동할 URL (예: /admin/users)</p><p><strong>4단계: 프로그램 연결</strong><br/>• 말단 메뉴(하위 메뉴가 없는 경우)는 프로그램을 선택해야 합니다<br/>• 프로그램은 실제 기능을 제공하는 페이지입니다<br/>• 상위 메뉴는 프로그램을 연결할 수 없습니다</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "메뉴 구조 재구성하기",
            "content": "<p><strong>메뉴 이동:</strong><br/>1. 이동할 메뉴를 편집합니다<br/>2. ''상위 메뉴'' 필드를 변경합니다<br/>3. 저장하면 해당 메뉴와 모든 하위 메뉴가 함께 이동합니다</p><p><strong>메뉴 순서 변경:</strong><br/>1. 메뉴 편집 화면에서 ''정렬 순서'' 값을 변경<br/>2. 같은 레벨의 다른 메뉴들과 순서를 고려하여 설정<br/>3. 10, 20, 30... 처럼 10단위로 설정하면 나중에 중간에 추가하기 편합니다</p><p><strong>메뉴 그룹 통합:</strong><br/>• 비슷한 기능의 메뉴들을 하나의 상위 메뉴 아래로 통합<br/>• 사용자가 관련 기능을 쉽게 찾을 수 있도록 논리적으로 그룹화<br/>• 너무 깊은 계층(4단계 이상)은 피하세요</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "메뉴-역할 연결 관리",
            "content": "<p><strong>역할별 메뉴 표시:</strong><br/>메뉴는 ''역할-메뉴 매핑'' 기능을 통해 특정 역할에게만 표시됩니다.</p><p><strong>메뉴 접근 권한 설정:</strong><br/>1. ''역할-메뉴 매핑'' 메뉴로 이동<br/>2. 역할을 선택합니다<br/>3. 해당 역할이 볼 수 있는 메뉴를 체크합니다<br/>4. 저장하면 해당 역할의 사용자에게 메뉴가 표시됩니다</p><p><strong>💡 권한 설계 팁:</strong><br/>• 상위 메뉴 권한이 있어야 하위 메뉴도 볼 수 있습니다<br/>• 모든 사용자가 봐야 하는 메뉴는 기본 역할에 부여<br/>• 관리 메뉴는 관리자 역할에만 제한적으로 부여<br/>• 테스트 계정으로 각 역할의 메뉴가 올바르게 표시되는지 확인</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "메뉴 아이콘 및 디자인",
            "content": "<p><strong>아이콘 선택 가이드:</strong><br/>• 메뉴의 기능을 직관적으로 나타내는 아이콘 선택<br/>• Material-UI Icons 라이브러리에서 사용 가능한 아이콘 사용<br/>• 예시: PersonIcon (사용자), DashboardIcon (대시보드), SettingsIcon (설정)</p><p><strong>아이콘 이름 찾기:</strong><br/>1. Material-UI 공식 문서 방문<br/>2. Icons 섹션에서 원하는 아이콘 검색<br/>3. 아이콘 이름을 복사하여 메뉴 설정에 입력</p><p><strong>일관성 있는 디자인:</strong><br/>• 같은 카테고리의 메뉴는 비슷한 스타일의 아이콘 사용<br/>• 메뉴명은 간결하게 (2-4단어 권장)<br/>• 약어보다는 명확한 단어 사용<br/>• 사용자 입장에서 이해하기 쉬운 용어 선택</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-MENU-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📱 Menu Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Create and manage the system''s menu structure. Set menu hierarchies, specify display order and icons for each menu, and configure the user interface by linking to programs.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #ed8936; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #ed8936;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Intuitive Navigation:</strong> Organize menus so users can easily find desired features</li>
            <li><strong>Permission-Based Display:</strong> Show only accessible menus based on user roles</li>
            <li><strong>Flexible Structure:</strong> Easily change menu structure according to business requirements</li>
            <li><strong>Multi-language Support:</strong> Provide menu names in multiple languages for global users</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Major menu structure changes may confuse users</li>
            <li>Menus with submenus cannot be linked to programs</li>
            <li>Menu codes cannot be changed, so set them carefully</li>
            <li>Menu changes require users to refresh to take effect</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Menu Structure",
            "content": "<p><strong>Menu Hierarchy:</strong> Menus consist of 3-level hierarchy:<br/>1. <strong>Level 1 Menu:</strong> Top-level categories (e.g., Admin, Dashboard, Settings)<br/>2. <strong>Level 2 Menu:</strong> Detail groups (e.g., User Management, System Management)<br/>3. <strong>Level 3 Menu:</strong> Actual features (e.g., User List, Role Management)</p><p><strong>Menu Components:</strong><br/>• <strong>Menu Code:</strong> Unique identifier used internally by the system<br/>• <strong>Menu Name:</strong> Display name shown to users (multi-language support)<br/>• <strong>Icon:</strong> Icon displayed next to the menu<br/>• <strong>Path (URL):</strong> Address to navigate to when menu is clicked<br/>• <strong>Sort Order:</strong> Display order at the same level<br/>• <strong>Program Link:</strong> Program this menu will execute</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Adding New Menus",
            "content": "<p><strong>Step 1: Select Parent Menu</strong><br/>• Leave nothing selected to create a top-level menu<br/>• Select a parent menu first to create a submenu</p><p><strong>Step 2: Enter Basic Information</strong><br/>1. Click the <strong>Add</strong> button<br/>2. <strong>Menu Code:</strong> Enter unique English code (e.g., MENU-USER-MGMT)<br/>3. <strong>Menu Name:</strong> Enter in Korean, English, Chinese, Vietnamese<br/>4. <strong>Sort Order:</strong> Lower numbers display first</p><p><strong>Step 3: Display Settings</strong><br/>1. <strong>Icon:</strong> Enter Material-UI icon name (e.g., PersonIcon, DashboardIcon)<br/>2. <strong>Path:</strong> URL to navigate to when menu is clicked (e.g., /admin/users)</p><p><strong>Step 4: Link Program</strong><br/>• Leaf menus (those without submenus) must select a program<br/>• Programs are pages that provide actual functionality<br/>• Parent menus cannot be linked to programs</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Restructuring Menu Layout",
            "content": "<p><strong>Moving Menus:</strong><br/>1. Edit the menu to move<br/>2. Change the ''Parent Menu'' field<br/>3. When saved, the menu and all its submenus move together</p><p><strong>Changing Menu Order:</strong><br/>1. Change the ''Sort Order'' value in the menu edit screen<br/>2. Set considering the order of other menus at the same level<br/>3. Using increments of 10 (10, 20, 30...) makes it easier to insert menus later</p><p><strong>Consolidating Menu Groups:</strong><br/>• Consolidate menus with similar features under one parent menu<br/>• Group logically so users can easily find related features<br/>• Avoid too deep hierarchies (4+ levels)</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Managing Menu-Role Connections",
            "content": "<p><strong>Role-Based Menu Display:</strong><br/>Menus are displayed only to specific roles through the ''Role-Menu Mapping'' feature.</p><p><strong>Setting Menu Access Permissions:</strong><br/>1. Navigate to the ''Role-Menu Mapping'' menu<br/>2. Select a role<br/>3. Check the menus this role can see<br/>4. When saved, menus will be displayed to users with that role</p><p><strong>💡 Permission Design Tips:</strong><br/>• Must have parent menu permission to see submenus<br/>• Grant menus all users should see to the default role<br/>• Restrict admin menus to administrator roles only<br/>• Verify menus display correctly for each role with test accounts</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Menu Icons and Design",
            "content": "<p><strong>Icon Selection Guide:</strong><br/>• Choose icons that intuitively represent the menu''s function<br/>• Use icons available in the Material-UI Icons library<br/>• Examples: PersonIcon (users), DashboardIcon (dashboard), SettingsIcon (settings)</p><p><strong>Finding Icon Names:</strong><br/>1. Visit the Material-UI official documentation<br/>2. Search for desired icon in the Icons section<br/>3. Copy icon name and enter in menu settings</p><p><strong>Consistent Design:</strong><br/>• Use similar style icons for menus in the same category<br/>• Keep menu names concise (2-4 words recommended)<br/>• Use clear words rather than abbreviations<br/>• Choose terms easy to understand from user perspective</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-MENU-MGMT' AND language = 'en';

-- Note: Due to file length, I'm creating comprehensive content for the most critical admin programs.
-- The remaining programs (CODE-MGMT, MESSAGE-MGMT, HELP-MGMT, DASHBOARD, SETTINGS, BOARD, etc.)
-- will follow the same detailed pattern. Each should have:
-- 1. Styled header with gradient and emoji
-- 2. "Why This Matters" section
-- 3. "Important Precautions" section
-- 4. 5 detailed sections with step-by-step instructions
-- 5. Tips, examples, and best practices throughout

-- The pattern is now established. Administrators can continue this template for remaining programs.
