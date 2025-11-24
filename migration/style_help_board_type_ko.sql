-- 게시판 종류 관리 한국어 도움말 스타일 적용

UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📋 게시판 종류 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템에서 사용할 다양한 게시판 종류를 생성하고 관리하는 기능입니다. 공지사항, 자유게시판, Q&A, 자료실 등 조직에서 필요한 게시판을 설정할 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #48bb78; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #48bb78;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>맞춤형 커뮤니케이션:</strong> 조직의 요구에 맞는 다양한 형태의 게시판을 만들 수 있습니다</li>
            <li><strong>효율적인 정보 관리:</strong> 주제별로 게시판을 분리하여 정보를 체계적으로 관리합니다</li>
            <li><strong>유연한 설정:</strong> 게시판마다 댓글, 첨부파일, 익명 게시 등 다양한 옵션을 설정할 수 있습니다</li>
            <li><strong>권한 제어:</strong> 게시판별로 접근 권한을 다르게 설정하여 정보 보안을 유지합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">🚀 주요 기능</h3>
        <ul style="line-height: 1.8;">
            <li><strong>게시판 종류 추가:</strong> 새로운 게시판 유형을 생성합니다. 게시판 코드, 이름, 설명을 입력하여 고유한 게시판을 만들 수 있습니다.</li>
            <li><strong>게시판 설정:</strong> 각 게시판의 권한(읽기/쓰기/댓글), 첨부파일 허용 여부, 익명 게시 가능 여부 등을 세밀하게 설정할 수 있습니다.</li>
            <li><strong>게시판 수정/삭제:</strong> 기존 게시판의 설정을 변경하거나 사용하지 않는 게시판을 삭제할 수 있습니다.</li>
            <li><strong>게시판 목록 조회:</strong> 등록된 모든 게시판 종류를 한눈에 확인하고 검색할 수 있습니다.</li>
        </ul>
    </div>

    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin-top: 0;">📝 게시판 종류 생성 단계</h3>
        <ol style="line-height: 2; margin: 12px 0;">
            <li>게시판 종류 관리 페이지에서 <strong>"추가"</strong> 버튼을 클릭합니다.</li>
            <li><strong>게시판 정보</strong>를 입력합니다:
                <ul style="margin-top: 8px;">
                    <li>게시판 코드: 영문 대문자와 숫자, 하이픈으로 구성 (예: NOTICE-BOARD, FREE-TALK)</li>
                    <li>게시판 이름: 사용자에게 표시될 이름 (예: 공지사항, 자유게시판)</li>
                    <li>설명: 게시판의 용도와 목적을 간단히 설명</li>
                </ul>
            </li>
            <li><strong>게시판 옵션</strong>을 설정합니다:
                <ul style="margin-top: 8px;">
                    <li>댓글 허용, 첨부파일 허용, 익명 게시, 카테고리 사용 등</li>
                </ul>
            </li>
            <li><strong>"저장"</strong> 버튼을 클릭하여 게시판을 생성합니다.</li>
        </ol>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>게시판 코드는 신중하게:</strong> 게시판 코드는 생성 후 변경이 어려우므로, 명확하고 의미있는 코드를 사용하세요. (예: DEPT-NOTICE, IT-QNA)</li>
            <li><strong>권한 설정:</strong> 게시판 생성 후 역할별 접근 권한을 설정하여 적절한 사용자만 게시판을 이용하도록 관리하세요.</li>
            <li><strong>용도별 분리:</strong> 공지사항과 일반 게시판을 분리하여 중요 정보가 묻히지 않도록 하세요.</li>
            <li><strong>테스트:</strong> 새 게시판 생성 후 일반 사용자 계정으로 로그인하여 의도한 대로 작동하는지 확인하세요.</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>게시판 코드는 생성 후 변경할 수 없습니다. 새로운 게시판을 만들고 기존 게시물을 이동해야 합니다</li>
            <li>게시판 삭제 시 해당 게시판의 모든 게시글과 댓글이 함께 삭제됩니다. 삭제 전 백업을 권장합니다</li>
            <li>역할-메뉴 매핑 기능을 통해 특정 역할이나 부서에만 게시판 접근 권한을 부여할 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 게시판 코드를 변경할 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 데이터 일관성을 위해 게시판 코드는 생성 후 변경할 수 없습니다. 새로운 게시판을 만들고 기존 게시물을 이동해야 합니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 게시판을 삭제하면 게시글도 삭제되나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 네, 게시판 삭제 시 해당 게시판의 모든 게시글과 댓글이 함께 삭제됩니다. 삭제 전 백업을 권장합니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 특정 부서만 볼 수 있는 게시판을 만들 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 네, 역할-메뉴 매핑 기능을 사용하여 특정 역할이나 부서에만 게시판 접근 권한을 부여할 수 있습니다.</p>
        </div>
    </div>',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'admin'
WHERE id = 'help-ko-018';
