// 内存数据库 - 使用 JavaScript 对象存储数据

class MemoryDB {
  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.likes = new Map(); // key: `${userId}_${postId}`
    this.collections = new Map(); // key: `${userId}_${postId}`
    this.comments = new Map();
    this.follows = new Map(); // key: `${followerId}_${followingId}`
    this.commentLikes = new Map(); // key: `${userId}_${commentId}`
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
  }

  // 用户相关
  createUser(username, password, avatar) {
    const id = this.userIdCounter++;
    const user = {
      id,
      username,
      password,
      avatar,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  getUserById(id) {
    const user = this.users.get(id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  // 帖子相关
  createPost(userId, title, content, image) {
    const id = this.postIdCounter++;
    const post = {
      id,
      userId,
      title,
      content,
      image,
      likes: 0,
      collects: 0,
      createdAt: new Date().toISOString()
    };
    this.posts.set(id, post);
    return post;
  }

  getPostById(id) {
    return this.posts.get(id) || null;
  }

  getAllPosts(page = 1, limit = 20) {
    const posts = Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const start = (page - 1) * limit;
    const end = start + limit;
    return posts.slice(start, end);
  }

  getPostsByUserId(userId) {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  deletePost(id) {
    return this.posts.delete(id);
  }

  updatePostLikes(postId, delta) {
    const post = this.posts.get(postId);
    if (post) {
      post.likes += delta;
    }
  }

  updatePostCollects(postId, delta) {
    const post = this.posts.get(postId);
    if (post) {
      post.collects += delta;
    }
  }

  // 点赞相关
  toggleLike(userId, postId) {
    const uid = parseInt(userId);
    const pid = parseInt(postId);
    const key = `${uid}_${pid}`;
    const exists = this.likes.has(key);
    const post = this.posts.get(pid);

    if (exists) {
      this.likes.delete(key);
      this.updatePostLikes(pid, -1);
      return { isLiked: false, likes: post ? post.likes : 0 };
    } else {
      this.likes.set(key, {
        userId: uid,
        postId: pid,
        createdAt: new Date().toISOString()
      });
      this.updatePostLikes(pid, 1);
      return { isLiked: true, likes: post ? post.likes : 0 };
    }
  }

  hasLiked(userId, postId) {
    return this.likes.has(`${parseInt(userId)}_${parseInt(postId)}`);
  }

  getLikedPosts(userId) {
    const likedPostIds = [];
    const targetUserId = parseInt(userId);
    for (const [key, like] of this.likes) {
      if (parseInt(like.userId) === targetUserId) {
        likedPostIds.push(like.postId);
      }
    }
    return likedPostIds.map(id => this.posts.get(id)).filter(Boolean);
  }

  // 收藏相关
  toggleCollect(userId, postId) {
    const uid = parseInt(userId);
    const pid = parseInt(postId);
    const key = `${uid}_${pid}`;
    const exists = this.collections.has(key);
    const post = this.posts.get(pid);

    if (exists) {
      this.collections.delete(key);
      this.updatePostCollects(pid, -1);
      return { isCollected: false, collects: post ? post.collects : 0 };
    } else {
      this.collections.set(key, {
        userId: uid,
        postId: pid,
        createdAt: new Date().toISOString()
      });
      this.updatePostCollects(pid, 1);
      return { isCollected: true, collects: post ? post.collects : 0 };
    }
  }

  hasCollected(userId, postId) {
    return this.collections.has(`${parseInt(userId)}_${parseInt(postId)}`);
  }

  getCollectedPosts(userId) {
    const collectedPostIds = [];
    const targetUserId = parseInt(userId);
    for (const [key, collection] of this.collections) {
      if (parseInt(collection.userId) === targetUserId) {
        collectedPostIds.push(collection.postId);
      }
    }
    return collectedPostIds.map(id => this.posts.get(id)).filter(Boolean);
  }

  // 评论相关
  createComment(userId, postId, content) {
    const id = this.commentIdCounter++;
    const comment = {
      id,
      userId,
      postId,
      content,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    this.comments.set(id, comment);
    return comment;
  }

  getCommentsByPostId(postId) {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getCommentById(id) {
    return this.comments.get(id) || null;
  }

  deleteComment(id) {
    return this.comments.delete(id);
  }

  // 评论点赞
  toggleCommentLike(userId, commentId) {
    const key = `${userId}_${commentId}`;
    const exists = this.commentLikes.has(key);
    const comment = this.comments.get(commentId);
    
    if (exists) {
      this.commentLikes.delete(key);
      if (comment) comment.likes--;
      return { isLiked: false };
    } else {
      this.commentLikes.set(key, {
        userId,
        commentId,
        createdAt: new Date().toISOString()
      });
      if (comment) comment.likes++;
      return { isLiked: true };
    }
  }

  // 关注相关
  toggleFollow(followerId, followingId) {
    const key = `${followerId}_${followingId}`;
    const exists = this.follows.has(key);
    
    if (exists) {
      this.follows.delete(key);
      return { isFollowing: false };
    } else {
      this.follows.set(key, {
        followerId,
        followingId,
        createdAt: new Date().toISOString()
      });
      return { isFollowing: true };
    }
  }

  hasFollowed(followerId, followingId) {
    return this.follows.has(`${followerId}_${followingId}`);
  }

  getFollowing(userId) {
    const followingIds = [];
    for (const [key, follow] of this.follows) {
      if (follow.followerId === userId) {
        followingIds.push(follow.followingId);
      }
    }
    return followingIds.map(id => this.getUserById(id)).filter(Boolean);
  }

  getFollowers(userId) {
    const followerIds = [];
    for (const [key, follow] of this.follows) {
      if (follow.followingId === userId) {
        followerIds.push(follow.followerId);
      }
    }
    return followerIds.map(id => this.getUserById(id)).filter(Boolean);
  }

  // 统计
  getUserStats(userId) {
    const following = this.getFollowing(userId).length;
    const followers = this.getFollowers(userId).length;
    
    const posts = this.getPostsByUserId(userId);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

    return { following, followers, likes: totalLikes };
  }
}

module.exports = new MemoryDB();
