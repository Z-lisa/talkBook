# 生活日记 (Little Red Book) - 全栈版

模仿"生活日记"风格的全栈项目，前端使用原生 HTML、JS、CSS，后端使用 Node.js + Express + SQLite。

## 项目结构

```
littleRedBook/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── app.js          # 前端主逻辑
├── server/             # 后端服务器
│   ├── package.json    # 后端依赖
│   ├── index.js        # 服务器入口
│   ├── database.js     # 数据库配置
│   └── xiaohongshu.db  # SQLite数据库文件
├── package.json        # 项目启动脚本
└── README.md           # 项目说明
```

## 技术栈

### 前端
- **HTML5**: 语义化标签，移动端适配
- **CSS3**: Flexbox/Grid 布局，动画效果，响应式设计
- **JavaScript (ES6+)**: 异步编程，Fetch API

### 后端
- **Node.js**: JavaScript 运行时
- **Express**: Web 框架
- **SQLite3**: 轻量级数据库
- **JWT**: JSON Web Token 身份认证
- **bcryptjs**: 密码加密

## API 接口列表

### 用户相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `GET /api/user` - 获取当前用户信息
- `GET /api/user/stats` - 获取用户统计（关注/粉丝/获赞）
- `PUT /api/user` - 更新用户信息

### 帖子相关
- `GET /api/posts?page=1&limit=20` - 获取帖子列表
- `GET /api/posts/:id` - 获取单个帖子
- `POST /api/posts` - 发布帖子（需登录）
- `DELETE /api/posts/:id` - 删除帖子（需登录）
- `GET /api/users/:userId/posts` - 获取用户的帖子

### 点赞相关
- `POST /api/posts/:id/like` - 点赞/取消点赞（需登录）
- `GET /api/posts/:id/like` - 检查是否已点赞（需登录）
- `GET /api/user/likes` - 获取点赞的帖子（需登录）

### 收藏相关
- `POST /api/posts/:id/collect` - 收藏/取消收藏（需登录）
- `GET /api/posts/:id/collect` - 检查是否已收藏（需登录）
- `GET /api/user/collections` - 获取收藏的帖子（需登录）

### 评论相关
- `GET /api/posts/:id/comments` - 获取帖子评论
- `POST /api/posts/:id/comments` - 发表评论（需登录）
- `DELETE /api/comments/:id` - 删除评论（需登录）
- `POST /api/comments/:id/like` - 点赞评论（需登录）

### 关注相关
- `POST /api/users/:id/follow` - 关注/取消关注（需登录）
- `GET /api/users/:id/follow` - 检查是否已关注（需登录）
- `GET /api/user/following` - 获取关注列表（需登录）
- `GET /api/user/followers` - 获取粉丝列表（需登录）

### 搜索
- `GET /api/users/search?q=keyword` - 搜索用户

## 快速开始

### 1. 安装依赖并启动

```bash
# 安装后端依赖并启动（会自动同时启动前端和后端）
npm run start
```

或者分步启动：

```bash
# 安装后端依赖
cd server && npm install

# 启动后端服务器（端口 3000）
npm run server

# 在新终端启动前端（端口 8080）
npm run client
```

### 2. 访问项目

- 前端: http://localhost:8080
- 后端 API: http://localhost:3000

## 功能特性

### UI 风格
- 极简主义设计
- 主色调：生活日记红 (#ff2442)
- 适配移动端响应式布局

### 页面结构

#### 1. 首页 (Feed)
- 双列瀑布流布局
- 每个卡片包含：封面图、标题、作者头像、昵称、点赞数
- 支持点赞、收藏、评论、分享操作

#### 2. 发布页面
- 图片上传预览
- 标题和内容输入
- 发布新笔记

#### 3. 我的页面 (Profile)
- 背景图 + 头像 + 基本信息
- 关注/粉丝/获赞统计
- 三个标签页：
  - 作品（九宫格展示）
  - 已点赞
  - 收藏

### 核心功能

#### 用户系统
- 用户注册（新功能）
- 用户登录
- JWT Token 身份认证
- 用户信息持久化存储

#### 帖子系统
- 发布图文笔记
- 瀑布流展示
- 帖子详情

#### 互动功能
- 点赞/取消点赞
- 收藏/取消收藏
- 评论发表和查看
- 关注/取消关注用户

## 默认测试账号

首次启动会自动创建以下测试用户：

| 用户名 | 密码 |
|--------|------|
| 美食达人 | 123456 |
| 旅行日记 | 123456 |
| 穿搭博主 | 123456 |
| 生活记录 | 123456 |
| 摄影爱好者 | 123456 |
| 美妆博主 | 123456 |
| 健身达人 | 123456 |
| 读书笔记 | 123456 |

你也可以注册新账号使用。

## 数据存储

- 后端使用 SQLite 数据库存储所有数据
- 数据库文件位于 `server/xiaohongshu.db`
- 前端仅使用 localStorage 存储 JWT Token

## 开发说明

### 添加新的 API 接口

在 `server/index.js` 中添加新的路由：

```javascript
app.get('/api/new-endpoint', authenticateToken, (req, res) => {
  // 你的代码
});
```

### 修改前端 API 调用

在 `js/app.js` 的 API 对象中添加新方法：

```javascript
const API = {
  // ... 现有方法
  
  newMethod: () => API.request('/new-endpoint', {
    method: 'GET'
  })
};
```

## 注意事项

1. 首次启动会自动初始化数据库和测试数据
2. 后端服务必须运行在 3000 端口
3. 前端通过 Fetch API 与后端通信，需要处理跨域
4. 生产环境需要配置环境变量和更安全的数据库

## License

MIT
