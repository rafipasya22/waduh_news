<script setup>
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import Post_big from '@/components/post_big.vue'
import Post_mid from '@/components/post_mid.vue'
import pagination from '@/components/pagination.vue'
import Skel from '@/components/post_big_skeleton.vue'
import Skel_long from '@/components/post_long_skeleton.vue'
import Skel_mid from '@/components/post_mid_skeleton.vue'
import Noti from '@/components/noti.vue'
import Post_mv from '@/components/post_most_viewed.vue'
import Skel_mv from '@/components/post_most_viewed_skeleton.vue'
import Share_mod from '@/components/sharemodal.vue'
import { bookmarkpost } from '@/composables/bookmark.vue'
import { analytics } from '@/composables/post_analytics.vue'
import { userdata } from '@/composables/get_userdata.vue'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const { getcomments, getlike, getUserInfo } = analytics()
const { userData, getUserData } = userdata()
const { bookmarkedTitles, fetchBookmarks, toggleBookmark } = bookmarkpost(router)

import '@/assets/style.css'
import { onMounted, ref } from 'vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const catNewsHeadline = ref([])
const mostViewed = ref([])
const isUserLoggedIn = ref(false)
const newsList = ref([])
const totalPages = ref(1)
const currentPage = ref(1)
const isSuccess = ref(false)
const taskMsg = ref(null)
const route = useRoute()
let isLoading = ref(true)

const postData = ref(null)

function openShareModal(post) {
  postData.value = post
  console.log('sko: ', postData.value)
}

const cat = computed(() => route.params.cat || route.path.split('/').pop())

const capCat = computed(() => {
  return cat.value.charAt(0).toUpperCase() + cat.value.slice(1).toLowerCase()
})

async function fetchCatNews(page = 1) {
  const res = await fetch(`/api/catpage/${encodeURIComponent(cat.value)}`)
  const data = await res.json()
  if (!res.ok) throw new Error('Failed to fetch news')
  const CatHeadline = data.catHeadline.news.slice(0, 3)
  const CatNewest = data.catNewest.news
  const CatMV = data.catMostViewed.news.slice(0, 10)

  console.log(CatMV)

  const catNews = [
    ...CatHeadline.map((post) => ({ ...post, sourceType: 'headline' })),
    ...CatNewest.map((post) => ({ ...post, sourceType: 'headline' })),
    ...CatMV.map((post) => ({ ...post, sourceType: 'headline' })),
  ]

  await Promise.all([getlike(catNews), getcomments(catNews)])
  newsList.value = CatNewest.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: CatHeadline.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: CatHeadline.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  totalPages.value = data.catNewest.total_pages
  currentPage.value = page

  catNewsHeadline.value = CatHeadline.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: CatHeadline.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: CatHeadline.find((p) => p.title === post.title)?.total_comments || 0,
  }))

  mostViewed.value = CatMV.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: CatHeadline.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: CatHeadline.find((p) => p.title === post.title)?.total_comments || 0,
  }))
}

function taskNoti({ message, success }) {
  taskMsg.value = message
  isSuccess.value = success
  const noti = document.querySelector('.noti')
  noti.classList.add('show')
  setTimeout(() => {
    noti.classList.remove('show')
  }, 10000)
}

const changePage = async (page = 1) => {
  try {
    const response = await fetch(
      `/api/news/category/newest/${encodeURIComponent(cat.value)}?page=${page}&page_size=5`,
    )
    const data = await response.json()
    if (data.error) {
      console.error(data.error)
      return
    }
    newsList.value = data.news
    totalPages.value = data.total_pages
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

const capitalize = (text) => {
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : ''
}

watch(cat, async () => {
  fetchCatNews()
})

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

const getRedirect = (news) => {
  return `/news/baca-news/headline/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  newsList.value = []
  console.log(cat.value)
  console.log(typeof cat.value)
  await getUserData()
  isUserLoggedIn.value = await getUserInfo()
  await fetchCatNews()
  console.log('mv: ', mostViewed.value)

  console.log(catNewsHeadline.value)

  const allTitles = [...catNewsHeadline.value].map((p) => p.title)
  fetchBookmarks(allTitles)
  isLoading.value = false
})
</script>

<template>
  <Navbar :loggedIn="isUserLoggedIn" :profilephoto="userData.ProfilePhoto" @notify="taskNoti" />
  <div class="content news-index mb-5">
    <div class="todays-headline">
      <div class="headline-title">
        <h3 class="Headline-top">{{ capCat }}</h3>
        <h2 class="Headline-bottom">Headline</h2>
      </div>
      <div class="top d-flex flex-row align-items-start"></div>
    </div>
    <div class="popular">
      <div v-if="isLoading" class="top d-flex flex-row align-items-start">
        <div class="popular-mid">
          <Skel_mid v-for="x in 2" :key="x" />
        </div>
        <Skel />
      </div>
      <div v-else class="top d-flex flex-row align-items-start">
        <div class="popular-mid">
          <Post_mid
            v-for="(post, index) in catNewsHeadline.slice(1, 3)"
            :key="index"
            :post="post"
            :bookmarked="bookmarkedTitles.includes(post.title)"
            :userdata="userData"
            @toggleBookmark="() => toggleBookmark(post, taskNoti)"
            @opensharemodal="openShareModal"
          />
        </div>
        <Post_big
          v-if="catNewsHeadline[0]"
          :post="catNewsHeadline[0]"
          :bookmarked="bookmarkedTitles.includes(catNewsHeadline[0].title)"
          :userdata="userData"
          @toggleBookmark="() => toggleBookmark(catNewsHeadline[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>
    <div class="recent mt-2">
      <div
        class="liked-top d-flex justify-content-between align-items-center flex-row mt-4"
        style="width: 100%"
      >
        <div class="liked-posts-title">
          <h3>Recent <span>Posts</span></h3>
        </div>
      </div>
      <div class="container-recent d-flex justify-content-between align-items-start flex-row">
        <div
          class="recent-posts-profile d-flex justify-content-between align-items-start flex-column mt-2 me-3"
        >
          <div
            v-if="isLoading"
            class="container-post d-flex justify-content-center align-items-start flex-column"
          >
            <Skel_long v-for="x in 5" :key="x" />
          </div>

          <div
            v-else
            class="container-post d-flex justify-content-center align-items-start flex-column"
          >
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
            <div
              v-if="isLoading"
              class="pagination-container d-flex justify-content-center flex-grow-1"
            >
              <nav></nav>
            </div>
            <div v-else class="pagination-container d-flex justify-content-center flex-grow-1">
              <nav>
                <pagination
                  :totalPages="totalPages"
                  :currentPage="currentPage"
                  @page-changed="changePage"
                />
              </nav>
            </div>
          </div>
        </div>
        <div class="most-viewed justify-content-center align-items-start flex-column mt-2">
          <h2 class="px-3 pt-3">Most Viewed</h2>
          <div v-if="isLoading" class="popular-island px-4 py-0">
            <Skel_mv v-for="x in 7" :key="x" />
          </div>
          <div v-else class="popular-island px-4 py-0">
            <Post_mv
              v-for="(post, index) in mostViewed.slice(0, 10)"
              :key="index"
              :post="post"
              :post_number="index"
            />
          </div>
        </div>
      </div>
    </div>
    <Noti :taskStatus="isSuccess" :taskMsg="taskMsg" />
  </div>
  <Footer></Footer>
  <Share_mod :postData="postData" />
</template>
