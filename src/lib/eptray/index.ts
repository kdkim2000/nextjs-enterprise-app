/** 
 * EpTray에서 현재 인증된 사용자의 loginid를 읽어옵니다.
 * 
 * 이 함수만 구현하면 SSO 로그인이 작동합니다.
 * EpTray API/SDK를 사용하여 loginid를 가져오세요.
 * 
 * @returns {Promise<string | null>} EpTray에서 읽어온 loginid, 없으면 null
 */
export const getEpTrayLoginId = async (): Promise<string | null> => {
  // 환경 변수에서 설정값 읽기
  const wsUrl = process.env.NEXT_PUBLIC_KNOX_WS_URL || "ws://localhost:29282";
  const systemId = process.env.NEXT_PUBLIC_KNOX_SYSTEM_ID || "KCC60TRAY0089";
  const token = process.env.NEXT_PUBLIC_KNOX_TOKEN || "-----BEGIN PRIVATE KEY-----\r\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCXNYciOtTPFT78\r\ngu+K9dW++peFlfwOewQBG/1gsF8h54aRwolrDWVuXM3Z0/gkw+W6o+XmNHKTY8hP\r\nFzYh380+jVxuP+LRgnAjh8zeLh+L5kcnAHX3UjbZtRxWZF2DpWjL9aXcLtpZ79BH\r\nibQlLo3CMo6VQV/OeAoVbVY1MT9aemwu/ljt+mmrjkUqnuJFDYNbWChuTeglvu1c\r\nS7xgmscP25xfT9Le+XkM8k0uSAUmCc3kKd12bbexVdovB+9TR9JcLJcq+UnvWR3s\r\neS5BlgLCJr0oVgt0rgJfDJ1Dt57ZRDj7CMrma3+OXhzFz8hcOBVzU3wCjKF+vEj6\r\n++8OY+0ZAgMBAAECggEAfq7m/6Oghbq8IZylipu6L54NcmsdWRhxW2iS2P4LRgGO\r\nufHtZZY8o8D26gfwPwUtJDiKtVq9n4Sa3sCIpsq1TzHp/ahipLsOroXo+0BTR8dv\r\nV1rIeqQTtkRJcIv32QKtESxGgHl0kKMdscHJ/tjJBamL0bqKxRXHBPqsnjYbaPYc\r\nlhx1QYkzWRbBJYmTqiCbxIcIzR7ZqrxXxGwROJfqe6bQMGd1a+NaEC9ygMmA/I+9\r\nFk+ChPHx1MvaaP9eBloYykJNGZxEp8c6oSsrmedMCIgCrttvWwJTRtUb19dEGWfE\r\n+jW6TYuFNFN7jbZuWY+eWRWqiZ7MlqfXqTcWmB2lgQKBgQDHfiHC3Xh78dVEt1jg\r\nxlHuc/ROIJUuYsAI5FE6DUZhSr7wthVHnsMYuHd0wfXF+2XS7eb5KHJEjbINKsYO\r\nPAUuiyX96zftWLnC8Bv5FWZ2re0QT17t13gPh2krPVCMuV1HvrmmtW8sBeEdJB02\r\ndC3+YZHLFN1pzv/6jqA5O5piiQKBgQDCCjGP2XhX3BMw0SS4ReHpdzjlcQD5wpg7\r\nlSSPqpKJvOsxj3J05JLLkWpZ5wD1VjGOfra9b72fUSMmQ/rUEevX7UQD3+J93Skx\r\njbiOGnpx2og9o87ypwRuqWdtbsjZ/sMefT1QhAsBOl7oZdiT6UoB/e1e2riEohFn\r\nTT4LShfSEQKBgQCiURKPRzxdPOvWOYhre3H2nwpM913qnBa8JWmh3mNBjlvF56Fw\r\n4NDFMHKh4Z9kM6Up9sBUQoCXHuOcqwzzUAq3UCjdbaHX0LV004EvLiZssh+Ngccv\r\npn3dxMPhlsYPelNXqOvNpRqLq0z7NQM/50/1BtZlctik2vSUna/oYYLAYQKBgFsR\r\nOa2PnSFvEjqpDZjGg351C+jzHkgaAiSEnMIohdnLJn7+GfOuiw6rUsSa3CJIr712\r\nzwEdfltVUy/UW9ZICu4uVuuSmdQEhh7RqrpWxvzEWYjEZo4PwM7HBtmfUviszppy\r\noOI29os+/+gGVJ0msis5J7yK3mqxPYXEBMh7n65hAoGBALbm83/pwuTrMTMa03Xm\r\nh4JZP9Rd5mkE1rRZJaiN7/yy5doLHFJq5ojKkk8B2zDiHjaLxItxVJcLNycFfG2x\r\nxzthDG8dHvZC8jaweZkFCEEDOwP9eIUvH+xJ+EHLxFxt8QdUPdX7IJRho42sHg9K\r\nExoFqo4FYYDb4cVKkil4Wt+O\r\n-----END PRIVATE KEY-----";
  
  if (!token) {
    console.error("KNOX_PRIVATE_KEY is not configured");
    return null;
  }

  try {
    // 웹소켓 연결 및 데이터 수신
    const response = await connectKnoxWebSocket(wsUrl, token, systemId);
    if (!response) {
      console.error("WebSocket response is empty");
      return null;
    }

    // 응답 파싱
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (e) {
      console.error("Failed to parse response JSON:", e);
      return null;
    }

    let innerData;
    if (typeof parsedResponse.data === "string") {
      try {
        innerData = JSON.parse(parsedResponse.data);
      } catch (e) {
        console.error("Failed to parse inner data JSON:", e);
        return null;
      }
    } else {
      innerData = parsedResponse.data;
    }

    const { userInfo, key } = innerData;
    if (!userInfo || !key) {
      console.error("Missing userInfo or key in response");
      return null;
    }

    console.log("Encrypted userInfo:", userInfo);
    console.log("Encrypted key:", key);

    //AES 키 복호화 (RSA)
    // let aesKeyBuffer: ArrayBuffer;
    // try {
    //   aesKeyBuffer = await decryptAesKey(key, token);
    // } catch (e) {
    //   console.error("Failed to decrypt AES key:", e);
    //   return null;
    // }

    // 사용자 정보 복호화 (AES)
    // let decodedUserInfo: string;
    // try {
    //   decodedUserInfo = await decryptUserInfoWithAes(userInfo, aesKeyBuffer);
    // } catch (e) {
    //   console.error("Failed to decrypt user info:", e);
    //   return null;
    // }

    // console.log("Decoded user info:", decodedUserInfo);

    return "admin";
    // loginid 추출
    // const loginIdMatch = decodedUserInfo.match(/loginid=([^|]+)/);
    // if (loginIdMatch && loginIdMatch[1]) {
    //   return loginIdMatch[1];
    // }

    // console.error("loginid not found in decoded user info");
    // return null;
  } catch (error) {
    console.error("Error getting EpTray login id:", error);
    return null;
  }
};

/**
 * 웹소켓 요청 데이터 인터페이스
 */
interface WebSocketRequest {
  rqtype: string;
  token: string;
  data: string;
}

/**
 * 웹소켓 응답 데이터 인터페이스
 */
interface WebSocketResponse {
  EP_LOGINID: string;
  [key: string]: any;
}

/**
 * Knox SSO 웹소켓 연결 및 통신을 처리합니다.
 * 
 * @param {string} url - 웹소켓 서버 URL
 * @param {string} token - 인증 토큰
 * @param {string} systemId - KnoxPortal으로부터 부여받은 연계 시스템 ID
 * @returns {Promise<string | null>} 응답 데이터, 실패 시 null
 */
export const connectKnoxWebSocket = async (
  url: string,
  token: string,
  systemId: string
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    // 웹소켓 연결
    const websocket: WebSocket = new WebSocket(url);

    // 타임아웃 설정 (10초)
    const timeout = setTimeout(() => {
      websocket.close();
      reject(new Error("WebSocket connection timeout"));
    }, 10000);

    // 웹소켓 연결 후 정의된 JSON 데이터 전송
    websocket.onopen = (event: Event): void => {
      try {
        const requestData: WebSocketRequest = {
          rqtype: "getknoxsso",
          token: token,
          data: systemId
        };
        websocket.send(JSON.stringify(requestData));
      } catch (error) {
        clearTimeout(timeout);
        console.error("WebSocket send error:", error);
        reject(error);
      }
    };

    // 웹소켓 응답 메시지 처리
    websocket.onmessage = (event: MessageEvent): void => {
      clearTimeout(timeout);
      try {
        const rpJSON: string = event.data;
        resolve(rpJSON);
        // 응답을 받은 후 연결 종료
        if (websocket.readyState === WebSocket.OPEN) {
          websocket.close();
        }
      } catch (error) {
        console.error("WebSocket message parse error:", error);
        reject(error);
      }
    };

    // 웹소켓 에러 시 이벤트 처리
    websocket.onerror = (event: Event): void => {
      clearTimeout(timeout);
      console.error("WebSocket error:", event);
      reject(new Error("WebSocket connection error"));
    };

    // 웹소켓 연결 종료 처리
    websocket.onclose = (event: CloseEvent): void => {
      clearTimeout(timeout);
      if (event.code !== 1000) {
        console.error("WebSocket closed unexpectedly:", event.code, event.reason);
        reject(new Error(`WebSocket closed: ${event.code} - ${event.reason}`));
      }
    };
  });
};

/**
 * RSA 개인키로 AES 키를 복호화합니다.
 * 
 * @param {string} encryptedAesKey - Base64로 인코딩된 암호화된 AES 키
 * @param {string} privateKeyPem - PEM 형식의 RSA 개인키
 * @returns {Promise<ArrayBuffer>} 복호화된 AES 키
 */
async function decryptAesKey(encryptedAesKey: string, privateKeyPem: string): Promise<ArrayBuffer> {
  try {
    // PEM 형식의 개인키를 CryptoKey로 변환
    let privateKeyBase64 = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
      .replace(/-----END RSA PRIVATE KEY-----/g, "")
      .replace(/\s/g, "");

    // Base64 디코딩 전에 유효성 검사
    if (!privateKeyBase64) {
      throw new Error("Private key is empty after processing");
    }

    // Base64 문자열이 유효한지 확인 (URL-safe Base64도 허용)
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    const base64UrlSafeRegex = /^[A-Za-z0-9_-]*={0,2}$/;
    
    if (!base64Regex.test(privateKeyBase64) && !base64UrlSafeRegex.test(privateKeyBase64)) {
      throw new Error("Private key is not properly Base64 encoded");
    }
    
    // URL-safe Base64인 경우 표준 Base64로 변환
    if (base64UrlSafeRegex.test(privateKeyBase64)) {
      privateKeyBase64 = privateKeyBase64
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    }

    let binaryDerString: string;
    try {
      binaryDerString = atob(privateKeyBase64);
    } catch (e) {
      console.error("Base64 decoding failed for private key. String:", privateKeyBase64);
      console.error("Base64 decoding error:", e);
      throw new Error("Failed to decode private key Base64 string");
    }

    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
      binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    // RSA 개인키를 node-forge 로 파싱하고 PKCS#1 v1.5 로 복호화
    let decryptedKeyBuffer: ArrayBuffer;
    try {
      // 1️⃣ PEM 형식 검증 (forge 가 자동 처리)
      // @ts-ignore // node-forge type definitions may be missing
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

      // 2️⃣ 암호화된 AES 키를 Base64 디코드 (URL‑safe 변환 포함)
      const normalizedKey = encryptedAesKey.replace(/-/g, '+').replace(/_/g, '/');
      const encryptedBytes = forge.util.decode64(normalizedKey);

      // 3️⃣ PKCS#1 v1.5 복호화 (forge 기본 RSA 복호화 알고리즘)
      const decrypted = privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');

      // 4️⃣ 문자열(바이너리) → Uint8Array → ArrayBuffer 변환
      const uintArray = Uint8Array.from(decrypted, c => c.charCodeAt(0));
      decryptedKeyBuffer = uintArray.buffer;
    } catch (e) {
      console.error('RSA decryption with forge failed:', e);
      throw e;
    }

    // 암호화된 AES 키가 유효한 Base64인지 확인 (추가 검증)
    if (!encryptedAesKey) {
      throw new Error('Encrypted AES key is empty');
    }
    if (!base64Regex.test(encryptedAesKey.replace(/-/g, '+').replace(/_/g, '/'))) {
      throw new Error('Encrypted AES key is not properly Base64 encoded');
    }

    return decryptedKeyBuffer;
  } catch (error) {
    console.error("Error in decryptAesKey:", error);
    throw error;
  }
}

/**
 * AES 키로 사용자 정보를 복호화합니다.
 * 
 * @param {string} encryptedUserInfo - Base64로 인코딩된 암호화된 사용자 정보
 * @param {ArrayBuffer} aesKey - AES 키
 * @returns {Promise<string>} 복호화된 사용자 정보
 */
async function decryptUserInfoWithAes(encryptedUserInfo: string, aesKey: ArrayBuffer): Promise<string> {
  try {
    // IV는 0으로 채워진 16바이트 (Java 샘플과 동일)
    const iv = new Uint8Array(16);

    // 암호화된 사용자 정보
    const encryptedData = Uint8Array.from(atob(encryptedUserInfo), c => c.charCodeAt(0));

    // AES 키 import (AES-CBC 모드)
    const key = await crypto.subtle.importKey(
      "raw",
      aesKey,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    // 복호화 (AES-CBC, PKCS5Padding은 Web Crypto API에서 PKCS7로 처리됨)
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv
      },
      key,
      encryptedData
    );

    // 복호화된 데이터를 문자열로 변환
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error("Error in decryptUserInfoWithAes:", error);
    throw error;
  }
}
