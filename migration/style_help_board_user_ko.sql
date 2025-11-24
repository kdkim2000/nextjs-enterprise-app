-- 게시판 사용자 한국어 도움말 스타일 적용

UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">✍️ 게시판 사용 가이드</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">게시판에서 글을 작성하고, 조회하며, 다른 사용자와 소통할 수 있습니다. 댓글, 좋아요, 파일 첨부 등 다양한 기능을 제공합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #4299e1; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4299e1;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>효율적인 커뮤니케이션:</strong> 팀원들과 정보를 공유하고 의견을 나눌 수 있습니다</li>
            <li><strong>지식 축적:</strong> 유용한 정보와 경험을 게시판에 기록하여 조직의 지식 자산을 형성합니다</li>
            <li><strong>협업 강화:</strong> 댓글과 피드백을 통해 협업과 소통을 활성화합니다</li>
            <li><strong>자료 공유:</strong> 문서, 이미지 등 다양한 자료를 첨부하여 공유할 수 있습니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">📝 게시글 작성 단계</h3>
        <ol style="line-height: 2; margin: 12px 0;">
            <li>게시판 목록에서 원하는 게시판을 선택합니다.</li>
            <li><strong>"글쓰기"</strong> 버튼을 클릭합니다.</li>
            <li>게시글 정보를 입력합니다:
                <ul style="margin-top: 8px;">
                    <li>제목: 게시글의 제목 입력 (필수)</li>
                    <li>내용: 리치 텍스트 에디터로 작성 (글자 서식, 링크, 이미지 등 추가 가능)</li>
                    <li>카테고리: 게시판 설정에 따라 선택</li>
                    <li>첨부파일: 필요시 파일 업로드</li>
                </ul>
            </li>
            <li><strong>"게시"</strong> 버튼을 클릭하여 글을 등록합니다.</li>
        </ol>
    </div>

    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin-top: 0;">🔍 게시글 조회 및 검색</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>게시글 목록:</strong> 최신 순으로 게시글이 나열됩니다. 제목을 클릭하면 상세 내용을 볼 수 있습니다.</li>
            <li><strong>검색 기능:</strong> 제목, 내용, 작성자로 게시글을 검색할 수 있습니다.</li>
            <li><strong>카테고리 필터:</strong> 특정 카테고리의 게시글만 조회할 수 있습니다.</li>
            <li><strong>조회수:</strong> 각 게시글의 조회수가 표시됩니다.</li>
        </ul>
    </div>

    <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #9c640c; margin-top: 0;">💬 댓글 작성 및 관리</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li>게시글 하단의 댓글 입력창에 의견을 작성할 수 있습니다</li>
            <li>다른 사용자의 댓글에 대댓글을 달 수 있습니다</li>
            <li>자신이 작성한 댓글은 수정 및 삭제가 가능합니다</li>
            <li>부적절한 댓글은 신고할 수 있으며, 관리자가 검토합니다</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>명확한 제목:</strong> 게시글의 내용을 잘 설명하는 구체적인 제목을 사용하세요.</li>
            <li><strong>적절한 카테고리:</strong> 카테고리를 올바르게 선택하면 다른 사용자가 게시글을 쉽게 찾을 수 있습니다.</li>
            <li><strong>파일 크기 제한:</strong> 첨부파일의 크기와 형식 제한을 확인하세요. (일반적으로 10MB 이하)</li>
            <li><strong>임시 저장:</strong> 작성 중인 글은 브라우저를 닫기 전 임시 저장하세요.</li>
            <li><strong>예의 바른 소통:</strong> 다른 사용자를 존중하며 건설적인 의견을 나누세요.</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>게시글을 수정할 수 있지만, 관리자 설정에 따라 일정 시간 후 수정이 제한될 수 있습니다</li>
            <li>다른 사용자의 댓글이 달린 게시글을 삭제하면 댓글도 함께 삭제됩니다</li>
            <li>허용되지 않은 파일 형식이거나 크기 제한을 초과한 경우 업로드가 실패합니다</li>
            <li>일부 게시판은 관리자 승인 후 게시되므로 즉시 표시되지 않을 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 작성한 게시글을 수정할 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 네, 자신이 작성한 게시글은 언제든지 수정할 수 있습니다. 단, 관리자 설정에 따라 일정 시간 후 수정이 제한될 수 있습니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 첨부파일이 업로드되지 않아요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 파일 크기와 형식을 확인하세요. 허용되지 않은 파일 형식이거나 크기 제한을 초과한 경우 업로드가 실패합니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 게시글을 삭제했는데 복구할 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 삭제된 게시글은 일반적으로 복구할 수 없습니다. 관리자에게 문의하여 백업 데이터를 확인해야 합니다.</p>
        </div>
    </div>',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'admin'
WHERE id = 'help-ko-019';
