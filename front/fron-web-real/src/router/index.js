import { createRouter, createWebHistory } from 'vue-router'
import AuthApp from "@/views/Auth-app.vue";


const routes = [
  {
    path: '/',
    name: 'home',
    component: AuthApp,
    props: (route) => ({ query: route.query.token })
  },
  // {
  //   path: '/user/chat',
  //   name: 'chat',
  //   component: UserChatAreaApp
  // },
  {
    path: '/about',
    name: 'about',
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About-app.vue')
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
