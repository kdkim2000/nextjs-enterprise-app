#!/bin/bash
# 서버 운영 환경용 자체 서명 SSL 인증서 생성 스크립트
# 사용법: ./generate-cert.sh [SERVER_IP]

SSL_DIR="$(dirname "$0")"
DAYS=365
KEY_SIZE=2048

# 서버 IP 주소 (기본값: 첫 번째 IP)
SERVER_IP="${1:-$(hostname -I 2>/dev/null | awk '{print $1}' || echo '127.0.0.1')}"

echo "========================================"
echo "SSL 인증서 생성"
echo "========================================"
echo "서버 IP: $SERVER_IP"
echo "출력 경로: $SSL_DIR"
echo "========================================"

# OpenSSL 설정 파일 생성
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
openssl req -x509 -nodes -days $DAYS -newkey rsa:$KEY_SIZE \
    -keyout "$SSL_DIR/server.key" \
    -out "$SSL_DIR/server.crt" \
    -config /tmp/openssl.cnf

rm -f /tmp/openssl.cnf

echo ""
echo "========================================"
echo "인증서 생성 완료!"
echo "========================================"
echo "인증서: $SSL_DIR/server.crt"
echo "개인키: $SSL_DIR/server.key"
echo ""
echo "Docker 실행:"
echo "  cd infrastructure/docker"
echo "  docker-compose up -d"
echo "========================================"
