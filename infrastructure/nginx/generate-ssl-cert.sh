#!/bin/bash
# 자체 서명 SSL 인증서 생성 스크립트
# IP 주소로 SSL 443 서비스를 위한 인증서

# 설정
SSL_DIR="/etc/nginx/ssl"
DAYS=365
KEY_SIZE=2048

# 서버 IP 주소 입력 (기본값: 서버의 첫 번째 IP)
SERVER_IP="${1:-$(hostname -I | awk '{print $1}')}"

echo "========================================"
echo "SSL 인증서 생성 스크립트"
echo "========================================"
echo "서버 IP: $SERVER_IP"
echo "인증서 경로: $SSL_DIR"
echo "유효 기간: ${DAYS}일"
echo "========================================"

# SSL 디렉토리 생성
mkdir -p "$SSL_DIR"

# OpenSSL 설정 파일 생성 (IP SAN 포함)
cat > /tmp/openssl.cnf << EOF
[req]
default_bits = $KEY_SIZE
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = KR
ST = Seoul
L = Seoul
O = Organization
OU = IT
CN = $SERVER_IP

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
IP.1 = $SERVER_IP
IP.2 = 127.0.0.1
DNS.1 = localhost
EOF

# 인증서 생성
echo ""
echo "인증서 생성 중..."
openssl req -x509 -nodes -days $DAYS -newkey rsa:$KEY_SIZE \
    -keyout "$SSL_DIR/server.key" \
    -out "$SSL_DIR/server.crt" \
    -config /tmp/openssl.cnf

# 권한 설정
chmod 600 "$SSL_DIR/server.key"
chmod 644 "$SSL_DIR/server.crt"

# 임시 파일 삭제
rm -f /tmp/openssl.cnf

echo ""
echo "========================================"
echo "인증서 생성 완료!"
echo "========================================"
echo "인증서 파일: $SSL_DIR/server.crt"
echo "개인키 파일: $SSL_DIR/server.key"
echo ""
echo "인증서 정보:"
openssl x509 -in "$SSL_DIR/server.crt" -noout -subject -dates
echo ""
echo "Nginx 재시작: sudo systemctl restart nginx"
echo "========================================"
