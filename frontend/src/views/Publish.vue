<template>
  <section class="publish-page">
    <div class="publish-header">
      <h1>发布笔记</h1>
      <p>分享你的生活瞬间</p>
    </div>
    <div class="upload-area" @click="triggerUpload">
      <div class="upload-placeholder">
        <span class="plus-icon">+</span>
        <p>点击上传图片</p>
      </div>
      <input type="file" ref="fileInput" accept="image/*" multiple hidden @change="handleFileChange">
    </div>
    <div class="preview-area">
      <img v-for="(preview, index) in previews" :key="index" :src="preview" class="preview-item">
    </div>
    <div class="form-group">
      <input type="text" v-model="form.title" placeholder="填写标题会有更多赞哦~">
    </div>
    <div class="form-group">
      <textarea v-model="form.content" placeholder="添加正文"></textarea>
    </div>
    <button class="publish-btn" @click="publish" :disabled="!canPublish">发布笔记</button>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePostsStore } from '../stores/posts'

const router = useRouter()
const userStore = useUserStore()
const postsStore = usePostsStore()

const fileInput = ref(null)
const previews = ref([])
const form = reactive({
  title: '',
  content: '',
  images: []
})

const canPublish = computed(() => form.title && (form.images.length > 0 || previews.value.length > 0))

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const files = e.target.files
  if (!files) return

  form.images = Array.from(files)
  previews.value = []

  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previews.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
}

async function publish() {
  if (!userStore.isLoggedIn) {
    userStore.openLoginModal()
    return
  }

  try {
    await postsStore.createPost({
      title: form.title,
      content: form.content,
      image: previews.value[0]
    })

    form.title = ''
    form.content = ''
    form.images = []
    previews.value = []

    router.push('/')
  } catch (error) {
    alert('发布失败: ' + error.message)
  }
}
</script>
