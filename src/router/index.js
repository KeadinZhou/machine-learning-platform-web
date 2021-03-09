import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register')
  },
  {
    path: '/project',
    name: 'project',
    component: () => import('@/views/Projects')
  },
  {
    path: '/project/:id',
    name: 'project_open',
    component: () => import('@/views/Project')
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin')
  },
]

const router = new VueRouter({
  routes
})

export default router
