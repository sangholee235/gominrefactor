# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치 (캐시 활용을 위해 package.json 먼저 복사)
COPY package*.json ./
RUN npm install

# Prisma 설정 복사 및 클라이언트 생성
COPY prisma ./prisma/
RUN npx prisma generate

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine

WORKDIR /app

# Prisma 호환성을 위해 OpenSSL 설치
RUN apk add --no-cache openssl

# 프로덕션 실행에 필요한 파일만 복사
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 환경 변수 설정
ENV NODE_ENV=production
EXPOSE 3000

# [핵심] 컨테이너 실행 시 마이그레이션 적용 후 서버 시작
# &&를 사용하여 마이그레이션이 성공했을 때만 서버가 실행되도록 합니다.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
