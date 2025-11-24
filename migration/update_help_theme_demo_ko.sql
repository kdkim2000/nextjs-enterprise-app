-- 테마 시스템 데모 한국어 도움말 상세 내용 업데이트

UPDATE help
SET content = '<h4>테마 시스템 데모</h4>
<p>시스템의 테마 및 스타일링 시스템을 실시간으로 확인하고 테스트할 수 있는 개발자 및 디자이너를 위한 참고 페이지입니다. 색상, 타이포그래피, 간격, 그림자 등 디자인 토큰을 미리 볼 수 있습니다.</p>

<h5>테마 시스템 구성 요소</h5>

<h6>1. 색상 팔레트</h6>
<ul>
  <li><strong>기본 색상 (Primary):</strong> 브랜드의 주요 색상으로 버튼, 링크, 선택 상태 등에 사용됩니다.</li>
  <li><strong>보조 색상 (Secondary):</strong> 주요 색상을 보완하는 색상으로 강조나 액센트에 사용됩니다.</li>
  <li><strong>중립 색상 (Neutral):</strong> 배경, 테두리, 텍스트 등에 사용되는 회색 계열 색상입니다.</li>
  <li><strong>시맨틱 색상:</strong> 특정 의미를 가진 색상
    <ul>
      <li>Success (성공): 녹색 계열 - 성공 메시지, 완료 상태</li>
      <li>Warning (경고): 주황색 계열 - 주의 메시지, 대기 상태</li>
      <li>Error (오류): 빨강색 계열 - 에러 메시지, 실패 상태</li>
      <li>Info (정보): 파랑색 계열 - 정보 메시지, 도움말</li>
    </ul>
  </li>
  <li><strong>투명도 변형:</strong> 각 색상은 다양한 투명도(10%, 20%, 30% 등)로 제공됩니다.</li>
</ul>

<h6>2. 타이포그래피</h6>
<ul>
  <li><strong>글꼴 패밀리:</strong> 시스템에서 사용하는 글꼴 세트
    <ul>
      <li>본문용: Inter, Noto Sans KR 등</li>
      <li>제목용: 볼드 웨이트의 산세리프 글꼴</li>
      <li>코드용: Fira Code, JetBrains Mono 등 고정폭 글꼴</li>
    </ul>
  </li>
  <li><strong>글꼴 크기:</strong> h1부터 h6까지의 제목, body, caption, small 등 다양한 크기</li>
  <li><strong>글꼴 두께:</strong> Light(300), Regular(400), Medium(500), Bold(700), Black(900)</li>
  <li><strong>행간 (Line Height):</strong> 가독성을 위한 최적화된 행간 비율</li>
  <li><strong>자간 (Letter Spacing):</strong> 글자 사이 간격 조정</li>
</ul>

<h6>3. 간격 시스템 (Spacing)</h6>
<ul>
  <li><strong>8px 기준 그리드:</strong> 모든 간격은 8의 배수로 정의됩니다. (8, 16, 24, 32, 40, 48, 64...)</li>
  <li><strong>마진 (Margin):</strong> 요소 외부 간격</li>
  <li><strong>패딩 (Padding):</strong> 요소 내부 간격</li>
  <li><strong>간격 토큰:</strong> xs(4px), sm(8px), md(16px), lg(24px), xl(32px), 2xl(48px), 3xl(64px)</li>
</ul>

<h6>4. 그림자 (Shadows)</h6>
<ul>
  <li><strong>높이 레벨:</strong> 요소의 깊이를 표현하는 다양한 그림자
    <ul>
      <li>sm: 약한 그림자 - 카드, 버튼</li>
      <li>md: 중간 그림자 - 드롭다운, 팝오버</li>
      <li>lg: 강한 그림자 - 모달, 다이얼로그</li>
      <li>xl: 매우 강한 그림자 - 네비게이션 드로어</li>
    </ul>
  </li>
  <li><strong>컬러 그림자:</strong> 특정 색상을 적용한 그림자 효과</li>
</ul>

<h6>5. 모서리 (Border Radius)</h6>
<ul>
  <li><strong>none:</strong> 직각 모서리 (0px)</li>
  <li><strong>sm:</strong> 약간 둥근 모서리 (4px)</li>
  <li><strong>md:</strong> 중간 둥근 모서리 (8px)</li>
  <li><strong>lg:</strong> 많이 둥근 모서리 (12px)</li>
  <li><strong>xl:</strong> 매우 둥근 모서리 (16px)</li>
  <li><strong>full:</strong> 완전한 원형 (50%)</li>
</ul>

<h6>6. 애니메이션 및 전환</h6>
<ul>
  <li><strong>지속 시간:</strong> 애니메이션 속도 (fast: 150ms, normal: 300ms, slow: 500ms)</li>
  <li><strong>이징 함수:</strong> 애니메이션 곡선 (ease-in, ease-out, ease-in-out, linear)</li>
  <li><strong>전환 효과:</strong> 페이드, 슬라이드, 확대/축소 등</li>
</ul>

<h5>테마 데모 페이지 활용</h5>
<ol>
  <li><strong>색상 확인:</strong> 라이트/다크 모드에서 모든 색상이 어떻게 보이는지 확인합니다.</li>
  <li><strong>대비 검사:</strong> 텍스트와 배경 색상의 명암비가 WCAG 접근성 기준을 만족하는지 확인합니다.</li>
  <li><strong>일관성 검증:</strong> 전체 시스템에서 일관된 스타일이 적용되는지 확인합니다.</li>
  <li><strong>반응형 테스트:</strong> 다양한 화면 크기에서 디자인이 올바르게 적용되는지 테스트합니다.</li>
  <li><strong>코드 참조:</strong> 개발자는 CSS 변수명과 클래스명을 확인하여 코드에 적용할 수 있습니다.</li>
</ol>

<h5>디자인 토큰 사용 방법</h5>
<ul>
  <li><strong>CSS 변수:</strong> <code>var(--color-primary)</code>, <code>var(--spacing-md)</code> 형식으로 사용</li>
  <li><strong>Tailwind 클래스:</strong> <code>bg-primary</code>, <code>text-lg</code>, <code>p-4</code> 등의 유틸리티 클래스 사용</li>
  <li><strong>테마 전환:</strong> 라이트/다크 모드 전환 시 자동으로 색상이 변경됩니다.</li>
</ul>

<h5>개발자를 위한 가이드</h5>
<ul>
  <li><strong>디자인 토큰 준수:</strong> 임의의 색상이나 크기를 사용하지 말고 정의된 토큰을 사용하세요.</li>
  <li><strong>시맨틱 색상:</strong> 의미에 맞는 색상을 사용하세요. (성공 = 녹색, 에러 = 빨강)</li>
  <li><strong>간격 일관성:</strong> 8px 그리드 시스템을 따라 간격을 설정하세요.</li>
  <li><strong>접근성 고려:</strong> 색상 대비가 4.5:1 이상인지 확인하세요.</li>
  <li><strong>다크 모드 테스트:</strong> 모든 컴포넌트가 다크 모드에서도 잘 보이는지 확인하세요.</li>
</ul>

<h5>디자이너를 위한 가이드</h5>
<ul>
  <li><strong>디자인 시스템:</strong> Figma, Sketch 등 디자인 도구에서 동일한 토큰을 사용하세요.</li>
  <li><strong>프로토타입 제작:</strong> 실제 시스템과 동일한 색상과 간격을 사용하여 프로토타입을 만드세요.</li>
  <li><strong>핸드오프:</strong> 개발자에게 정확한 토큰 이름을 전달하여 의사소통을 명확히 하세요.</li>
  <li><strong>일관성 유지:</strong> 새로운 컴포넌트 디자인 시 기존 토큰을 최대한 활용하세요.</li>
</ul>

<h5>브랜딩 커스터마이징</h5>
<ul>
  <li><strong>기본 색상 변경:</strong> 조직의 브랜드 색상에 맞게 기본 색상을 변경할 수 있습니다.</li>
  <li><strong>로고 적용:</strong> 사이드바와 헤더에 조직 로고를 적용할 수 있습니다.</li>
  <li><strong>글꼴 변경:</strong> 브랜드 가이드라인에 맞는 글꼴로 변경할 수 있습니다.</li>
  <li><strong>테마 프리셋:</strong> 미리 정의된 여러 테마 중 선택하거나 커스텀 테마를 생성할 수 있습니다.</li>
</ul>

<h5>접근성 고려사항</h5>
<ul>
  <li><strong>색상 대비:</strong> WCAG AA 기준(4.5:1) 이상의 대비를 유지합니다.</li>
  <li><strong>색맹 모드:</strong> 색상에만 의존하지 않고 아이콘, 텍스트 등을 함께 사용합니다.</li>
  <li><strong>포커스 표시:</strong> 키보드 내비게이션 시 포커스가 명확히 보이도록 합니다.</li>
  <li><strong>터치 영역:</strong> 버튼과 클릭 가능한 요소는 최소 44x44px 크기를 유지합니다.</li>
</ul>

<h5>초보자를 위한 팁</h5>
<ul>
  <li><strong>색상 코드 복사:</strong> 원하는 색상을 클릭하면 색상 코드가 클립보드에 복사됩니다.</li>
  <li><strong>실시간 미리보기:</strong> 테마를 변경하면 즉시 적용되어 결과를 확인할 수 있습니다.</li>
  <li><strong>토큰 검색:</strong> 특정 색상이나 크기를 찾을 때 검색 기능을 활용하세요.</li>
  <li><strong>문서 참고:</strong> 각 토큰의 사용 예시와 설명을 참고하여 올바르게 사용하세요.</li>
</ul>

<h5>자주하는 질문</h5>
<ul>
  <li><strong>Q: 테마를 직접 수정할 수 있나요?</strong><br>A: 관리자 권한이 있는 경우 테마 설정에서 색상과 스타일을 커스터마이징할 수 있습니다.</li>
  <li><strong>Q: 다크 모드에서 일부 색상이 보이지 않아요.</strong><br>A: 다크 모드 전용 색상 토큰을 사용해야 합니다. 개발자에게 문의하세요.</li>
  <li><strong>Q: 새로운 색상을 추가하고 싶어요.</strong><br>A: 디자인 시스템 관리자에게 요청하여 새로운 토큰을 추가할 수 있습니다. 임의로 추가하면 일관성이 깨질 수 있습니다.</li>
  <li><strong>Q: 모바일에서 간격이 이상해요.</strong><br>A: 반응형 간격 토큰을 사용해야 합니다. 화면 크기에 따라 자동으로 조정되도록 설정하세요.</li>
</ul>',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'admin'
WHERE id = 'help-ko-016';
