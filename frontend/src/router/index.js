import { createRouter, createWebHistory } from 'vue-router'
import Feed from '../views/Feed.vue'
import Profile from '../views/Profile.vue'
import Publish from '../views/Publish.vue'

const routes = [
  {
    path: '/',
    name: 'Feed',
    component: Feed,
    meta: { title: '首页' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '我的' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: Publish,
    meta: { title: '发布' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
