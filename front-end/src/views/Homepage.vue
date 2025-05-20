<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import Post_big from '@/components/post_big.vue'
import Post_mid from '@/components/post_mid.vue'
import '@/assets/style.css'
import { bookmarkpost } from '@/composables/bookmark.vue'
import { analytics } from '@/composables/post_analytics.vue'
import { userdata } from '@/composables/get_userdata.vue'

const { bookmarkedTitles, fetchBookmarks, toggleBookmark } = bookmarkpost()
const { userData, getUserData } = userdata()
const { getlike, getcomments, getUserInfo } = analytics()

const headlinePost = ref(null)
const sportsPosts = ref([])
const popularPosts = ref([])

const isUserLoggedIn = ref(false)

async function fetchHeadlineNews() {
  const res = await fetch('/api/ambil_news')
  const data = await res.json()
  if (data.news && data.news.length > 0) {
    const slicedNews = data.news.slice(0, 1)
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post, sourceType: 'headline' }))
  }
  return []
}

async function fetchSportsNews() {
  const res = await fetch('/api/ambil_news/sports')
  const data = await res.json()
  if (data.news && data.news.length > 0) {
    const slicedNews = data.news.slice(0, 2)
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post, sourceType: 'headline' }))
  }
  return []
}

async function fetchPopularNews() {
  const res = await fetch('/api/ambil_news/popular')
  const data = await res.json()
  if (data.news && data.news.length > 0) {
    const slicedNews = data.news.slice(0, 3)
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post, sourceType: 'not_headline' }))
  }
  return []
}

onMounted(async () => {
  isUserLoggedIn.value = await getUserInfo()
  const isloggedin = isUserLoggedIn.value;
  await getUserData()
  console.log(isloggedin);
  headlinePost.value = await fetchHeadlineNews()
  console.log("post",headlinePost.value)
  sportsPosts.value = await fetchSportsNews()

  popularPosts.value = await fetchPopularNews()
  console.log('Fetched headl posts:', headlinePost.value)

  const allTitles = [...headlinePost.value, ...sportsPosts.value, ...popularPosts.value].map(
    (p) => p.title,
  )
  await fetchBookmarks(allTitles)
})
</script>

<template>
  <Navbar :loggedIn="isUserLoggedIn" :profilephoto="userData.ProfilePhoto"/>
  <div class="content mb-5">
    <div class="todays-headline">
      <div class="headline-title">
        <h3 class="Headline-top">Todays</h3>
        <h2 class="Headline-bottom">Headline</h2>
      </div>
      <div class="top d-flex flex-row align-items-start">
        <Post_big
          v-if="headlinePost"
          :post="headlinePost[0]"
          :bookmarked="bookmarkedTitles.includes(headlinePost[0].title)"
          @toggleBookmark="() => toggleBookmark(headlinePost[0])"
        />
        <div class="sports mt-2">
          <div class="title-sports d-flex flex-row justify-content-between align-items-start">
            <h3>Sports News</h3>
            <a class="seeall" href="/news/category/sports">See all</a>
          </div>
          <div class="sports-container d-flex justify-content-start align-items-center">
            <Post_mid
              v-for="(post, index) in sportsPosts.slice(0, 2)"
              :key="index"
              :post="post"
              :bookmarked="bookmarkedTitles.includes(post.title)"
              @toggleBookmark="toggleBookmark"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="popular mt-5">
      <div class="popular-title d-flex">
        <h3 class="popular-top">Popular</h3>
      </div>
      <div class="top d-flex flex-row align-items-start">
        <div class="popular-mid mt-2">
          <Post_mid
            v-for="(post, index) in popularPosts.slice(1, 3)"
            :key="index"
            :post="post"
            :bookmarked="bookmarkedTitles.includes(post.title)"
            @toggleBookmark="() => toggleBookmark(post)"
          />
        </div>
        <Post_big
          v-if="popularPosts[0]"
          :post="popularPosts[0]"
          :bookmarked="bookmarkedTitles.includes(popularPosts[0].title)"
          @toggleBookmark="() => toggleBookmark(popularPosts[0])"
        />
      </div>
    </div>
  </div>

  <Footer></Footer>
</template>
