-- Add help content for Department Management page

INSERT INTO help (id, program_id, language, title, content, status, created_at, updated_at)
VALUES
  ('help-dept-mgmt-en', 'PROG-DEPT-MGMT', 'en', 'Department Management Help',
   '<h4>Department Management</h4><p>This page allows you to manage organizational departments in a hierarchical structure.</p><h5>Key Features:</h5><ul><li><strong>Tree Structure:</strong> Organize departments with parent-child relationships</li><li><strong>Department Details:</strong> Maintain department codes, names (multilingual), contact information, and status</li><li><strong>Manager Assignment:</strong> Assign department managers from user list</li><li><strong>Search &amp; Filter:</strong> Use quick search or advanced filters to find departments</li></ul><h5>Operations:</h5><ul><li><strong>Create:</strong> Click "Create" button to add new department</li><li><strong>Edit:</strong> Select a department and click "Edit" to modify details</li><li><strong>Delete:</strong> Select department(s) without children and click "Delete"</li><li><strong>View Hierarchy:</strong> Use the level column to see department structure</li></ul><p><em>Note: You cannot delete departments that have sub-departments. Delete children first.</em></p>',
   'active', NOW(), NOW()),
  ('help-dept-mgmt-ko', 'PROG-DEPT-MGMT', 'ko', '부서 관리 도움말',
   '<h4>부서 관리</h4><p>이 페이지에서 조직의 부서를 계층 구조로 관리할 수 있습니다.</p><h5>주요 기능:</h5><ul><li><strong>트리 구조:</strong> 상위-하위 관계로 부서를 구성</li><li><strong>부서 정보:</strong> 부서 코드, 이름(다국어), 연락처 정보 및 상태 관리</li><li><strong>담당자 지정:</strong> 사용자 목록에서 부서 담당자 지정</li><li><strong>검색 및 필터:</strong> 빠른 검색 또는 고급 필터를 사용하여 부서 찾기</li></ul><h5>작업:</h5><ul><li><strong>생성:</strong> "생성" 버튼을 클릭하여 새 부서 추가</li><li><strong>편집:</strong> 부서를 선택하고 "편집"을 클릭하여 세부 정보 수정</li><li><strong>삭제:</strong> 하위 부서가 없는 부서를 선택하고 "삭제" 클릭</li><li><strong>계층 보기:</strong> 레벨 열을 사용하여 부서 구조 확인</li></ul><p><em>참고: 하위 부서가 있는 부서는 삭제할 수 없습니다. 먼저 하위 부서를 삭제하세요.</em></p>',
   'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();
