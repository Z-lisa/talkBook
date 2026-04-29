const API_BASE = '/api'

// 获取token
function getToken() {
  return localStorage.getItem('token')
}

// 通用请求函数
async function request(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '请求失败')
  }

  return response.json()
}

// 用户相关API
export function login(credentials) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export function register(userData) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
}

export function getCurrentUser() {
  return request('/user')
}

export function getUserById(userId) {
  return request(`/users/${userId}`)
}

export function getUserStats(userId) {
  return request(`/users/${userId}/stats`)
}

export function getFollowing(userId) {
  return request(`/users/${userId}/following`)
}

export function getFollowers(userId) {
  return request(`/users/${userId}/followers`)
}

export function toggleFollow(userId) {
  return request(`/users/${userId}/follow`, {
    method: 'POST'
  })
}

// 帖子相关API
export function getPosts(page = 1, limit = 20) {
  return request(`/posts?page=${page}&limit=${limit}`)
}

export function getUserPosts(userId) {
  return request(`/users/${userId}/posts`)
}

export function getLikedPosts() {
  return request('/user/likes')
}

export function getCollectedPosts() {
  return request('/user/collections')
}

export function createPost(postData) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  })
}

export function toggleLike(postId) {
  return request(`/posts/${postId}/like`, {
    method: 'POST'
  })
}

export function toggleCollect(postId) {
  return request(`/posts/${postId}/collect`, {
    method: 'POST'
  })
}

// 评论相关API
export function getComments(postId) {
  return request(`/posts/${postId}/comments`)
}

export function addComment(postId, content) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}

export function toggleCommentLike(commentId) {
  return request(`/comments/${commentId}/like`, {
    method: 'POST'
  })
}
