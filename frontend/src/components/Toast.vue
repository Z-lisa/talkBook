<template>
  <div class="toast" :class="{ active: show }">
    {{ message }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const message = ref('')

function showToast(msg, duration = 2000) {
  message.value = msg
  show.value = true
  setTimeout(() => {
    show.value = false
  }, duration)
}

defineExpose({ showToast })
</script>
