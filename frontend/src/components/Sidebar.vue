<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand">
        <div class="logo-icon">📖</div>
        <div class="logo-text">
          <span class="logo-main">生活日记</span>
          <span class="logo-sub">Life Diary</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-item" :class="{ active: currentRoute === 'Feed' }" @click="navigateTo('Feed')">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </div>
      <div class="nav-item" :class="{ active: currentRoute === 'Profile' }" @click="navigateTo('Profile')">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我的</span>
      </div>
    </nav>

    <div class="sidebar-bottom">
      <div class="nav-item nav-publish" @click="navigateTo('Publish')">
        <span class="nav-icon">+</span>
        <span class="nav-text">发布</span>
      </div>

      <div class="sidebar-footer">
        <div class="user-mini" @click="handleUserClick">
          <img :src="user?.avatar || 'https://picsum.photos/seed/default/50/50'" class="user-mini-avatar">
          <span class="user-mini-name">{{ user?.username || '登录' }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentRoute = computed(() => route.name)
const user = computed(() => userStore.currentUser)

function navigateTo(name) {
  router.push({ name })
}

function handleUserClick() {
  if (userStore.isLoggedIn) {
    navigateTo('Profile')
  } else {
    userStore.openLoginModal()
  }
}
</script>

<style scoped>
.sidebar-bottom {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.nav-publish {
  margin-bottom: 12px;
  background: var(--text-primary);
  color: white;
  border-radius: 12px;
}

.nav-publish:hover {
  background: var(--primary-light);
  color: white;
}

.nav-publish .nav-icon {
  font-weight: bold;
}

.sidebar-footer {
  padding: 0;
  border-top: none;
}
</style>
