# ============================================
# 生活日记 - 全栈应用 Dockerfile
# 前端: Vue3 + Vite | 后端: Express + Node.js
# 访问地址: http://localhost:3000
# ============================================

# 阶段1: 构建前端应用
FROM node:18-alpine AS frontend-build

WORKDIR /build/frontend

# 安装前端依赖
COPY frontend/package*.json ./
RUN npm ci

# 复制前端源码并构建
COPY frontend/ ./
RUN npm run build

# ============================================

# 阶段2: 构建后端服务
FROM node:18-alpine

WORKDIR /app

# 安装后端依赖
COPY backend/package*.json ./
RUN npm ci --production

# 复制后端源码
COPY backend/ ./

# 从前一阶段复制前端构建产物
COPY --from=frontend-build /build/frontend/dist ./public

# 暴露服务端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/posts', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# 启动命令
CMD ["node", "index.js"]
