<script setup>
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import pagination from '@/components/pagination.vue'
import { userdata } from '@/composables/get_userdata.vue'
import '@/assets/style.css'
import { onMounted, ref } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { analytics } from '@/composables/post_analytics.vue'

const { userData, getUserData } = userdata()
const { getUserInfo } = analytics()
const newsList = ref([])
const total_bookmarks = ref([])
const totalPages = ref(1)
const currentPage = ref(1)
const isUserLoggedIn = ref(false)

const fetchNews = async (page = 1) => {
  try {
    const response = await fetch(`/api/user-bookmarks?page=${page}&page_size=5`)
    const data = await response.json()
    if (data.error) {
      console.error(data.error)
      return
    }
    newsList.value = data.bookmarks
    totalPages.value = data.total_pages
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

function capitalize(input) {
  if (!input) {
    return ''
  }
  return input.charAt(0).toUpperCase() + input.slice(1)
}

const getNewsSource = (news) => {
  if (news.author && news.source_name) {
    return `Reported By ${news.author} via ${news.source_name}`
  } else if (news.author) {
    return `Reported By ${news.author}`
  } else if (news.source_name) {
    return `Reported via ${news.source_name}`
  } else {
    return 'No Source'
  }
}

async function get_total_bookmarks() {
  try {
    const res = await fetch('/api/profile/get_total_bookmarks')

    if (!res.ok) throw new Error('Failed to fetch session')

    const data = await res.json()
    if (data.total_bookmarks_by) {
      total_bookmarks.value = data.total_bookmarks_by || 0
    } else {
      total_bookmarks.value = 0
    }
  } catch (err) {
    console.error('Error getting user info:', err)
    total_bookmarks.value = 0
  }
}

const getRedirect = (news) => {
  return `/news/baca-news/article/bookmarks/${news.category}/${encodeURIComponent(news.title)}`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await getUserData()
  isUserLoggedIn.value = await getUserInfo()
  await fetchNews()
  await get_total_bookmarks()
})
</script>

<template>
  <Navbar :logged-in="isUserLoggedIn" , :profilephoto="userData.ProfilePhoto" />
  <div class="content news-index mb-5">
    <div class="recent mt-2">
      <div
        class="liked-top d-flex justify-content-between align-items-center flex-row mt-4"
        style="width: 100%"
      >
        <div class="liked-posts-title">
          <h3>Bookmarked <span>Posts</span></h3>
          <small style="color: var(--grey)">{{ total_bookmarks }} Posts found in your bookmarks</small>
        </div>
      </div>
      <div class="container-recent d-flex justify-content-between align-items-start flex-row">
        <div
          class="recent-posts-profile bookmarks d-flex justify-content-between align-items-start flex-column mt-2 me-3"
        >
          <div class="container-post user-bookmarks d-flex justify-content-center align-items-start flex-column">
            <div
              v-for="(news, index) in newsList"
              :key="news.title"
              class="post-long d-flex justify-content-start align-items-start flex-row p-1 mb-3"
            >
              <div class="post-image">
                <router-link :to="getRedirect(news)" class="container-img">
                  <img :src="news.imageUrl" :alt="`Image for ${news.title}`" />
                </router-link>
              </div>
              <div
                class="post-content d-flex justify-content-between align-items-start flex-column"
              >
                <div
                  class="text-area-post-long d-flex justify-content-start align-items-start flex-column"
                >
                  <router-link :to="getRedirect(news)" class="post-text-long">
                    <h4>{{ news.title }}</h4>
                  </router-link>
                  <small class="news-long-upload-date">
                    Uploaded {{ formatDate(news.publishedAt) }}
                  </small>
                  <small class="news-long-reporter">
                    <i>{{ getNewsSource(news) }}</i>
                  </small>
                  <div :class="['categories-long', 'news-cat', capitalize(news.category), 'mt-2']">
                    <div class="cat-text px-1">
                      <p class="px-1">{{ capitalize(news.category) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-4" style="width: 100%">
            <div class="pagination-container d-flex justify-content-center flex-grow-1">
              <nav>
                <pagination
                  :totalPages="totalPages"
                  :currentPage="currentPage"
                  @page-changed="fetchNews"
                />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>
