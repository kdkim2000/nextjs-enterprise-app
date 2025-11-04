export default {
  common: {
    appName: '엔터프라이즈 앱',
    submit: '제출',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    create: '생성',
    search: '검색',
    filter: '필터',
    export: '내보내기',
    import: '가져오기',
    loading: '로딩 중...',
    error: '오류',
    success: '성공',
    confirm: '확인',
    yes: '예',
    no: '아니오',
    ok: '확인',
    close: '닫기',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    refresh: '새로고침',
    download: '다운로드',
    upload: '업로드'
  },
  auth: {
    login: '로그인',
    logout: '로그아웃',
    username: '사용자명',
    password: '비밀번호',
    email: '이메일',
    rememberMe: '로그인 상태 유지',
    forgotPassword: '비밀번호를 잊으셨나요?',
    loginSuccess: '로그인 성공',
    loginError: '로그인 실패',
    invalidCredentials: '잘못된 사용자명 또는 비밀번호',
    mfaRequired: 'MFA 인증 필요',
    mfaCode: '인증 코드',
    mfaCodeSent: '이메일로 인증 코드가 전송되었습니다',
    mfaVerify: '인증',
    mfaResend: '코드 재전송',
    sessionExpired: '세션이 만료되었습니다. 다시 로그인해주세요.',
    ssoLogin: 'SSO 로그인'
  },
  menu: {
    dashboard: '대시보드',
    userManagement: '사용자 관리',
    reports: '보고서',
    settings: '설정',
    favorites: '즐겨찾기',
    recent: '최근 방문',
    addToFavorites: '즐겨찾기에 추가',
    removeFromFavorites: '즐겨찾기에서 제거'
  },
  footer: {
    currentProgram: '현재 프로그램',
    version: '버전',
    copyright: '© 2024 엔터프라이즈 앱. All rights reserved.'
  },
  grid: {
    noRows: '데이터가 없습니다',
    rowsPerPage: '페이지당 행 수',
    of: '/',
    exportExcel: '엑셀로 내보내기',
    importExcel: '엑셀에서 가져오기'
  },
  file: {
    upload: '파일 업로드',
    download: '파일 다운로드',
    uploadSuccess: '파일 업로드 성공',
    uploadError: '파일 업로드 실패',
    dragDrop: '파일을 드래그하거나 클릭하여 선택하세요',
    maxSize: '최대 파일 크기',
    allowedTypes: '허용된 파일 형식'
  },
  editor: {
    placeholder: '입력을 시작하세요...',
    bold: '굵게',
    italic: '기울임',
    underline: '밑줄',
    strike: '취소선',
    link: '링크',
    image: '이미지',
    table: '표',
    bulletList: '글머리 기호',
    orderedList: '번호 매기기',
    undo: '실행 취소',
    redo: '다시 실행'
  },
  autoLogout: {
    title: '세션 만료 경고',
    message: '활동이 없어 {seconds}초 후 세션이 만료됩니다.',
    stayLoggedIn: '로그인 유지',
    logoutNow: '지금 로그아웃'
  }
} as const;
