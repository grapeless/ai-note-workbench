# 构建阶段
FROM node:22-alpine AS build

WORKDIR /app

# 先安装锁定版本的依赖，以便 Docker 复用依赖层缓存。
COPY package.json package-lock.json ./
RUN npm ci

# 只复制构建前端所需的源码和配置，避免把本地文件带入镜像。
COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

# 运行阶段
FROM nginx:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# 仅声明容器监听端口；对宿主机的端口映射由 Docker Compose 决定。
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
