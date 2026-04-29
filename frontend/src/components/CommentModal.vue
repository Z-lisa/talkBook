<template>
  <div class="modal" :class="{ active: show }" @click.self="closeModal">
    <div class="modal-content comment-modal">
      <div class="modal-header">
        <h3>评论</h3>
        <span class="close-btn" @click="closeModal">&times;</span>
      </div>
      <div class="modal-body">
        <div class="post-preview">
          <img :src="post?.image" class="post-thumb">
          <h4 class="post-title">{{ post?.title }}</h4>
        </div>
        <div class="comments-list" v-if="comments.length > 0">
          <div class="comment-item" v-for="comment in comments" :key="comment.id">
            <img :src="comment.author?.avatar || 'https://picsum.photos/seed/default/50/50'" class="comment-avatar">
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">{{ comment.author?.username || '未知用户' }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
            </div>
          </div>
        </div>
        <div class="no-comments" v-else>
          <p>暂无评论，快来抢沙发吧~</p>
        </div>
        <div class="comment-input-area">
          <input
            type="text"
            v-model="newComment"
            placeholder="说点什么..."
            @keyup.enter="submitComment"
          >
          <button @click="submitComment" :disabled="!newComment.trim()">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { usePostsStore } from '../stores/posts'
import { useUserStore } from '../stores/user'

const props = defineProps({
  show: Boolean,
  post: Object
})

const emit = defineEmits(['close'])

const postsStore = usePostsStore()
const userStore = useUserStore()

const newComment = ref('')

const comments = computed(() => postsStore.comments)

watch(() => props.show, async (newVal) => {
  if (newVal && props.post) {
    await postsStore.fetchComments(props.post.id)
  }
})

async function submitComment() {
  if (!newComment.value.trim()) return

  if (!userStore.isLoggedIn) {
    userStore.openLoginModal()
    return
  }

  try {
    await postsStore.addComment(props.post.id, newComment.value)
    newComment.value = ''
  } catch (error) {
    alert('评论失败: ' + error.message)
  }
}

function closeModal() {
  emit('close')
}

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.comment-modal {
  max-width: 520px;
  max-height: 80vh;
}

.post-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--surface-color);
  border-radius: 8px;
  margin-bottom: 16px;
}

.post-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
}

.post-title {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comments-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.comment-item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

.comment-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.no-comments {
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
}

.comment-input-area {
  display: flex;
  gap: 8px;
}

.comment-input-area input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
}

.comment-input-area input:focus {
  border-color: var(--text-primary);
}

.comment-input-area button {
  padding: 10px 20px;
  background: var(--text-primary);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.comment-input-area button:disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
}
</style>
