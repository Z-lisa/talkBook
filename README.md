# 生活日记 (Life Diary)

一个基于 Vue3 + Node.js 的全栈生活日记分享平台。

## 项目介绍

模仿"生活日记"风格的全栈项目，采用现代化的前后端分离架构。前端使用 Vue 3 + Vite，后端使用 Node.js + Express。

## 项目结构

```
littleRedBook/
├── frontend/                 # Vue3 前端项目
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   ├── assets/          # 静态资源（样式）
│   │   ├── components/      # Vue 组件
│   │   ├── router/          # Vue Router 配置
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── views/           # 页面视图
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js 后端项目
│   ├── database.js          # 内存数据库
│   ├── index.js             # Express 服务器
│   └── package.json
│
├── .gitignore               # Git 忽略文件
├── package.json             # 项目根配置
└── README.md                # 项目说明
```

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Fetch API** - HTTP 请求

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **JWT** - JSON Web Token 身份认证
- **bcryptjs** - 密码加密
- **内存数据库** - 无需额外数据库依赖

## 功能特性

### 用户系统
- 用户注册 / 登录
- JWT Token 身份认证
- 用户信息管理

### 帖子系统
- 发布图文笔记
- 瀑布流展示（4列响应式）
- 点赞 / 收藏 / 评论
- 分享功能

### 个人主页
- 用户资料展示
- 关注 / 粉丝 / 获赞统计
- 作品 / 已点赞 / 收藏 标签页

### UI 设计
- 高级极简风格
- 浅灰色主题
- PC 端左侧导航栏
- 响应式布局

## API 接口列表

### 用户相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 用户注册 |
| POST | /api/login | 用户登录 |
| GET | /api/user | 获取当前用户 |
| GET | /api/users/:id | 获取用户信息 |
| GET | /api/users/:id/stats | 获取用户统计 |

### 帖子相关
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/posts | 获取帖子列表 |
| GET | /api/posts/:id | 获取单个帖子 |
| POST | /api/posts | 发布帖子（需登录）|
| DELETE | /api/posts/:id | 删除帖子（需登录）|
| GET | /api/users/:id/posts | 获取用户帖子 |

### 互动相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/posts/:id/like | 点赞/取消点赞 |
| POST | /api/posts/:id/collect | 收藏/取消收藏 |
| GET | /api/user/likes | 获取点赞列表 |
| GET | /api/user/collections | 获取收藏列表 |
| GET | /api/posts/:id/comments | 获取评论列表 |
| POST | /api/posts/:id/comments | 发表评论 |

## 快速开始

### 安装依赖

```bash
# 安装所有依赖
npm run install:all
```

### 启动项目

```bash
# 同时启动前端和后端
npm run dev
```

或分别启动：

```bash
# 启动前端 (端口 5173)
npm run dev:frontend

# 启动后端 (端口 3000)
npm run dev:backend
```

### 访问项目

- 前端: http://localhost:5173
- 后端 API: http://localhost:3000

## 测试账号

项目启动时会自动创建测试账号：

| 用户名 | 密码 |
|--------|------|
| 小确幸日常 | 123456 |
| 咖啡时光 | 123456 |
| 清晨日记 | 123456 |

## 开发说明

### 前端开发

```bash
cd frontend

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端开发

```bash
cd backend

# 启动服务器
npm start
```

## 许可证

MIT License
