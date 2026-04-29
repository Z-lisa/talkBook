<template>
  <div class="modal" :class="{ active: show }" @click.self="closeModal">
    <div class="modal-content follow-modal">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <span class="close-btn" @click="closeModal">&times;</span>
      </div>
      <div class="modal-body">
        <div class="user-list" v-if="users.length > 0">
          <div class="user-item" v-for="user in users" :key="user.id">
            <div class="user-info">
              <img :src="user.avatar || 'https://picsum.photos/seed/default/50/50'" class="user-avatar">
              <span class="user-name">{{ user.username }}</span>
            </div>
            <button 
              class="follow-btn" 
              :class="{ following: user.isFollowing }"
              @click="toggleFollow(user)"
              v-if="user.id !== currentUserId"
            >
              {{ user.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
        </div>
        <div class="empty-state" v-else>
          <div class="empty-icon">👥</div>
          <span class="empty-text">{{ emptyText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { getMyFollowing, getMyFollowers, toggleFollow as apiToggleFollow } from '../api'

const props = defineProps({
  show: Boolean,
  type: String,
  userId: Number
})

const emit = defineEmits(['close', 'update'])

const users = ref([])
const currentUserId = ref(parseInt(localStorage.getItem('userId')))

const title = computed(() => props.type === 'following' ? '我的关注' : '我的粉丝')
const emptyText = computed(() => props.type === 'following' ? '还没有关注任何人' : '还没有粉丝')

watch(() => props.show, async (newVal) => {
  if (newVal) {
    await loadUsers()
  }
})

async function loadUsers() {
  console.log('加载用户列表, type:', props.type)
  try {
    let data
    if (props.type === 'following') {
      data = await getMyFollowing()
    } else {
      data = await getMyFollowers()
    }
    console.log('获取到的数据:', data)
    users.value = data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
    users.value = []
  }
}

async function toggleFollow(user) {
  try {
    const result = await apiToggleFollow(user.id)
    user.isFollowing = result.isFollowing
    emit('update')
  } catch (error) {
    console.error('关注操作失败:', error)
    alert(error.message || '操作失败')
  }
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal.active {
  display: flex;
}

.modal-content {
  background: var(--surface-color);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 70vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  line-height: 1;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  max-height: calc(70vh - 60px);
}

.user-list {
  padding: 8px 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  transition: background 0.2s;
}

.user-item:hover {
  background: var(--background-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.follow-btn {
  padding: 6px 16px;
  border-radius: 16px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: var(--primary-color);
  color: white;
  transition: all 0.2s;
}

.follow-btn.following {
  background: var(--surface-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.follow-btn:hover {
  opacity: 0.9;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
