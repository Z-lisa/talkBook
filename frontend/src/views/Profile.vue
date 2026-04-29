<template>
  <section class="profile-page">
    <div class="profile-layout">
      <!-- 左侧个人资料 -->
      <aside class="profile-sidebar">
        <div class="profile-avatar-section">
          <img :src="user?.avatar || 'https://picsum.photos/seed/default/100/100'" class="profile-avatar" @click="handleAvatarClick">
          <h2 class="profile-name">{{ user?.username || '未登录' }}</h2>
          <p class="profile-id" @click="handleLoginClick">{{ isLoggedIn ? `ID: ${user?.id}` : '点击登录' }}</p>
        </div>
        
        <div class="profile-stats">
          <div class="stat-item" @click="showFollowing">
            <div class="stat-num">{{ stats.following }}</div>
            <div class="stat-label">关注</div>
          </div>
          <div class="stat-item" @click="showFollowers">
            <div class="stat-num">{{ stats.followers }}</div>
            <div class="stat-label">粉丝</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ stats.likes }}</div>
            <div class="stat-label">获赞</div>
          </div>
        </div>
        
        <div class="profile-actions" v-if="isLoggedIn">
          <button class="btn btn-primary">✏️ 编辑资料</button>
          <button class="btn btn-secondary">⚙️ 设置</button>
        </div>
      </aside>
      
      <!-- 右侧内容 -->
      <main class="profile-main">
        <div class="profile-tabs">
          <div class="tab-item" :class="{ active: activeTab === 'works' }" @click="switchTab('works')">作品</div>
          <div class="tab-item" :class="{ active: activeTab === 'liked' }" @click="switchTab('liked')">已点赞</div>
          <div class="tab-item" :class="{ active: activeTab === 'collected' }" @click="switchTab('collected')">收藏</div>
        </div>
        
        <div class="tab-content" v-show="activeTab === 'works'">
          <div class="grid-container">
            <div class="grid-item" v-for="post in userPosts" :key="post.id">
              <img :src="post.image" :alt="post.title">
            </div>
            <div v-if="userPosts.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <span class="empty-text">还没有发布作品</span>
            </div>
          </div>
        </div>
        
        <div class="tab-content" v-show="activeTab === 'liked'">
          <div class="grid-container">
            <div class="grid-item" v-for="post in likedPosts" :key="post.id">
              <img :src="post.image" :alt="post.title">
            </div>
            <div v-if="likedPosts.length === 0" class="empty-state">
              <div class="empty-icon">❤️</div>
              <span class="empty-text">还没有点赞内容</span>
            </div>
          </div>
        </div>
        
        <div class="tab-content" v-show="activeTab === 'collected'">
          <div class="grid-container">
            <div class="grid-item" v-for="post in collectedPosts" :key="post.id" @click="openPost(post)">
              <img :src="post.image" :alt="post.title">
            </div>
            <div v-if="collectedPosts.length === 0" class="empty-state">
              <div class="empty-icon">⭐</div>
              <span class="empty-text">还没有收藏内容</span>
              <p style="margin-top: 8px; font-size: 13px; color: var(--text-tertiary);">点击首页卡片的⭐按钮收藏</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'

const userStore = useUserStore()
const postsStore = usePostsStore()

const user = computed(() => userStore.currentUser)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const activeTab = ref('works')

const stats = ref({
  following: 0,
  followers: 0,
  likes: 0
})

const userPosts = computed(() => postsStore.userPosts)
const likedPosts = computed(() => postsStore.likedPosts)
const collectedPosts = computed(() => postsStore.collectedPosts)

onMounted(() => {
  if (isLoggedIn.value) {
    loadUserData()
  }
})

watch(() => isLoggedIn.value, (newVal) => {
  if (newVal) {
    loadUserData()
  }
})

async function loadUserData() {
  if (!user.value?.id) return
  await postsStore.fetchUserPosts(user.value.id)
  await postsStore.fetchLikedPosts()
  await postsStore.fetchCollectedPosts()
  console.log('收藏的帖子:', collectedPosts.value)
}

async function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'collected' && isLoggedIn.value) {
    await postsStore.fetchCollectedPosts()
    console.log('刷新收藏的帖子:', collectedPosts.value)
  }
}

function openPost(post) {
  console.log('打开帖子:', post)
}

function handleAvatarClick() {
  if (!isLoggedIn.value) {
    userStore.openLoginModal()
  }
}

function handleLoginClick() {
  if (!isLoggedIn.value) {
    userStore.openLoginModal()
  }
}

function showFollowing() {
  console.log('显示关注列表')
}

function showFollowers() {
  console.log('显示粉丝列表')
}
</script>
