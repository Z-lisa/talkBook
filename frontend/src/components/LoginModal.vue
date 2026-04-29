<template>
  <div class="modal login-modal active">
    <div class="modal-overlay" @click="closeModal"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isLogin ? '登录' : '注册' }}</h3>
        <span class="close-btn" @click="closeModal">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <input type="text" v-model="form.username" placeholder="用户名" />
        </div>
        <div class="form-group">
          <input type="password" v-model="form.password" placeholder="密码" />
        </div>
        <button class="login-btn" @click="handleSubmit">
          {{ isLogin ? '登录' : '注册' }}
        </button>
        <button class="register-btn" @click="toggleMode">
          {{ isLogin ? '注册新账号' : '已有账号？去登录' }}
        </button>
        <p class="login-tip">测试账号: 小确幸日常 / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const isLogin = ref(true)
const form = reactive({
  username: '',
  password: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  form.username = ''
  form.password = ''
}

function closeModal() {
  userStore.closeLoginModal()
}

async function handleSubmit() {
  if (!form.username || !form.password) {
    alert('请输入用户名和密码')
    return
  }
  try {
    if (isLogin.value) {
      await userStore.login(form)
    } else {
      await userStore.register(form)
    }
  } catch (error) {
    alert(error.message)
  }
}
</script>
