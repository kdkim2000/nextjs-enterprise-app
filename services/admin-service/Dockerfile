# Admin Service Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# shared 패키지 복사 및 빌드
COPY shared /app/shared
WORKDIR /app/shared
RUN npm install && npm run build

# 서비스 빌드
WORKDIR /app/service
COPY services/admin-service/package*.json ./

# npm install 후 shared 패키지 심볼릭 링크 생성
RUN npm install --ignore-scripts && \
    rm -rf node_modules/@enterprise/shared && \
    mkdir -p node_modules/@enterprise && \
    ln -s /app/shared node_modules/@enterprise/shared

COPY services/admin-service/src ./src
COPY services/admin-service/tsconfig.json ./
RUN npm run build

# Production 이미지
FROM node:20-alpine

WORKDIR /app

# shared 복사
COPY --from=builder /app/shared /app/shared

# 서비스 복사
COPY --from=builder /app/service/dist ./dist
COPY --from=builder /app/service/node_modules ./node_modules
COPY --from=builder /app/service/package.json ./

EXPOSE 3012

CMD ["node", "dist/server.js"]
