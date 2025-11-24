-- 나머지 모든 help 항목 스타일 적용

-- 시스템 로그
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #718096 0%, #4a5568 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📊 시스템 로그 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 모든 활동을 기록한 로그를 조회하고 분석할 수 있습니다. 사용자 활동, 오류, 보안 이벤트, 시스템 이벤트를 추적하여 시스템 안정성과 보안을 유지합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #718096; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #718096;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>문제 진단:</strong> 오류 로그를 분석하여 시스템 문제의 원인을 파악하고 해결합니다</li>
            <li><strong>보안 감사:</strong> 비정상적인 접근이나 권한 위반을 모니터링하여 보안 위협을 조기에 발견합니다</li>
            <li><strong>규정 준수:</strong> 감사 로그를 통해 데이터 처리 이력을 증명하고 규정을 준수합니다</li>
            <li><strong>성능 개선:</strong> 시스템 동작 패턴을 분석하여 성능을 최적화합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">📋 로그 유형</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>사용자 활동 로그:</strong> 로그인, 로그아웃, 페이지 접근, 데이터 조회/수정/삭제 등</li>
            <li><strong>시스템 로그:</strong> 서버 시작/중지, 백업, 스케줄 작업 실행 등</li>
            <li><strong>오류 로그:</strong> 애플리케이션 에러, 데이터베이스 연결 실패, API 호출 실패 등</li>
            <li><strong>보안 로그:</strong> 로그인 실패, 권한 위반 시도, 비정상적인 접근 패턴 등</li>
            <li><strong>감사 로그:</strong> 중요 데이터의 변경 이력, 권한 변경, 설정 변경 등</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 관리자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>정기적인 로그 검토:</strong> 매일 또는 매주 로그를 검토하여 이상 징후를 조기에 발견하세요</li>
            <li><strong>오류 패턴 분석:</strong> 반복되는 오류가 있다면 근본 원인을 파악하여 해결하세요</li>
            <li><strong>보안 로그 모니터링:</strong> 로그인 실패, 권한 위반 등 보안 관련 로그를 주의깊게 모니터링하세요</li>
            <li><strong>알림 설정:</strong> 중요한 이벤트 발생 시 즉시 알림을 받도록 설정하세요</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 로그는 얼마나 오래 보관되나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 로그 유형에 따라 다르지만 일반적으로 활성 로그는 3개월, 백업 로그는 1년 이상 보관됩니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 특정 사용자의 모든 활동을 추적하고 싶어요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 사용자 필터를 사용하여 해당 사용자의 모든 로그를 조회할 수 있습니다. 기간을 넓게 설정하여 전체 이력을 확인하세요.</p>
        </div>
    </div>'
WHERE id = 'help-ko-011';

-- 게시글 관리
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🛡️ 게시글 관리</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">모든 게시판의 게시글을 통합적으로 관리하는 관리자 기능입니다. 부적절한 게시글 삭제, 공지사항 설정, 게시글 이동, 통계 확인 등 다양한 관리 작업을 수행할 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #f56565; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #f56565;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>커뮤니티 품질 유지:</strong> 부적절한 게시글을 신속하게 관리하여 건전한 커뮤니티를 유지합니다</li>
            <li><strong>효율적인 운영:</strong> 모든 게시판의 게시글을 한 곳에서 통합 관리할 수 있습니다</li>
            <li><strong>신속한 대응:</strong> 신고된 게시글을 빠르게 검토하고 조치할 수 있습니다</li>
            <li><strong>통계 분석:</strong> 게시판 활동을 분석하여 운영 전략을 개선합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">🔧 주요 관리 기능</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>게시글 통합 조회:</strong> 모든 게시판의 게시글을 한 곳에서 조회하고 관리</li>
            <li><strong>게시글 검색:</strong> 제목, 내용, 작성자로 특정 게시글을 빠르게 찾기</li>
            <li><strong>공지사항 설정:</strong> 중요한 게시글을 공지사항으로 설정하여 상단에 고정</li>
            <li><strong>게시글 이동:</strong> 잘못된 게시판에 작성된 글을 적절한 게시판으로 이동</li>
            <li><strong>블라인드 처리:</strong> 삭제하지 않고 게시글을 숨김 처리</li>
            <li><strong>신고 처리:</strong> 사용자가 신고한 게시글과 댓글을 검토하고 조치</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 관리자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>커뮤니티 가이드라인:</strong> 명확한 게시판 이용 규칙을 공지하고 일관되게 적용하세요</li>
            <li><strong>신속한 대응:</strong> 신고된 게시글은 빠르게 검토하고 처리하여 커뮤니티 품질을 유지하세요</li>
            <li><strong>투명한 관리:</strong> 게시글 삭제나 블라인드 처리 시 명확한 사유를 제공하세요</li>
            <li><strong>정기적인 모니터링:</strong> 매일 게시판을 점검하여 부적절한 내용이 오래 노출되지 않도록 하세요</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>삭제된 게시글은 30일간 휴지통에 보관되며, 30일이 지나면 영구 삭제됩니다</li>
            <li>게시글 삭제 시 댓글도 함께 삭제되므로 신중하게 결정하세요</li>
            <li>공지사항이 너무 많으면 오히려 주목도가 떨어지므로 적절히 관리하세요</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 삭제한 게시글을 복구할 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 네, 휴지통에서 30일 이내에 복구할 수 있습니다. 30일이 지나면 영구 삭제됩니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 게시글을 삭제하면 작성자에게 알림이 가나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 설정에 따라 다릅니다. 삭제 사유와 함께 알림을 전송할 수 있습니다.</p>
        </div>
    </div>'
WHERE id = 'help-ko-020';

-- React 연구회
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #61dafb 0%, #21a1c4 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">⚛️ React 연구회</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">React 개발에 관심있는 팀원들이 모여 학습 자료, 예제 코드, 베스트 프랙티스를 공유하고 함께 성장하는 커뮤니티 공간입니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #61dafb; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #21a1c4;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>지식 공유:</strong> React 및 관련 생태계에 대한 지식을 공유합니다</li>
            <li><strong>문제 해결:</strong> 개발 중 만난 문제와 해결 방법을 함께 논의합니다</li>
            <li><strong>코드 리뷰:</strong> 작성한 코드를 공유하고 피드백을 받아 코드 품질을 향상시킵니다</li>
            <li><strong>최신 동향:</strong> React 생태계의 최신 트렌드와 기술을 학습하고 실무에 적용합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">🚀 주요 활동</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>학습 자료 공유:</strong> React 공식 문서, 튜토리얼, 블로그 포스트 등 유용한 학습 자료를 공유합니다</li>
            <li><strong>예제 코드 공유:</strong> 유용한 커스텀 훅, 컴포넌트 패턴, 유틸리티 함수를 공유합니다</li>
            <li><strong>베스트 프랙티스 논의:</strong> 컴포넌트 구조, 상태 관리, 성능 최적화 등의 모범 사례를 논의합니다</li>
            <li><strong>정기 스터디 세션:</strong> 주 1회 또는 격주로 온라인/오프라인 스터디를 진행합니다</li>
        </ul>
    </div>

    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin-top: 0;">📚 학습 주제 예시</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>React 기초:</strong> JSX, 컴포넌트, Props, State, 생명주기</li>
            <li><strong>React Hooks:</strong> useState, useEffect, useContext, useReducer, 커스텀 훅</li>
            <li><strong>상태 관리:</strong> Context API, Redux, Zustand, Recoil, Jotai</li>
            <li><strong>Next.js:</strong> SSR, SSG, ISR, App Router, API Routes</li>
            <li><strong>성능 최적화:</strong> React.memo, useMemo, useCallback, Code Splitting</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 가이드</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>부담없이 질문하기:</strong> React를 처음 배우는 분도 환영합니다. 기초적인 질문도 부담없이 올려주세요</li>
            <li><strong>작은 것부터 공유:</strong> 작은 팁이나 해결한 문제도 공유하면 다른 분들에게 큰 도움이 됩니다</li>
            <li><strong>문서 읽기:</strong> 공식 문서를 먼저 읽어보는 습관을 들이면 실력이 빠르게 향상됩니다</li>
            <li><strong>실습 중심:</strong> 읽고 배운 내용을 직접 코드로 작성해보며 학습하세요</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: React를 처음 배우는데 참여해도 되나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 네, 환영합니다! 초보자를 위한 자료도 많이 공유되며, 궁금한 점은 언제든 질문하실 수 있습니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 발표자로 지원하려면 어떻게 해야 하나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 연구회 게시판에 발표 희망 주제와 날짜를 작성해주시면 일정을 조율하여 안내드립니다.</p>
        </div>
    </div>'
WHERE id = 'help-ko-017';

-- 판매 보고서
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #38b2ac 0%, #319795 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">📈 판매 보고서</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">판매 데이터를 다양한 관점에서 조회하고 분석하여 비즈니스 인사이트를 얻을 수 있습니다. 기간별, 제품별, 지역별, 고객별 판매 현황을 확인하고 트렌드를 파악합니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #38b2ac; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #38b2ac;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>데이터 기반 의사결정:</strong> 객관적인 데이터를 바탕으로 비즈니스 전략을 수립합니다</li>
            <li><strong>성과 측정:</strong> 판매 목표 대비 실적을 추적하고 평가합니다</li>
            <li><strong>트렌드 파악:</strong> 시간에 따른 판매 패턴과 추세를 분석합니다</li>
            <li><strong>문제 조기 발견:</strong> 판매 부진 제품이나 지역을 빠르게 파악하고 대응합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">📊 보고서 유형</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>기간별 판매 보고서:</strong> 일별, 주별, 월별, 분기별, 연도별 판매 실적</li>
            <li><strong>제품별 판매 보고서:</strong> 각 제품의 판매량, 매출액, 재고 현황</li>
            <li><strong>지역별 판매 보고서:</strong> 지역/지점별 판매 실적 비교 및 분석</li>
            <li><strong>고객별 판매 보고서:</strong> 주요 고객의 구매 패턴과 매출 기여도</li>
            <li><strong>판매원별 보고서:</strong> 영업 담당자별 실적 평가 및 성과 비교</li>
        </ul>
    </div>

    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin-top: 0;">📉 주요 지표</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>총 매출액:</strong> 선택한 기간 동안의 총 판매 금액</li>
            <li><strong>판매 수량:</strong> 판매된 제품의 총 개수</li>
            <li><strong>평균 거래액:</strong> 거래당 평균 판매 금액</li>
            <li><strong>고객 수:</strong> 구매한 고유 고객의 수</li>
            <li><strong>성장률:</strong> 전 기간 대비 매출 증감률</li>
            <li><strong>마진율:</strong> 매출 대비 이익률</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>간단한 보고서부터:</strong> 처음에는 기간별 총 매출 보고서부터 시작하여 점차 복잡한 분석으로 확장하세요</li>
            <li><strong>비교 분석:</strong> 항상 전 기간과 비교하여 변화를 파악하세요 (예: 이번 달 vs 지난 달)</li>
            <li><strong>필터 활용:</strong> 너무 많은 데이터가 표시되면 필터를 사용하여 관심있는 부분만 집중 분석하세요</li>
            <li><strong>정기적인 확인:</strong> 매주 또는 매월 정기적으로 보고서를 확인하는 습관을 들이세요</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>환불/취소가 반영되므로 최종 금액이 예상과 다를 수 있습니다</li>
            <li>일부 집계 데이터는 매 시간 또는 매일 갱신되므로 실시간 데이터가 아닐 수 있습니다</li>
            <li>필터 설정을 반드시 확인하여 원하는 데이터를 정확히 조회하세요</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 데이터는 얼마나 자주 업데이트되나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 판매 데이터는 실시간으로 수집되며, 보고서는 최신 데이터를 반영합니다. 일부 집계 데이터는 매 시간 또는 매일 갱신됩니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 작년 같은 기간과 비교하고 싶어요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 기간 설정에서 "전년 동기 대비" 옵션을 선택하거나, 사용자 지정 기간을 두 번 설정하여 비교할 수 있습니다.</p>
        </div>
    </div>'
WHERE id = 'help-ko-012';

-- 사용자 설정
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">⚙️ 사용자 설정</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">개인 환경 설정을 관리하여 시스템을 자신에게 맞게 최적화할 수 있습니다. 언어, 테마, 알림, 보안 등 다양한 설정을 변경할 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #805ad5; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #805ad5;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>개인화:</strong> 자신의 업무 스타일과 선호도에 맞게 시스템을 커스터마이징합니다</li>
            <li><strong>생산성 향상:</strong> 최적화된 환경 설정으로 작업 효율을 높입니다</li>
            <li><strong>보안 강화:</strong> 비밀번호와 2단계 인증 설정으로 계정을 보호합니다</li>
            <li><strong>접근성 개선:</strong> 글꼴 크기, 대비, 키보드 내비게이션 등을 조정하여 사용성을 향상시킵니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">🎨 주요 설정 항목</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>기본 설정:</strong> 언어, 시간대, 날짜 형식, 시간 형식, 숫자 형식</li>
            <li><strong>화면 설정:</strong> 테마(라이트/다크), 색상, 글꼴 크기, 밀도, 사이드바 고정</li>
            <li><strong>알림 설정:</strong> 이메일 알림, 브라우저 알림, 알림 유형, 알림 빈도, 방해 금지 모드</li>
            <li><strong>계정 보안:</strong> 비밀번호 변경, 2단계 인증, 로그인 이력, 활성 세션</li>
            <li><strong>개인정보:</strong> 프로필 사진, 연락처 정보, 프로필 공개 범위</li>
        </ul>
    </div>

    <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #9c640c; margin-top: 0;">🔐 권장 보안 설정</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>강력한 비밀번호:</strong> 최소 12자 이상, 대소문자, 숫자, 특수문자 조합</li>
            <li><strong>2단계 인증 필수:</strong> SMS 또는 인증 앱(Google Authenticator, Authy) 활성화</li>
            <li><strong>세션 타임아웃:</strong> 일정 시간 활동이 없으면 자동으로 로그아웃되도록 설정</li>
            <li><strong>로그인 알림:</strong> 새로운 디바이스에서 로그인 시 알림 받기</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>테마 선택:</strong> 눈의 피로를 줄이기 위해 밝은 환경에서는 라이트 모드, 어두운 환경에서는 다크 모드를 사용하세요</li>
            <li><strong>알림 관리:</strong> 너무 많은 알림은 오히려 방해가 됩니다. 정말 중요한 알림만 선택하세요</li>
            <li><strong>비밀번호 강화:</strong> 복잡한 비밀번호를 사용하고 정기적으로 변경하세요</li>
            <li><strong>2단계 인증:</strong> 보안을 위해 2단계 인증을 반드시 활성화하세요</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>설정 변경 후 반드시 "저장" 버튼을 클릭해야 적용됩니다</li>
            <li>일부 설정은 페이지 새로고침 또는 재로그인 후 적용됩니다</li>
            <li>2단계 인증 설정 시 복구 코드를 반드시 안전한 곳에 보관하세요</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 설정을 변경했는데 적용되지 않아요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: "저장" 버튼을 클릭했는지 확인하고, 페이지를 새로고침하거나 재로그인해보세요.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 다크 모드를 사용하고 싶어요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 설정 > 화면 설정에서 테마를 "다크 모드"로 변경하세요. "시스템 설정 따르기"를 선택하면 OS 설정에 따라 자동으로 변경됩니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 2단계 인증을 잃어버렸어요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 시스템 관리자에게 연락하여 2단계 인증을 재설정해야 합니다. 복구 코드를 미리 저장해두는 것이 좋습니다.</p>
        </div>
    </div>'
WHERE id = 'help-ko-014';

-- 테마 시스템 데모
UPDATE help
SET content = '<div style="padding: 16px; background: linear-gradient(135deg, #d69e2e 0%, #b7791f 100%); color: white; border-radius: 8px; margin-bottom: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 28px;">🎨 테마 시스템 데모</h2>
        <p style="margin: 0; font-size: 16px; line-height: 1.6;">시스템의 테마 및 스타일링 시스템을 실시간으로 확인하고 테스트할 수 있는 개발자 및 디자이너를 위한 참고 페이지입니다. 색상, 타이포그래피, 간격, 그림자 등 디자인 토큰을 미리 볼 수 있습니다.</p>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #d69e2e; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #d69e2e;">💡 이 기능이 필요한 이유</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>일관성 유지:</strong> 전체 시스템에서 통일된 디자인 언어를 사용합니다</li>
            <li><strong>개발 효율:</strong> 정의된 디자인 토큰을 사용하여 빠르게 개발할 수 있습니다</li>
            <li><strong>협업 개선:</strong> 디자이너와 개발자가 동일한 용어와 값을 사용합니다</li>
            <li><strong>유지보수:</strong> 테마를 한 곳에서 관리하여 쉽게 변경하고 유지보수합니다</li>
        </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #2d3748; margin-top: 0;">🧩 테마 시스템 구성 요소</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>색상 팔레트:</strong> 기본 색상, 보조 색상, 중립 색상, 시맨틱 색상(성공/경고/오류/정보)</li>
            <li><strong>타이포그래피:</strong> 글꼴 패밀리, 글꼴 크기, 글꼴 두께, 행간, 자간</li>
            <li><strong>간격 시스템:</strong> 8px 기준 그리드, 마진, 패딩, 간격 토큰(xs~3xl)</li>
            <li><strong>그림자:</strong> 높이 레벨에 따른 다양한 그림자(sm, md, lg, xl)</li>
            <li><strong>모서리:</strong> 다양한 border radius(none, sm, md, lg, xl, full)</li>
        </ul>
    </div>

    <div style="background: #fef5e7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #9c640c; margin-top: 0;">💻 개발자를 위한 가이드</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>디자인 토큰 준수:</strong> 임의의 색상이나 크기를 사용하지 말고 정의된 토큰을 사용하세요</li>
            <li><strong>시맨틱 색상:</strong> 의미에 맞는 색상을 사용하세요 (성공 = 녹색, 에러 = 빨강)</li>
            <li><strong>간격 일관성:</strong> 8px 그리드 시스템을 따라 간격을 설정하세요</li>
            <li><strong>접근성 고려:</strong> 색상 대비가 4.5:1 이상인지 확인하세요</li>
        </ul>
    </div>

    <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #234e52; margin-top: 0;">🎨 디자이너를 위한 가이드</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>디자인 시스템:</strong> Figma, Sketch 등 디자인 도구에서 동일한 토큰을 사용하세요</li>
            <li><strong>프로토타입 제작:</strong> 실제 시스템과 동일한 색상과 간격을 사용하여 프로토타입을 만드세요</li>
            <li><strong>핸드오프:</strong> 개발자에게 정확한 토큰 이름을 전달하여 의사소통을 명확히 하세요</li>
            <li><strong>일관성 유지:</strong> 새로운 컴포넌트 디자인 시 기존 토큰을 최대한 활용하세요</li>
        </ul>
    </div>

    <div style="background: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #c53030; margin-top: 0;">💡 초보자를 위한 팁</h3>
        <ul style="line-height: 1.8; margin: 12px 0;">
            <li><strong>색상 코드 복사:</strong> 원하는 색상을 클릭하면 색상 코드가 클립보드에 복사됩니다</li>
            <li><strong>실시간 미리보기:</strong> 테마를 변경하면 즉시 적용되어 결과를 확인할 수 있습니다</li>
            <li><strong>토큰 검색:</strong> 특정 색상이나 크기를 찾을 때 검색 기능을 활용하세요</li>
            <li><strong>문서 참고:</strong> 각 토큰의 사용 예시와 설명을 참고하여 올바르게 사용하세요</li>
        </ul>
    </div>

    <div style="background: #fff3cd; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">⚠️ 주의사항</h3>
        <ul style="margin: 8px 0; line-height: 1.8;">
            <li>테마를 직접 수정하려면 관리자 권한이 필요합니다</li>
            <li>새로운 색상이나 토큰을 추가하기 전에 디자인 시스템 관리자와 협의하세요</li>
            <li>임의로 토큰을 추가하면 디자인 일관성이 깨질 수 있습니다</li>
        </ul>
    </div>

    <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c5282; margin-top: 0;">❓ 자주하는 질문</h3>
        <div style="margin: 16px 0;">
            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 테마를 직접 수정할 수 있나요?</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 관리자 권한이 있는 경우 테마 설정에서 색상과 스타일을 커스터마이징할 수 있습니다.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 다크 모드에서 일부 색상이 보이지 않아요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 다크 모드 전용 색상 토큰을 사용해야 합니다. 개발자에게 문의하세요.</p>

            <p style="margin: 8px 0; font-weight: bold; color: #2d3748;">Q: 새로운 색상을 추가하고 싶어요.</p>
            <p style="margin: 8px 0 16px 20px; line-height: 1.6;">A: 디자인 시스템 관리자에게 요청하여 새로운 토큰을 추가할 수 있습니다. 임의로 추가하면 일관성이 깨질 수 있습니다.</p>
        </div>
    </div>'
WHERE id = 'help-ko-016';
