/**
 * EpTray에서 현재 인증된 사용자의 loginid를 읽어옵니다.
 * 
 * 이 함수만 구현하면 SSO 로그인이 작동합니다.
 * EpTray API/SDK를 사용하여 loginid를 가져오세요.
 * 
 * @returns {Promise<string | null>} EpTray에서 읽어온 loginid, 없으면 null
 */
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // TODO: 여기에 EpTray에서 loginid를 읽어오는 코드를 작성하세요
  // 예시:
  // return window.eptray?.getLoginId() || null;
  // 또는
  // const response = await fetch('/api/eptray/user');
  // const data = await response.json();
  // return data.loginid || null;

  // 테스트용 (실제 구현 시 삭제)
  return "admin";
};
