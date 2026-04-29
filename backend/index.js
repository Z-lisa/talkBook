const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'xiaohongshu-secret-key-2024';

app.use(cors());
app.use(express.json());

// JWT 验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '未提供令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '令牌无效' });
    }
    req.user = user;
    next();
  });
};

// ============ 用户相关 API ============

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: '密码至少需要6位' });
  }

  // 检查用户名是否已存在
  const existingUser = db.getUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ message: '用户名已存在' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatar = `https://picsum.photos/seed/${username}/100/100`;
  
  const user = db.createUser(username, hashedPassword, avatar);
  
  const token = jwt.sign({ userId: user.id, username }, JWT_SECRET);
  
  res.json({
    message: '注册成功',
    token,
    user: { id: user.id, username: user.username, avatar: user.avatar }
  });
});

// 用户登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const user = db.getUserByUsername(username);
  
  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  // 获取完整用户信息（包含密码）进行验证
  const fullUser = db.users.get(user.id);
  const isValid = await bcrypt.compare(password, fullUser.password);
  
  if (!isValid) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
  
  res.json({
    message: '登录成功',
    token,
    user: { id: user.id, username: user.username, avatar: user.avatar }
  });
});

// 获取当前用户信息
app.get('/api/user', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  res.json(user);
});

// 获取用户统计信息
app.get('/api/user/stats', authenticateToken, (req, res) => {
  const stats = db.getUserStats(req.user.userId);
  res.json(stats);
});

// ============ 帖子相关 API ============

// 获取所有帖子
app.get('/api/posts', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const posts = db.getAllPosts(parseInt(page), parseInt(limit));

  // 获取当前用户ID（如果有登录）
  let userId = null;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {}
  }

  const formattedPosts = posts.map(post => {
    const author = db.getUserById(post.userId);
    const comments = db.getCommentsByPostId(post.id);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      likes: post.likes,
      collects: post.collects || 0,
      comments: comments,
      commentCount: comments.length,
      createdAt: post.createdAt,
      isLiked: userId ? db.hasLiked(userId, post.id) : false,
      isCollected: userId ? db.hasCollected(userId, post.id) : false,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null
    };
  });

  res.json(formattedPosts);
});

// 获取单个帖子
app.get('/api/posts/:id', (req, res) => {
  const post = db.getPostById(parseInt(req.params.id));
  
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }

  const author = db.getUserById(post.userId);
  
  res.json({
    id: post.id,
    title: post.title,
    content: post.content,
    image: post.image,
    likes: post.likes,
    createdAt: post.createdAt,
    author: author ? {
      id: author.id,
      username: author.username,
      avatar: author.avatar
    } : null
  });
});

// 发布帖子
app.post('/api/posts', authenticateToken, (req, res) => {
  const { title, content, image } = req.body;

  if (!title || !image) {
    return res.status(400).json({ message: '标题和图片不能为空' });
  }

  const post = db.createPost(req.user.userId, title, content || '', image);

  res.json({
    message: '发布成功',
    postId: post.id
  });
});

// 删除帖子
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = db.getPostById(postId);
  
  if (!post) {
    return res.status(404).json({ message: '帖子不存在' });
  }
  
  if (post.userId !== req.user.userId) {
    return res.status(403).json({ message: '无权删除此帖子' });
  }

  db.deletePost(postId);
  res.json({ message: '删除成功' });
});

// 获取用户的帖子
app.get('/api/users/:userId/posts', (req, res) => {
  const userId = parseInt(req.params.userId);
  const posts = db.getPostsByUserId(userId);

  const formattedPosts = posts.map(post => {
    const author = db.getUserById(post.userId);
    const comments = db.getCommentsByPostId(post.id);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      likes: post.likes,
      commentCount: comments.length,
      createdAt: post.createdAt,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null
    };
  });

  res.json(formattedPosts);
});

// ============ 点赞相关 API ============

// 点赞/取消点赞
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const result = db.toggleLike(req.user.userId, postId);

  res.json({
    message: result.isLiked ? '点赞成功' : '取消点赞成功',
    isLiked: result.isLiked,
    likes: result.likes
  });
});

// 获取用户点赞的帖子
app.get('/api/user/likes', authenticateToken, (req, res) => {
  const posts = db.getLikedPosts(req.user.userId);

  const formattedPosts = posts.map(post => {
    const author = db.getUserById(post.userId);
    const comments = db.getCommentsByPostId(post.id);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      likes: post.likes,
      commentCount: comments.length,
      createdAt: post.createdAt,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null
    };
  });

  res.json(formattedPosts);
});

// 检查是否已点赞
app.get('/api/posts/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const isLiked = db.hasLiked(req.user.userId, postId);
  res.json({ isLiked });
});

// ============ 收藏相关 API ============

// 收藏/取消收藏
app.post('/api/posts/:id/collect', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.userId;
  console.log(`用户 ${userId} 尝试收藏/取消收藏帖子 ${postId}`);
  const result = db.toggleCollect(userId, postId);
  console.log('收藏操作结果:', result);

  res.json({
    message: result.isCollected ? '收藏成功' : '取消收藏成功',
    isCollected: result.isCollected,
    collects: result.collects
  });
});

// 获取用户收藏的帖子
app.get('/api/user/collections', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  console.log(`获取用户 ${userId} 的收藏列表`);
  const posts = db.getCollectedPosts(userId);
  console.log(`找到 ${posts.length} 个收藏的帖子`);

  const formattedPosts = posts.map(post => {
    const author = db.getUserById(post.userId);
    const comments = db.getCommentsByPostId(post.id);
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      image: post.image,
      likes: post.likes,
      commentCount: comments.length,
      createdAt: post.createdAt,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null
    };
  });

  res.json(formattedPosts);
});

// 检查是否已收藏
app.get('/api/posts/:id/collect', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const isCollected = db.hasCollected(req.user.userId, postId);
  res.json({ isCollected });
});

// ============ 评论相关 API ============

// 获取帖子评论
app.get('/api/posts/:id/comments', (req, res) => {
  const postId = parseInt(req.params.id);
  const comments = db.getCommentsByPostId(postId);

  const formattedComments = comments.map(comment => {
    const author = db.getUserById(comment.userId);
    return {
      id: comment.id,
      content: comment.content,
      likes: comment.likes,
      createdAt: comment.createdAt,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar
      } : null
    };
  });

  res.json(formattedComments);
});

// 发表评论
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ message: '评论内容不能为空' });
  }

  const comment = db.createComment(req.user.userId, postId, content);
  const author = db.getUserById(req.user.userId);

  res.json({
    message: '评论成功',
    id: comment.id,
    content: comment.content,
    likes: comment.likes,
    createdAt: comment.createdAt,
    author: author ? {
      id: author.id,
      username: author.username,
      avatar: author.avatar
    } : null
  });
});

// 删除评论
app.delete('/api/comments/:id', authenticateToken, (req, res) => {
  const commentId = parseInt(req.params.id);
  const comment = db.getCommentById(commentId);
  
  if (!comment) {
    return res.status(404).json({ message: '评论不存在' });
  }
  
  if (comment.userId !== req.user.userId) {
    return res.status(403).json({ message: '无权删除此评论' });
  }

  db.deleteComment(commentId);
  res.json({ message: '删除成功' });
});

// 点赞评论
app.post('/api/comments/:id/like', authenticateToken, (req, res) => {
  const commentId = parseInt(req.params.id);
  const result = db.toggleCommentLike(req.user.userId, commentId);
  
  res.json({
    message: result.isLiked ? '点赞成功' : '取消点赞成功',
    isLiked: result.isLiked
  });
});

// ============ 关注相关 API ============

// 关注/取消关注用户
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  const followingId = parseInt(req.params.id);
  const followerId = req.user.userId;

  if (followingId === followerId) {
    return res.status(400).json({ message: '不能关注自己' });
  }

  const result = db.toggleFollow(followerId, followingId);
  
  res.json({
    message: result.isFollowing ? '关注成功' : '已取消关注',
    isFollowing: result.isFollowing
  });
});

// 获取关注列表
app.get('/api/user/following', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const following = db.getFollowing(userId);
  
  const result = following.map(user => ({
    ...user,
    isMutual: db.hasFollowed(user.id, userId)
  }));
  
  res.json(result);
});

// 获取粉丝列表
app.get('/api/user/followers', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const followers = db.getFollowers(userId);
  
  const result = followers.map(user => ({
    ...user,
    isFollowing: db.hasFollowed(userId, user.id)
  }));
  
  res.json(result);
});

// 检查是否已关注
app.get('/api/users/:id/follow', authenticateToken, (req, res) => {
  const followingId = parseInt(req.params.id);
  const isFollowing = db.hasFollowed(req.user.userId, followingId);
  res.json({ isFollowing });
});

// 搜索用户
app.get('/api/users/search', (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json([]);
  }

  const users = [];
  for (const user of db.users.values()) {
    if (user.username.includes(q)) {
      const { password, ...userWithoutPassword } = user;
      users.push(userWithoutPassword);
    }
    if (users.length >= 20) break;
  }

  res.json(users);
});

// 初始化数据 - 生活日记主题
async function initData() {
  const defaultUsers = [
    { username: '小确幸日常', password: '123456', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    { username: '咖啡时光', password: '123456', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    { username: '清晨日记', password: '123456', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    { username: '周末漫游', password: '123456', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
    { username: '手作时光', password: '123456', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop' },
    { username: ' plant妈妈', password: '123456', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
    { username: '城市漫步', password: '123456', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    { username: '读书角落', password: '123456', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' }
  ];

  // 生活日记主题内容 - 真实场景图片
  const lifePosts = [
    { title: '早晨的第一缕阳光，开启元气满满的一天', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', likes: 328 },
    { title: '今天做的早餐，简单又美味', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=600&fit=crop', likes: 256 },
    { title: '街角新开的咖啡馆，氛围感满满', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=500&fit=crop', likes: 412 },
    { title: '周末去公园散步，樱花开了', image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=550&fit=crop', likes: 189 },
    { title: '下雨天适合在家看书喝茶', image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=500&fit=crop', likes: 567 },
    { title: '最近在读的一本书，推荐给大家', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop', likes: 234 },
    { title: '阳台上的小花园，看着心情就好', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=500&fit=crop', likes: 445 },
    { title: '自己动手做的晚餐，很有成就感', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=550&fit=crop', likes: 312 },
    { title: '黄昏时分的城市，格外温柔', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=450&fit=crop', likes: 678 },
    { title: '买的新绿植，给房间增添生机', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=600&fit=crop', likes: 289 },
    { title: '午后的阳光洒在书桌上', image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=400&h=500&fit=crop', likes: 156 },
    { title: '和朋友的下午茶时光', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=550&fit=crop', likes: 423 },
    { title: '发现一家宝藏书店，可以待一整天', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', likes: 378 },
    { title: '周末市集淘到的好物', image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=500&fit=crop', likes: 245 },
    { title: '今天的晚霞太美了，忍不住拍照', image: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&h=450&fit=crop', likes: 892 },
    { title: '重新布置了一下房间，感觉焕然一新', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=550&fit=crop', likes: 334 },
    { title: '早起做瑜伽，一天都精神满满', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop', likes: 267 },
    { title: '路边的小花店，买了束向日葵', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=500&fit=crop', likes: 456 },
    { title: '晚上自己做的蛋糕，虽然卖相一般但很好吃', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=550&fit=crop', likes: 198 },
    { title: '雨后的街道，空气清新', image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400&h=600&fit=crop', likes: 523 }
  ];

  console.log('初始化生活日记数据...');

  // 创建默认用户
  for (const userData of defaultUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    db.createUser(userData.username, hashedPassword, userData.avatar);
  }

  // 创建生活日记帖子
  for (let i = 0; i < lifePosts.length; i++) {
    const postData = lifePosts[i];
    const userId = (i % defaultUsers.length) + 1;
    
    const post = db.createPost(userId, postData.title, '', postData.image);
    post.likes = postData.likes;
  }

  // 创建一些关注关系
  db.toggleFollow(1, 2);
  db.toggleFollow(1, 3);
  db.toggleFollow(1, 4);
  db.toggleFollow(2, 1);
  db.toggleFollow(2, 5);
  db.toggleFollow(3, 1);
  db.toggleFollow(3, 6);
  db.toggleFollow(4, 1);
  db.toggleFollow(4, 7);
  db.toggleFollow(5, 2);
  db.toggleFollow(6, 3);

  console.log('生活日记数据初始化完成');
  console.log(`创建了 ${db.users.size} 个用户`);
  console.log(`创建了 ${db.posts.size} 个生活日记`);
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  initData();
});
