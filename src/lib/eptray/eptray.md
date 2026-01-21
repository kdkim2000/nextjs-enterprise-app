# 3 연계 개발 가이드
## 3.1 WebSocket HOST 정보
- ws	localhost	29282	ws://localhost:29282
- wss	localhost	29283	wss://localhost:29283
## 3.2 WebSocket Interface
### REQUEST(JSON)
- Key 	Value (type) 	Description
- rqtype	getknoxsso (string)	예약된 이름 사용
- data	%SystemID% (string)	발급받은 연계용 system ID
- token	빈 값 (string)	현재 미사용
- Example	{"rqtype":"getknoxsso","data":"","token":""}

### RESPONSE (JSON)
- Key 	Value (type) 	Description
- rpcode	EMPTY_BOX	SSO 없는 상태 (Knox 미로그인)
- RETURN_SUCCESS	서버 호출 성공
- 서버 호출 성공	KnoxTray 내부 에러 발생, detail 값 리턴
- data	%data% (json)	서버 호출 성공 시 서버 리턴 value
- data	UserInfo	%data% (string)	암호화된 SSO 정보
- Key	%data% (string)	UserInfo Pair key
- result	success | fail (string)	서버 통신 결과
- errorCode	%ErrorCode% (string)	서버 fail 리턴시 오류코드 (ErrorCode 정의표 참조)
- errorMsg	%ErrorMsg% (string)	서버 fail 리턴시 오류메시지(ErrorCode 정의표 참조)
- detail	ERR_JSON_PARSING	Request JSON 포맷이 맞지 않는 경우
- HAVE_NO_DATA	System ID 가 없는 경우
- NONE_ERROR	정의된 I/F 대로 호출되지 않을 경우
- CONNECTION_FAILED	서버 연결이 실패한 경우

## 3.3 KnoxTray 연계 사용자정보
- EP_LOGINID	Knox Login ID
- EP_COMPID	회사코드
- EP_DEPTID	부서코드
- EP_GRDID	직급코드
- EP_SORGID	총괄코드
- EP_SABUN	사번
- EP_LOCALE	로그인 언어 정보
- 한국어: ko_KR.EUC-KR
- 영어: en_US.UTF-8
- 중국어: zh_CN.UTF-8
- 일본어: ja_JP.UTF-8
- EP_MAIL	메일주소
- EP_USERID	EPID
- EP_DCOMP	원소속/파견소속 구분 (O:원소속, S:파견소속)
- EP_TIMEZONE	Knox Portal에 설정된 TIMEZONE
- EP_SUMMERTIMEYN	타임존의 Summer Time 여부
- EP_USERNAME	사용자명
- EP_COMPNAME	회사명
- EP_DEPTNAME	부서명
- EP_GRDNAME	직급명
- EP_SORGNAME	총괄명
- EP_USERNAME_EN	영문 사용자명
- EP_COMPNAME_EN	영문 회사명
- EP_DEPTNAME_EN	영문 부서명
- EP_GRDNAME_EN	영문 직급명
- EP_SORGNAME_EN	영문 총괄명
- EP_ISBLUE	임원여부
- EP_LOGINIP	Knox Portal 로그인 IP
- EP_LOGINPOSITION	로그인 거점정보
- EP_GLOBALPOSITION	사용자 거점정보
- EP_SECID	보안등급
- EP_COMPTEL	사용자 회사전화번호
- EP_MOBILE	사용자 휴대폰 번호
- EP_PREFERREDLANGUAGE	사용자 설정 선호 언어
- EP_LOGINTIMEFORMIS	Knox Portal로그인 시간

### 1) 사용자 정보 복호화 Sample (Java)
```java
//연계 결과
String encodeUserInfo = "";
String encodeAesKey = "";
// 연계시스템 개인키
String privateKey = "";
//사용자 정보 암호화 키 복호화
byte[] bytePrivateKey = Base64.decodeBase64(privateKey);
PKCS8EncodedKeySpec privateKeySpec = new PKCS8EncodedKeySpec(bytePrivateKey);
KeyFactory keyFactory = KeyFactory.getInstance("RSA");
RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) keyFactory.generatePrivate(privateKeySpec);
Cipher cipher = Cipher.getInstance("RSA");
cipher.init(Cipher.DECRYPT_MODE, rsaPrivateKey);
byte[] decodeAesKey = cipher.doFinal(Base64.decodeBase64(encodeAesKey));
//사용자 정보 복호화
//iv값 고정
byte[] ivBytes = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
SecretKey aesKey = new SecretKeySpec(decodeAesKey, "AES");
AlgorithmParameterSpec ivSpec = new IvParameterSpec(ivBytes);
Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
aesCipher.init(Cipher.DECRYPT_MODE, aesKey, ivSpec);
byte[] byteDecodeUserInfo = aesCipher.doFinal(Base64.decodeBase64(encodeUserInfo));
String decodeUserInfo = new String(byteDecodeUserInfo);
```
### 2) WebSocket호출 Sample (Javascript)
```js
// 웹소켓 연결
websocket = new WebSocket("wss://localhost:29283");
// 웹소켓 연결 후 정의된 JSON 데이터 전송하기
websocket.onopen = function (event) {
// rqtype : getknoxsso (정의된 string)
// data : KnoxPortal 부터 부여받은 연계 시스템 ID
websocket.send('{"rqtype":"getknoxsso","token":"","data":"KCC60TRAY0089"}');
}
// 웹소켓 응답 메시지 처리
Websocket.onmessage = function (event) {
// event.data 의 데이터를 parsing 하여 후속 처리 진행
var rpJSON = event.data;
}
// 웹소켓 에러 시 이벤트 처리
Websocket.onerror = function (event) {
var errmsg = event.data;
}
// 연결 종료하기, 웹소켓으로 데이터를 전달 받은 이 후 close 선언
websocket.close();
```
### Console log
```bash
Encrypted userInfo: ABkD+YaINQhadzP6GV1XixD8dRAR8vbERw8IT8Gj+QHSeol4/kJLcH6IgCpcOo4fXTUpbcXyDWAKkOT11mlkVxd1oQ6Ax/xTQy0H/HXxJ5Whavt3HiRgrVkHQNhQeFVkjADwqBDaZXAAXMUGRxSeVIhxrdaj7xHqy3pKXw4FlQq85ok12OyxoN1HpRMceUkftmVRrD+ZMWfEx2BwkcMFXAZS31VlRT2t4W3K5uBpPqqwmTNZxnV0RevD3lLYTo+aPTZ69SvuIf9ngYHoCPdniQXPJEE7bbLtX2W73+fyQn7q1ZSEyndgQdpsSliD/aeq3kip2PVq4zi4qw7Xgmrv1NiUk4AG0oHYqlUCajc1B9+Qw9tMyzuQcEczV4sRV8xgPPmJpTKk3EQdll9dwGb1XA9q0jbHzY4fXehv4VQawj0hDFeGO68K2FIXkMfQXzqqbWwB1zF/IBFSkRfvyBQu7VM2phKuBqnzvX5KAsM4aGdU2V1MxQw2rFoAg/GZUEwPfPNWwvEUx7lPxg1uw+p7mSk9H4Q3efC4E2Kw7J/AXGWaMqsAkS0unk+U/xu8ytqhd9cc0m1VrzyI/wzzgnPZ3ixaXz5OLpAwdN+yytPuK/6kB0rAT6TONORD5FJ2TL4IxRzY9FCSNSawPCDNK8PF5+Q8j/PYaxHpUK7WG9lXzTZHsWJokQ3PY8LU0uGn51Kjb9a0jaAdDbvTSMhRThqJC8vL8B9vO9CWhCMpJvS1kedLc9+QcQGDVvEtSiReDLUc8ZuzECKdZTyA/MbZa+nTyIXMEpMZeryfqNk70qlQteCFwgNOR8XUvW7zln0vUZ05IerTSlXAdugLFWS9pe8KNtEj6/+ReKeUWUHpTrCEmvobHMQQ6i3mTzgpiUUfk08x6E3Mu1GW0povC2raBiUhGfQID8CXkv68hs3S+otd4Vv0I/22qvlNryZWaj/UxGQDuSJrGg7SXEryG3ouu5tKObiT0BqelFLPaq//MTi7WUmiaEzKRe0h1uFMqwyFAjnXioUEw1HJTYzKVgjZ7uwUH9a4Rt6u1qKYTjF6PO9fk3dqhmSDjnMHsVGysrx6htfAYhaITQXh7ctotW0PZn+MnQ==
forward-logs-shared.ts:95 Encrypted key: cQCdYcw4g5dtMGTnwHptpP5WhVT1AmYPssLQOmB+KHbG5EmApJhwkW3k/Q7JS0sRcsXgQJccbMD12dEd55fLvsmHUqPAWtjUy251go79J1T0Qg36WzrBT7YGeAbVuqhuBH4xJuER3ATXlSC2mKWArpDPjtvi0xTeO2kKSxmIFNcxvIQ0is1rsH9a4UY81X+ZE+IyE+stE7PmeS1stpWyTXY0JLjbg9FmvzaUZhoztAHg2qKkb4POOstOzYYf+6vdUR6hqCU3OQEhJz4Y7KYIkgYbHHgwhRjSZAziuxxVxltStdVtnOubnpJc3OF32HLk9A6RrouWurFCKLDGYeUAkA==
```
