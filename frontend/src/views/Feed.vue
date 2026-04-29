<template>
  <section class="feed-page">
    <div class="feed-header">
      <h1>探索生活</h1>
      <p>发现美好，记录每一个珍贵瞬间</p>
    </div>
    <div class="waterfall-container">
      <div class="note-card" v-for="post in posts" :key="post.id" @click="openPost(post)">
        <img :src="post.image" :alt="post.title" class="card-image">
        <div class="card-content">
          <h3 class="card-title">{{ post.title }}</h3>
          <div class="card-author-row">
            <div class="author-info">
              <img :src="post.author?.avatar || 'https://picsum.photos/seed/default/50/50'" class="author-avatar">
              <span class="author-name">{{ post.author?.username || '未知用户' }}</span>
            </div>
            <button 
              v-if="post.author?.id !== currentUserId" 
              class="follow-btn-mini" 
              :class="{ following: post.author?.isFollowing }"
              @click.stop="toggleFollowUser(post.author)"
            >
              {{ post.author?.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
          <div class="card-actions-row">
            <span class="action-btn" :class="{ liked: post.isLiked }" @click.stop="toggleLike(post)">
              <span class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
              <span>{{ post.likes || 0 }}</span>
            </span>
            <span class="action-btn" :class="{ collected: post.isCollected }" @click.stop="toggleCollect(post)">
              <span class="icon">{{ post.isCollected ? '⭐' : '☆' }}</span>
              <span>{{ post.collects || 0 }}</span>
            </span>
            <span class="action-btn" @click.stop="openComments(post)">
              <span class="icon">💬</span>
              <span>{{ post.comments?.length || 0 }}</span>
            </span>
            <span class="action-btn" @click.stop="sharePost(post)">
              <span class="icon">↗️</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <CommentModal
      :show="showCommentModal"
      :post="currentPost"
      @close="closeCommentModal"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePostsStore } from '../stores/posts'
import { useUserStore } from '../stores/user'
import { toggleFollow } from '../api'
import CommentModal from '../components/CommentModal.vue'

const postsStore = usePostsStore()
const userStore = useUserStore()
const posts = computed(() => postsStore.allPosts)

const showCommentModal = ref(false)
const currentPost = ref(null)
const currentUserId = computed(() => userStore.currentUser?.id)

onMounted(() => {
  postsStore.fetchPosts()
})

function openPost(post) {
  console.log('打开帖子:', post)
}

async function toggleLike(post) {
  await postsStore.toggleLike(post.id)
}

async function toggleCollect(post) {
  await postsStore.toggleCollect(post.id)
}

function openComments(post) {
  currentPost.value = post
  showCommentModal.value = true
}

function closeCommentModal() {
  showCommentModal.value = false
  currentPost.value = null
}

async function toggleFollowUser(author) {
  if (!userStore.isLoggedIn) {
    userStore.openLoginModal()
    return
  }
  if (!author) return
  try {
    const result = await toggleFollow(author.id)
    author.isFollowing = result.isFollowing
  } catch (error) {
    console.error('关注操作失败:', error)
    alert(error.message || '操作失败')
  }
}

function sharePost(post) {
  const shareUrl = window.location.origin + '/post/' + post.id
  const shareText = `${post.title} - 来自生活日记`

  if (navigator.share) {
    navigator.share({
      title: shareText,
      text: post.title,
      url: shareUrl
    }).catch(err => console.log('分享取消:', err))
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('链接已复制到剪贴板')
    }).catch(() => {
      prompt('复制以下链接分享:', shareUrl)
    })
  }
}
</script>

<style scoped>
.action-btn.collected {
  color: #f5a623;
}

.card-author-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.follow-btn-mini {
  padding: 4px 12px;
  border-radius: 12px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background: var(--primary-color);
  color: white;
  transition: all 0.2s;
}

.follow-btn-mini.following {
  background: var(--surface-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.follow-btn-mini:hover {
  opacity: 0.9;
}
</style>
