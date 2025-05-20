import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '@/views/Homepage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Homepage,
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/Auth.vue'),
    },
    {
      path: '/news/category/:cat',
      name: 'cat-page',
      component: () => import('@/views/CatPage.vue'),
    },
    {
      path: '/news/baca-news/:query/:title',
      name: 'news-page',
      component: () => import('@/views/NewsPage.vue')
    },
    {
      path: '/profile',
      name: 'profile-page',
      component: () => import(`@/views/ProfilePage.vue`)
    },
    {
      path: '/news/baca-news/article/bookmarks/:query/:title',
      name: 'news-page-bookmarks',
      component: () => import('@/views/NewsPageBookmarked.vue')
    },
    {
      path: '/news/baca-news/headline/:query/:title',
      name: 'news-page-headline',
      component: () => import('@/views/NewsPageHeadline.vue')
    },
    {
      path :'/profile/bookmarks/seeall',
      name: 'user-bookmarked-posts',
      component: () => import('@/views/BookmarksSeeall.vue')
    },
    {
      path: '/news/search',
      name: 'search-result',
      component: () => import('@/views/SearchIndex.vue')
    },
    {
      path: '/news/search/baca/:query/:title',
      name: 'news-page-search',
      component: () => import('@/views/NewsPageSearch.vue')
    }
  ],
})

export default router
