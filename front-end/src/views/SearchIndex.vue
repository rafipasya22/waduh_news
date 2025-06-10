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
const totalPages = ref(1)
const totalItems = ref(1)
const currentPage = ref(1)
const isUserLoggedIn = ref(false)
const chooseCat = ref([])
const fromDate = ref('')
const toDate = ref('')

const route = useRoute()

const query = route.query.q

const fetchNews = async (page = 1) => {
  try {
    const response = await fetch(`/api/news/search/${query}?page=${page}&page_size=5`)
    const data = await response.json()
    if (data.error) {
      console.error(data.error)
      return
    }
    newsList.value = data.news
    totalPages.value = data.total_pages
    totalItems.value = data.total_items
    currentPage.value = page
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

const fetchNews2 = async (page = 1) => {
  const allNews = []
  let maxTotalPages = 1
  let totalItemsCount = 0

  for (const cat of chooseCat.value) {
    try {
      const response = await fetch(
        `/api/news/advsearch/${query}/${cat}}?from_date=${fromDate.value}&to_date=${toDate.value}&page=${page}&page_size=5`,
      )
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
        return
      }
      allNews.push(...data.news)
      totalItemsCount += data.total_items
      maxTotalPages = Math.max(maxTotalPages, data.total_pages)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  newsList.value = allNews
  totalPages.value = maxTotalPages
  totalItems.value = totalItemsCount
  currentPage.value = page
}

const fetchNews3 = async (page = 1) => {
  try {
    const response = await fetch(
      `/api/news/advsearch/${encodeURIComponent(query)}?from_date=${fromDate.value}&to_date=${toDate.value}&page=${page}&page_size=5`,
    )
    const data = await response.json()
    if (data.error) {
      console.error(data.error)
      return
    }
    newsList.value = data.news
    totalPages.value = data.total_pages
    totalItems.value = data.total_items
    currentPage.value = page
    console.log(data);
  } catch (error) {
    console.error('Error fetching news:', error)
  }
}

const fetchNews4 = async (page = 1) => {
  const allNews = []
  let maxTotalPages = 1
  let totalItemsCount = 0

  for (const cat of chooseCat.value) {
    try {
      const response = await fetch(
        `/api/news/search/${encodeURIComponent(query)}/${encodeURIComponent(cat)}?page=${page}&page_size=5`,
      )
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
        return
      }
      allNews.push(...data.news)
      totalItemsCount += data.total_items
      maxTotalPages = Math.max(maxTotalPages, data.total_pages)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  newsList.value = allNews
  totalPages.value = maxTotalPages
  totalItems.value = totalItemsCount
  currentPage.value = page
}

const capitalize = (text) => {
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : ''
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

const getRedirect = (news) => {
  return `/news/search/baca/general/${encodeURIComponent(news.title)}`
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const dropdownTitle = computed(() => {
  const count = chooseCat.value.length
  if (count > 0) {
    return `${count} Categor${count > 1 ? 'ies' : 'y'} Chosen`
  } else {
    return 'Choose Categories'
  }
})

async function advsearch() {
  if (fromDate.value && toDate.value) {
    if (chooseCat.value.length > 0) {
      newsList.value = []
      fetchNews2()
    } else {
      newsList.value = []
      fetchNews3()
    }
  } else {
    if (chooseCat.value.length > 0) {
      newsList.value = []
      fetchNews4()
    } else {
      newsList.value = []
      fetchNews()
    }
  }
}

onMounted(async () => {
  await getUserData()
  isUserLoggedIn.value = await getUserInfo()

  console.log('Query pencarian:', query)
  fetchNews()
})
</script>

<template>
  <Navbar :logged-in="isUserLoggedIn" , :profilephoto="userData.ProfilePhoto" @notify="taskNoti"/>
  <div class="content news-index mb-5">
    <div class="headline-title d-flex justify-content-start align-items-center flex-row">
      <h3
        class="me-1"
        style="font-weight: 700 !important; color: var(--dark); margin-bottom: 0 !important"
      >
        Search
      </h3>
      <h3
        class=""
        style="font-weight: 400 !important; color: var(--dark); margin-bottom: 0 !important"
      >
        Result
      </h3>
    </div>
    <div class="Result">
      <div class="liked-top d-flex justify-content-between mb-2" style="width: 100%">
        <small style="color: var(--grey)"
          >Search result: "{{ query }}" found in {{ totalItems }} posts</small
        >
      </div>
      <div class="container-recent d-flex justify-content-between align-items-start flex-row">
        <div
          class="recent-posts-profile d-flex justify-content-between align-items-start flex-column mt-2 me-3"
          id="recent-posts"
        >
          <div class="container-post d-flex justify-content-center align-items-start flex-column">
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
        <div
          class="adv-search not-modal justify-content-center align-items-start flex-column mt-2"
          id="advanced-search"
        >
          <h2 class="px-3 pt-3" style="font-size: 1.6rem">
            Advanced<br /><span style="font-weight: 400">Search</span>
          </h2>
          <form id="advancedSearchForm" @submit.prevent="advsearch">
            <div class="popular-island px-3 py-0" style="width: 100%">
              <h5 class="mt-2" style="font-size: 1.1rem">Show Results From:</h5>

              <div
                class="categories-adv-search d-flex justify-content-start align-items-start flex-column"
              >
                <div
                  class="adv-search-item d-flex justify-content-start align-items-start flex-column"
                >
                  <div class="adv-cate d-flex justify-content-start align-items-start">
                    <small style="color: var(--dark)">Categories: </small>
                    <div class="dropdown" style="width: 100% !important">
                      <a
                        class="adv-search-item-btn dropdown-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span class="adv-search-item-dropdown-title">{{ dropdownTitle }}</span>
                      </a>

                      <div
                        class="adv dropdown-menu p-4"
                        style="
                          padding: 0.5rem;
                          width: 320px !important;
                          padding-top: 1rem !important;
                          position: relative;
                        "
                      >
                        <h2 style="font-size: 1.2rem; color: var(--dark)">Categories</h2>
                        <div class="d-flex justify-content-between align-items-center flex-row">
                          <div
                            class="form-col d-flex justify-content-between align-items-start flex-column me-4"
                          >
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat1"
                                v-model="chooseCat"
                                value="sports"
                              />
                              <label class="form-check-label advsrch" for="cat1">Sports</label>
                            </div>
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat2"
                                v-model="chooseCat"
                                value="technology"
                              />
                              <label class="form-check-label advsrch" for="cat2">Technology</label>
                            </div>
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat3"
                                v-model="chooseCat"
                                value="health"
                              />
                              <label class="form-check-label advsrch" for="cat3">Health</label>
                            </div>
                          </div>
                          <div
                            class="form-col d-flex justify-content-between align-items-start flex-column"
                          >
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat4"
                                v-model="chooseCat"
                                value="science"
                              />
                              <label class="form-check-label advsrch" for="cat4">Science</label>
                            </div>
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat5"
                                v-model="chooseCat"
                                value="entertainment"
                              />
                              <label class="form-check-label advsrch" for="cat5"
                                >Entertainment</label
                              >
                            </div>
                            <div class="form-check">
                              <input
                                type="checkbox"
                                class="form-check-input cat"
                                id="cat6"
                                v-model="chooseCat"
                                value="business"
                              />
                              <label class="form-check-label advsrch" for="cat6">Business</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3" style="width: 100%">
                <h5 style="font-size: 0.9rem">Choose Posts Date:</h5>
                <label for="fromDate"><small style="color: var(--dark)">From: </small></label>

                <input
                  type="date"
                  id="fromDate"
                  name="from_date"
                  v-model="fromDate"
                  class="form-control date-input mb-2"
                  onclick="document.getElementById('fromDate').showPicker()"
                />

                <label for="toDate"><small style="color: var(--dark)">To: </small></label>
                <input
                  type="date"
                  id="toDate"
                  name="to_date"
                  v-model="toDate"
                  class="form-control date-input"
                  onclick="document.getElementById('toDate').showPicker()"
                />
              </div>

              <div class="mt-4 d-flex justify-content-end align-items-end flex-row">
                <button type="submit" class="submit-btn">Apply</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>
