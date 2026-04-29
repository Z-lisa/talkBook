<template>
  <div class="app">
    <Sidebar />
    <main class="main-content">
      <div class="page-container">
        <router-view />
      </div>
    </main>
    <LoginModal v-if="showLoginModal" />
    <Toast />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from './stores/user'
import Sidebar from './components/Sidebar.vue'
import LoginModal from './components/LoginModal.vue'
import Toast from './components/Toast.vue'

const userStore = useUserStore()
const showLoginModal = computed(() => userStore.showLoginModal)

onMounted(() => {
  userStore.fetchUserInfo()
})
</script>
