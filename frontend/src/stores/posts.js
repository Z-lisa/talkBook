import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '../api'

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref([])
  const userPosts = ref([])
  const likedPosts = ref([])
  const collectedPosts = ref([])
  const currentPost = ref(null)
  const comments = ref([])
  const loading = ref(false)

  // Getters
  const allPosts = computed(() => posts.value)

  // Actions
  async function fetchPosts() {
    loading.value = true
    try {
      const data = await api.getPosts()
      posts.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchUserPosts(userId) {
    const data = await api.getUserPosts(userId)
    userPosts.value = data
    return data
  }

  async function fetchLikedPosts() {
    const data = await api.getLikedPosts()
    likedPosts.value = data
    return data
  }

  async function fetchCollectedPosts() {
    try {
      const data = await api.getCollectedPosts()
      console.log('API返回的收藏数据:', data)
      collectedPosts.value = data || []
      return data
    } catch (error) {
      console.error('获取收藏失败:', error)
      collectedPosts.value = []
      return []
    }
  }

  async function createPost(postData) {
    const newPost = await api.createPost(postData)
    posts.value.unshift(newPost)
    return newPost
  }

  async function toggleLike(postId) {
    const result = await api.toggleLike(postId)
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.likes = result.likes
      post.isLiked = result.isLiked
    }
    return result
  }

  async function toggleCollect(postId) {
    try {
      const result = await api.toggleCollect(postId)
      console.log('收藏操作结果:', result)
      
      // 更新 posts 列表中的收藏状态
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.collects = result.collects
        post.isCollected = result.isCollected
      }
      
      // 如果当前是收藏状态，刷新收藏列表
      if (result.isCollected) {
        await fetchCollectedPosts()
      } else {
        // 如果是取消收藏，从收藏列表中移除
        collectedPosts.value = collectedPosts.value.filter(p => p.id !== postId)
      }
      
      return result
    } catch (error) {
      console.error('收藏操作失败:', error)
      throw error
    }
  }

  async function fetchComments(postId) {
    const data = await api.getComments(postId)
    comments.value = data
    return data
  }

  async function addComment(postId, content) {
    const newComment = await api.addComment(postId, content)
    comments.value.push(newComment)
    return newComment
  }

  return {
    posts,
    userPosts,
    likedPosts,
    collectedPosts,
    currentPost,
    comments,
    loading,
    allPosts,
    fetchPosts,
    fetchUserPosts,
    fetchLikedPosts,
    fetchCollectedPosts,
    createPost,
    toggleLike,
    toggleCollect,
    fetchComments,
    addComment
  }
})
