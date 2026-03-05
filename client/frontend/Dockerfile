# 1단계: build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 빌드 인자 (Build Arguments) 정의
ARG VITE_API_BASE_URL
ARG VITE_KAKAO_CLIENT_ID
ARG VITE_KAKAO_APP_KEY

# 환경 변수 설정
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_KAKAO_CLIENT_ID=$VITE_KAKAO_CLIENT_ID
ENV VITE_KAKAO_APP_KEY=$VITE_KAKAO_APP_KEY

RUN npm run build


# 2단계: nginx로 정적 파일 서빙
FROM nginx:alpine

# React Router 대응 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
