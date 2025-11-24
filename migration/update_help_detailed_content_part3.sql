-- Update help content with detailed, beginner-friendly descriptions - Part 3
-- Generated: 2025-11-25
-- Continues enhancing remaining programs

-- 7. PROG-HELP-MGMT - Help Management
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">❓ 도움말 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">각 프로그램의 도움말 콘텐츠를 생성하고 관리합니다. 사용자가 각 기능을 쉽게 이해하고 사용할 수 있도록 상세한 설명, 단계별 가이드, FAQ를 제공하는 도움말 시스템입니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4299e1;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>사용자 자립성:</strong> 사용자가 스스로 문제를 해결할 수 있도록 지원합니다</li>
            <li><strong>교육 비용 절감:</strong> 매번 교육하는 대신 도움말을 참조하도록 안내합니다</li>
            <li><strong>일관된 정보:</strong> 모든 사용자에게 동일하고 정확한 정보를 제공합니다</li>
            <li><strong>다국어 지원:</strong> 여러 언어로 도움말을 제공하여 글로벌 사용자를 지원합니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>도움말은 초보자 관점에서 작성하세요</li>
            <li>전문 용어는 피하거나 설명을 추가하세요</li>
            <li>스크린샷을 추가하면 이해도가 높아집니다</li>
            <li>기능이 변경되면 도움말도 함께 업데이트하세요</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "도움말 구조 이해하기",
            "content": "<p><strong>도움말 구성 요소:</strong></p><p><strong>1. Main Content (메인 콘텐츠):</strong><br/>• 프로그램의 전반적인 개요<br/>• 이 기능이 왜 필요한지 설명<br/>• 주의사항과 제한사항<br/>• HTML 형식으로 작성 가능</p><p><strong>2. Sections (섹션):</strong><br/>• 기능을 단계별로 상세하게 설명<br/>• 각 섹션은 독립적인 주제를 다룸<br/>• 예: 새 항목 추가하기, 수정하기, 삭제하기<br/>• 5-7개 섹션 권장</p><p><strong>3. FAQs (자주 묻는 질문):</strong><br/>• 사용자가 자주 묻는 질문과 답변<br/>• Q&A 형식으로 작성<br/>• 실제 사용자 질문을 기반으로 작성</p><p><strong>리치 텍스트 편집기:</strong><br/>• 메인 콘텐츠는 리치 텍스트 편집기로 작성<br/>• 굵게, 기울임, 색상, 목록 등 서식 지원<br/>• 이미지와 링크 삽입 가능</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "새 도움말 작성하기",
            "content": "<p><strong>1단계: 프로그램 선택</strong><br/>1. <strong>추가</strong> 버튼 클릭<br/>2. <strong>Program ID:</strong> 도움말을 작성할 프로그램 선택<br/>3. <strong>Language:</strong> 작성할 언어 선택 (한국어, 영어 등)<br/>4. <strong>Title:</strong> 도움말 제목 입력</p><p><strong>2단계: 메인 콘텐츠 작성</strong><br/>1. 리치 텍스트 편집기에서 개요 작성<br/>2. 다음 내용 포함 권장:<br/>   • 프로그램 소개 (2-3문장)<br/>   • 주요 기능 목록<br/>   • 이 기능을 사용하는 이유<br/>   • 중요한 주의사항<br/>3. 텍스트 서식을 활용하여 가독성 향상</p><p><strong>3단계: 섹션 추가</strong><br/>1. <strong>Add Section</strong> 버튼 클릭<br/>2. 각 섹션마다:<br/>   • 제목: 명확하고 구체적으로 (예: ''새 사용자 추가하기'')<br/>   • 내용: 단계별로 상세하게 설명<br/>   • 스크린샷이나 예시 추가<br/>3. 논리적 순서로 섹션 배열</p><p><strong>4단계: FAQ 추가 (선택)</strong><br/>1. <strong>Add FAQ</strong> 버튼 클릭<br/>2. 질문과 답변 작성<br/>3. 실제 사용자가 묻는 질문 우선</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "효과적인 도움말 작성 팁",
            "content": "<p><strong>작성 원칙:</strong></p><p><strong>1. 사용자 중심:</strong><br/>• 초보자가 이해할 수 있는 언어 사용<br/>• 전문 용어는 피하거나 설명 추가<br/>• 사용자가 달성하고자 하는 목표에 집중</p><p><strong>2. 구체성:</strong><br/>• 추상적인 설명보다 구체적인 예시<br/>• ''설정을 변경하세요'' → ''사용자 설정 > 알림에서 이메일 알림을 활성화하세요''<br/>• 버튼 이름, 메뉴 경로를 정확하게 명시</p><p><strong>3. 단계별 접근:</strong><br/>• 복잡한 작업은 작은 단계로 나누기<br/>• 각 단계를 번호로 표시<br/>• 1단계, 2단계... 형식 사용</p><p><strong>4. 시각 자료 활용:</strong><br/>• 스크린샷으로 UI 위치 표시<br/>• 중요한 버튼이나 필드는 빨간 박스로 강조<br/>• 복잡한 프로세스는 플로우차트 사용</p><p><strong>5. 실용적인 예시:</strong><br/>• 실제 업무 시나리오 기반 예시<br/>• ''예를 들어...'' 문구로 시작<br/>• 일반적인 사용 사례 우선</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "도움말 번역 및 다국어 관리",
            "content": "<p><strong>번역 워크플로:</strong><br/>1. 한국어 도움말을 먼저 완성<br/>2. 영어 버전 생성:<br/>   • 같은 Program ID로 새 도움말 추가<br/>   • Language를 ''en''으로 설정<br/>   • 한국어 내용을 영어로 번역<br/>3. 필요시 중국어, 베트남어도 동일하게 추가</p><p><strong>번역 시 고려사항:</strong><br/>• 직역보다는 의역으로 자연스럽게<br/>• 문화적 차이를 고려<br/>• UI 용어는 실제 시스템과 일치하도록<br/>• 스크린샷은 각 언어별로 별도 준비</p><p><strong>일관성 유지:</strong><br/>• 번역 용어집 작성 및 공유<br/>• 같은 용어는 항상 같은 번역 사용<br/>• 예: ''사용자'' = ''User'' (일관되게)</p><p><strong>품질 검토:</strong><br/>1. 네이티브 스피커 검토<br/>2. 실제 화면과 대조하여 확인<br/>3. 사용자 테스트로 이해도 검증</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "도움말 유지보수 및 개선",
            "content": "<p><strong>정기 업데이트:</strong><br/>• 기능 변경 시 즉시 도움말 업데이트<br/>• 분기마다 전체 도움말 검토<br/>• 오래된 스크린샷 교체<br/>• 사용자 피드백 반영</p><p><strong>사용자 피드백 수집:</strong><br/>• 도움말 하단에 ''도움이 되었나요?'' 버튼<br/>• 사용자 의견을 정기적으로 검토<br/>• 자주 묻는 질문을 FAQ에 추가<br/>• 이해하기 어려운 부분 개선</p><p><strong>도움말 효과 측정:</strong><br/>• 각 도움말의 조회 수 추적<br/>• 사용자 만족도 조사<br/>• 고객 지원 문의 감소 여부 확인<br/>• 잘 활용되지 않는 도움말 개선</p><p><strong>검색 최적화:</strong><br/>• 사용자가 검색할 만한 키워드 포함<br/>• 제목과 내용에 핵심 용어 사용<br/>• 동의어도 함께 언급<br/>• 예: ''삭제하기'' 도움말에 ''제거'', ''지우기'' 언급</p><p><strong>💡 베스트 프랙티스:</strong><br/>• 도움말은 짧고 명확하게<br/>• 한 섹션당 5분 이내로 읽을 수 있도록<br/>• 중요한 정보는 굵게 표시<br/>• 경고나 팁은 별도 박스로 강조</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-HELP-MGMT' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">❓ Help Management</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">Create and manage help content for each program. A help system that provides detailed descriptions, step-by-step guides, and FAQs so users can easily understand and use each feature.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4299e1;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>User Independence:</strong> Support users in solving problems on their own</li>
            <li><strong>Reduced Training Costs:</strong> Direct to help instead of repeated training</li>
            <li><strong>Consistent Information:</strong> Provide identical and accurate information to all users</li>
            <li><strong>Multi-language Support:</strong> Provide help in multiple languages for global users</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Write help from a beginner''s perspective</li>
            <li>Avoid jargon or add explanations</li>
            <li>Adding screenshots increases comprehension</li>
            <li>Update help when features change</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Understanding Help Structure",
            "content": "<p><strong>Help Components:</strong></p><p><strong>1. Main Content:</strong><br/>• General overview of the program<br/>• Explanation of why this feature is needed<br/>• Precautions and limitations<br/>• Can be written in HTML format</p><p><strong>2. Sections:</strong><br/>• Detailed step-by-step explanation of features<br/>• Each section covers an independent topic<br/>• Examples: Adding new items, Editing, Deleting<br/>• 5-7 sections recommended</p><p><strong>3. FAQs (Frequently Asked Questions):</strong><br/>• Common user questions and answers<br/>• Written in Q&A format<br/>• Based on actual user questions</p><p><strong>Rich Text Editor:</strong><br/>• Main content written with rich text editor<br/>• Supports formatting: bold, italic, color, lists<br/>• Can insert images and links</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Writing New Help",
            "content": "<p><strong>Step 1: Select Program</strong><br/>1. Click <strong>Add</strong> button<br/>2. <strong>Program ID:</strong> Select program to write help for<br/>3. <strong>Language:</strong> Select language to write in (Korean, English, etc.)<br/>4. <strong>Title:</strong> Enter help title</p><p><strong>Step 2: Write Main Content</strong><br/>1. Write overview in rich text editor<br/>2. Recommended to include:<br/>   • Program introduction (2-3 sentences)<br/>   • List of key features<br/>   • Reasons for using this feature<br/>   • Important precautions<br/>3. Use text formatting to improve readability</p><p><strong>Step 3: Add Sections</strong><br/>1. Click <strong>Add Section</strong> button<br/>2. For each section:<br/>   • Title: Clear and specific (e.g., ''Adding New User'')<br/>   • Content: Detailed step-by-step explanation<br/>   • Add screenshots or examples<br/>3. Arrange sections in logical order</p><p><strong>Step 4: Add FAQs (Optional)</strong><br/>1. Click <strong>Add FAQ</strong> button<br/>2. Write questions and answers<br/>3. Prioritize questions actual users ask</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Tips for Writing Effective Help",
            "content": "<p><strong>Writing Principles:</strong></p><p><strong>1. User-Centered:</strong><br/>• Use language beginners can understand<br/>• Avoid jargon or add explanations<br/>• Focus on goals users want to achieve</p><p><strong>2. Specificity:</strong><br/>• Concrete examples over abstract descriptions<br/>• ''Change settings'' → ''In User Settings > Notifications, enable Email Notifications''<br/>• Specify button names and menu paths accurately</p><p><strong>3. Step-by-Step Approach:</strong><br/>• Break complex tasks into small steps<br/>• Number each step<br/>• Use Step 1, Step 2... format</p><p><strong>4. Use Visual Materials:</strong><br/>• Show UI locations with screenshots<br/>• Highlight important buttons or fields with red boxes<br/>• Use flowcharts for complex processes</p><p><strong>5. Practical Examples:</strong><br/>• Examples based on real work scenarios<br/>• Start with ''For example...''<br/>• Prioritize common use cases</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Help Translation and Multi-language Management",
            "content": "<p><strong>Translation Workflow:</strong><br/>1. Complete Korean help first<br/>2. Create English version:<br/>   • Add new help with same Program ID<br/>   • Set Language to ''en''<br/>   • Translate Korean content to English<br/>3. Add Chinese, Vietnamese similarly if needed</p><p><strong>Translation Considerations:</strong><br/>• Localize naturally rather than literal translation<br/>• Consider cultural differences<br/>• Match UI terminology with actual system<br/>• Prepare separate screenshots for each language</p><p><strong>Maintaining Consistency:</strong><br/>• Create and share translation glossary<br/>• Always use same translation for same terms<br/>• Example: ''사용자'' = ''User'' (consistently)</p><p><strong>Quality Review:</strong><br/>1. Review by native speakers<br/>2. Verify against actual screens<br/>3. Validate comprehension with user testing</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Help Maintenance and Improvement",
            "content": "<p><strong>Regular Updates:</strong><br/>• Update help immediately when features change<br/>• Review all help quarterly<br/>• Replace outdated screenshots<br/>• Reflect user feedback</p><p><strong>Collecting User Feedback:</strong><br/>• ''Was this helpful?'' button at bottom of help<br/>• Regularly review user comments<br/>• Add frequently asked questions to FAQ<br/>• Improve difficult-to-understand sections</p><p><strong>Measuring Help Effectiveness:</strong><br/>• Track view count for each help<br/>• Conduct user satisfaction surveys<br/>• Check if customer support inquiries decreased<br/>• Improve underutilized help</p><p><strong>Search Optimization:</strong><br/>• Include keywords users might search<br/>• Use key terms in title and content<br/>• Mention synonyms too<br/>• Example: In ''Deleting'' help, mention ''remove'', ''erase''</p><p><strong>💡 Best Practices:</strong><br/>• Keep help short and clear<br/>• Readable within 5 minutes per section<br/>• Bold important information<br/>• Highlight warnings or tips in separate boxes</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-HELP-MGMT' AND language = 'en';

-- 8. PROG-DASHBOARD - Dashboard
UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📊 대시보드</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 핵심 지표와 현황을 한눈에 파악할 수 있는 메인 화면입니다. 실시간 데이터, 주요 통계, 최근 활동, 알림 등을 시각적으로 표현하여 빠른 의사결정을 지원합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #f6ad55; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f6ad55;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>실시간 모니터링:</strong> 비즈니스 핵심 지표를 실시간으로 확인할 수 있습니다</li>
            <li><strong>빠른 의사결정:</strong> 중요한 정보가 한 화면에 모여 있어 신속한 판단이 가능합니다</li>
            <li><strong>이상 징후 감지:</strong> 데이터 변화를 즉시 파악하여 문제에 빠르게 대응합니다</li>
            <li><strong>개인화:</strong> 사용자마다 필요한 위젯을 선택하여 자신만의 대시보드를 구성합니다</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>대시보드 데이터는 5분마다 자동으로 새로고침됩니다</li>
            <li>너무 많은 위젯을 추가하면 성능이 저하될 수 있습니다</li>
            <li>차트를 클릭하면 상세 페이지로 이동합니다</li>
            <li>일부 데이터는 권한에 따라 제한될 수 있습니다</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "대시보드 구성 요소",
            "content": "<p><strong>주요 위젯 유형:</strong></p><p><strong>1. 통계 카드:</strong><br/>• 숫자로 표현되는 핵심 지표<br/>• 예: 총 사용자 수, 오늘 매출, 미처리 작업<br/>• 전일 대비 증감률 표시<br/>• 색상으로 긍정/부정 변화 표현</p><p><strong>2. 차트 위젯:</strong><br/>• 막대 차트: 항목 간 비교<br/>• 선 차트: 시간에 따른 추세<br/>• 파이 차트: 비율 표현<br/>• 영역 차트: 누적 변화</p><p><strong>3. 활동 피드:</strong><br/>• 최근 사용자 활동<br/>• 시스템 알림<br/>• 승인 대기 항목<br/>• 최근 변경 사항</p><p><strong>4. 빠른 액션:</strong><br/>• 자주 사용하는 기능 바로가기<br/>• 새 항목 추가 버튼<br/>• 보고서 다운로드<br/>• 설정 바로가기</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "대시보드 사용 방법",
            "content": "<p><strong>기본 탐색:</strong><br/>1. 로그인하면 대시보드가 첫 화면으로 표시됩니다<br/>2. 상단에는 요약 통계가 카드 형태로 배치<br/>3. 중간에는 차트와 그래프<br/>4. 하단에는 최근 활동 목록</p><p><strong>차트 상호작용:</strong><br/>• 차트 위에 마우스를 올리면 상세 값 표시<br/>• 차트를 클릭하면 해당 항목의 상세 페이지로 이동<br/>• 범례를 클릭하면 해당 데이터 계열 숨김/표시<br/>• 드래그하여 특정 기간 확대</p><p><strong>데이터 새로고침:</strong><br/>• 자동 새로고침: 5분마다 자동 업데이트<br/>• 수동 새로고침: 우측 상단의 새로고침 버튼 클릭<br/>• 새로고침 시간 표시: 마지막 업데이트 시간 확인 가능</p><p><strong>기간 필터:</strong><br/>• 오늘, 어제, 최근 7일, 최근 30일, 사용자 정의<br/>• 기간을 변경하면 모든 차트가 자동으로 업데이트<br/>• 사용자 정의 기간은 시작일과 종료일 직접 선택</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "대시보드 개인화",
            "content": "<p><strong>위젯 추가/제거:</strong><br/>1. 우측 상단의 <strong>편집</strong> 버튼 클릭<br/>2. <strong>위젯 추가</strong> 버튼을 클릭하면 사용 가능한 위젯 목록 표시<br/>3. 원하는 위젯을 선택하여 추가<br/>4. 위젯 우측 상단의 X 버튼으로 제거</p><p><strong>위젯 배치 변경:</strong><br/>1. 편집 모드에서 위젯을 드래그하여 원하는 위치로 이동<br/>2. 위젯 크기를 조절하려면 모서리를 드래그<br/>3. 변경사항은 자동으로 저장됩니다</p><p><strong>위젯 설정:</strong><br/>1. 위젯 우측 상단의 설정 아이콘 클릭<br/>2. 차트 유형, 데이터 소스, 색상 등 변경<br/>3. 표시할 데이터 항목 선택<br/>4. 저장하면 즉시 적용</p><p><strong>레이아웃 저장:</strong><br/>• 개인 설정은 자동으로 저장됩니다<br/>• 다른 기기에서 로그인해도 동일한 레이아웃<br/>• 기본 레이아웃으로 재설정 가능</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "데이터 내보내기 및 공유",
            "content": "<p><strong>차트 이미지 저장:</strong><br/>1. 차트 위에 마우스를 올립니다<br/>2. 우측 상단에 나타나는 메뉴 클릭<br/>3. ''이미지로 저장'' 선택<br/>4. PNG 형식으로 다운로드됩니다</p><p><strong>데이터 내보내기:</strong><br/>1. 차트 메뉴에서 ''데이터 내보내기'' 선택<br/>2. CSV 또는 Excel 형식 선택<br/>3. 현재 표시된 데이터가 파일로 다운로드됩니다</p><p><strong>대시보드 인쇄:</strong><br/>1. 우측 상단의 인쇄 버튼 클릭<br/>2. 인쇄 미리보기 화면 표시<br/>3. 프린터 설정 후 인쇄<br/>4. 또는 PDF로 저장</p><p><strong>대시보드 공유:</strong><br/>• 대시보드 URL 복사하여 공유<br/>• 이메일로 정기 리포트 발송 설정<br/>• 특정 사용자에게 읽기 전용 액세스 부여<br/>• 공개 대시보드로 설정 가능 (권한 필요)</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "대시보드 활용 팁",
            "content": "<p><strong>효과적인 모니터링:</strong><br/>• 아침 업무 시작 시 대시보드 먼저 확인<br/>• 이상 수치 발견 시 즉시 상세 조사<br/>• 추세 변화에 주목 (급증/급감)<br/>• 알림 설정으로 중요 지표 자동 모니터링</p><p><strong>역할별 대시보드 구성:</strong><br/>• <strong>관리자:</strong> 전체 시스템 현황, 사용자 통계, 시스템 상태<br/>• <strong>영업팀:</strong> 매출 현황, 고객 통계, 목표 달성률<br/>• <strong>운영팀:</strong> 작업 처리 현황, 대기 항목, 처리 시간<br/>• <strong>개발팀:</strong> 오류 발생률, API 호출 통계, 성능 지표</p><p><strong>성능 최적화:</strong><br/>• 사용하지 않는 위젯 제거<br/>• 복잡한 차트보다 간단한 차트 선택<br/>• 대용량 데이터는 집계하여 표시<br/>• 캐시된 데이터 활용</p><p><strong>💡 추천 위젯 조합:</strong><br/>• 통계 카드 (상단): 핵심 KPI 4-6개<br/>• 차트 (중앙): 추세 분석 차트 2-3개<br/>• 활동 피드 (우측): 최근 활동 목록<br/>• 빠른 액션 (하단): 자주 사용하는 기능 링크</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-DASHBOARD' AND language = 'ko';

UPDATE help SET
    content = '<div style="padding: 16px; background: linear-gradient(135deg, #f6ad55 0%, #ed8936 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📊 Dashboard</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">The main screen where you can see key metrics and system status at a glance. Supports quick decision-making by visually presenting real-time data, key statistics, recent activities, and notifications.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #f6ad55; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f6ad55;">💡 Why This Feature Matters</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>Real-time Monitoring:</strong> Check key business metrics in real-time</li>
            <li><strong>Quick Decision-making:</strong> Important information in one screen enables rapid judgment</li>
            <li><strong>Anomaly Detection:</strong> Immediately identify data changes to respond quickly to issues</li>
            <li><strong>Personalization:</strong> Each user selects needed widgets to create their own dashboard</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ Important Precautions</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>Dashboard data auto-refreshes every 5 minutes</li>
            <li>Adding too many widgets may degrade performance</li>
            <li>Clicking charts navigates to detail pages</li>
            <li>Some data may be restricted based on permissions</li>
        </ul>
    </div>',
    sections = '[
        {
            "id": "section-001",
            "order": 1,
            "title": "Dashboard Components",
            "content": "<p><strong>Main Widget Types:</strong></p><p><strong>1. Statistics Cards:</strong><br/>• Key metrics expressed as numbers<br/>• Examples: Total users, Today''s revenue, Pending tasks<br/>• Shows day-over-day change rate<br/>• Colors represent positive/negative changes</p><p><strong>2. Chart Widgets:</strong><br/>• Bar charts: Compare between items<br/>• Line charts: Trends over time<br/>• Pie charts: Show proportions<br/>• Area charts: Cumulative changes</p><p><strong>3. Activity Feed:</strong><br/>• Recent user activities<br/>• System notifications<br/>• Pending approvals<br/>• Recent changes</p><p><strong>4. Quick Actions:</strong><br/>• Shortcuts to frequently used features<br/>• Add new item buttons<br/>• Report downloads<br/>• Settings shortcuts</p>"
        },
        {
            "id": "section-002",
            "order": 2,
            "title": "Using the Dashboard",
            "content": "<p><strong>Basic Navigation:</strong><br/>1. Dashboard displays as first screen after login<br/>2. Summary statistics arranged as cards at top<br/>3. Charts and graphs in middle<br/>4. Recent activity list at bottom</p><p><strong>Chart Interaction:</strong><br/>• Hover over chart to display detailed values<br/>• Click chart to navigate to detail page for that item<br/>• Click legend to hide/show data series<br/>• Drag to zoom into specific period</p><p><strong>Data Refresh:</strong><br/>• Auto refresh: Automatically updates every 5 minutes<br/>• Manual refresh: Click refresh button in top-right<br/>• Refresh time display: Check last update time</p><p><strong>Period Filter:</strong><br/>• Today, Yesterday, Last 7 days, Last 30 days, Custom<br/>• All charts auto-update when period changes<br/>• Custom period allows direct selection of start and end dates</p>"
        },
        {
            "id": "section-003",
            "order": 3,
            "title": "Dashboard Personalization",
            "content": "<p><strong>Adding/Removing Widgets:</strong><br/>1. Click <strong>Edit</strong> button in top-right<br/>2. Click <strong>Add Widget</strong> to display available widget list<br/>3. Select and add desired widgets<br/>4. Remove with X button in widget top-right</p><p><strong>Changing Widget Layout:</strong><br/>1. In edit mode, drag widgets to desired position<br/>2. Drag corners to resize widgets<br/>3. Changes are automatically saved</p><p><strong>Widget Settings:</strong><br/>1. Click settings icon in widget top-right<br/>2. Change chart type, data source, colors, etc.<br/>3. Select data items to display<br/>4. Applied immediately upon saving</p><p><strong>Saving Layout:</strong><br/>• Personal settings saved automatically<br/>• Same layout when logging in from other devices<br/>• Can reset to default layout</p>"
        },
        {
            "id": "section-004",
            "order": 4,
            "title": "Data Export and Sharing",
            "content": "<p><strong>Saving Chart Image:</strong><br/>1. Hover mouse over chart<br/>2. Click menu appearing in top-right<br/>3. Select ''Save as Image''<br/>4. Downloads as PNG format</p><p><strong>Exporting Data:</strong><br/>1. Select ''Export Data'' from chart menu<br/>2. Choose CSV or Excel format<br/>3. Currently displayed data downloads as file</p><p><strong>Printing Dashboard:</strong><br/>1. Click print button in top-right<br/>2. Print preview screen displays<br/>3. Print after printer settings<br/>4. Or save as PDF</p><p><strong>Sharing Dashboard:</strong><br/>• Copy and share dashboard URL<br/>• Set up regular report delivery by email<br/>• Grant read-only access to specific users<br/>• Can set as public dashboard (requires permission)</p>"
        },
        {
            "id": "section-005",
            "order": 5,
            "title": "Dashboard Usage Tips",
            "content": "<p><strong>Effective Monitoring:</strong><br/>• Check dashboard first when starting work in morning<br/>• Immediately investigate in detail when finding abnormal values<br/>• Pay attention to trend changes (spikes/drops)<br/>• Auto-monitor important metrics with alert settings</p><p><strong>Dashboard Configuration by Role:</strong><br/>• <strong>Administrator:</strong> Overall system status, user statistics, system health<br/>• <strong>Sales Team:</strong> Revenue status, customer statistics, goal achievement rate<br/>• <strong>Operations Team:</strong> Task processing status, pending items, processing time<br/>• <strong>Development Team:</strong> Error occurrence rate, API call statistics, performance metrics</p><p><strong>Performance Optimization:</strong><br/>• Remove unused widgets<br/>• Choose simple charts over complex ones<br/>• Display large data in aggregated form<br/>• Utilize cached data</p><p><strong>💡 Recommended Widget Combination:</strong><br/>• Statistics cards (top): 4-6 core KPIs<br/>• Charts (center): 2-3 trend analysis charts<br/>• Activity feed (right): Recent activity list<br/>• Quick actions (bottom): Frequently used feature links</p>"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE program_id = 'PROG-DASHBOARD' AND language = 'en';
