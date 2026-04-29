import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as api from '../api'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token'))
  const showLoginModal = ref(false)
  const following = ref([])
  const followers = ref([])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => currentUser.value?.id)

  // Actions
  function setToken(newToken) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function setUser(user) {
    currentUser.value = user
  }

  function openLoginModal() {
    showLoginModal.value = true
  }

  function closeLoginModal() {
    showLoginModal.value = false
  }

  async function login(credentials) {
    const response = await api.login(credentials)
    setToken(response.token)
    setUser(response.user)
    closeLoginModal()
    return response
  }

  async function register(userData) {
    const response = await api.register(userData)
    setToken(response.token)
    setUser(response.user)
    closeLoginModal()
    return response
  }

  function logout() {
    setToken(null)
    setUser(null)
    following.value = []
    followers.value = []
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      const user = await api.getCurrentUser()
      setUser(user)
    } catch (error) {
      logout()
    }
  }

  return {
    currentUser,
    token,
    showLoginModal,
    following,
    followers,
    isLoggedIn,
    userId,
    setToken,
    setUser,
    openLoginModal,
    closeLoginModal,
    login,
    register,
    logout,
    fetchUserInfo
  }
})
