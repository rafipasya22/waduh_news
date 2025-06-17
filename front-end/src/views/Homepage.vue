<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import Post_big from '@/components/post_big.vue'
import Post_mid from '@/components/post_mid.vue'
import Noti from '@/components/noti.vue'
import Skel from '@/components/post_big_skeleton.vue'
import Skel_mid from '@/components/post_mid_skeleton.vue'
import Share_mod from '@/components/sharemodal.vue'
import '@/assets/style.css'
import { bookmarkpost } from '@/composables/bookmark.vue'
import { analytics } from '@/composables/post_analytics.vue'
import { userdata } from '@/composables/get_userdata.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const { bookmarkedTitles, fetchBookmarks, toggleBookmark } = bookmarkpost(router)
const { userData, getUserData } = userdata()
const { getlike, getcomments, getUserInfo } = analytics()

const headlinePost = ref(null)
const sportsPosts = ref([])
const popularPosts = ref([])
const recoPosts = ref([])
const recoPosts2 = ref([])
const thisWeekPosts = ref([])
const userMadePosts = ref([])
const isSuccess = ref(false)
const taskMsg = ref(null)
let isLoading = ref(true)
const isUserLoggedIn = ref(false)
const postData = ref(null)
const preferredTopics = ref([])
const userBookmarkCount = ref(null)

function openShareModal(post) {
  postData.value = post
  console.log('sko: ', postData.value)
}

async function fetchUserPref() {
  const res = await fetch('/api/user-preferences')
  const data = await res.json()
  if (!data.preferred_topics & (data.preferred_topics.length == 0)) {
    preferredTopics.value = []
  }
  preferredTopics.value = data.preferred_topics || []
}

async function getUserbookmarksCount() {
  const res = await fetch('/api/user-bookmarks')
  const data = await res.json()
  if (!data.total_items & (data.total_items.length == 0)) {
    userBookmarkCount.value = ''
  }
  userBookmarkCount.value = data.total_items || ''
}

async function fetchNews() {
  const res = await fetch('/api/homepage_news')
  const data = await res.json()
  if (!res.ok) throw new Error('Failed to fetch news')
  const HeadlineNews = data.headlineNews.news.slice(0, 10)
  const PopularNews = data.popularNews.news.slice(0, 3)
  const SportsNews = data.sportsNews.news.slice(0, 3)
  const RecoNews = data.newsReco.news.slice(0, 3)
  const RecoActv = data.newsRecoActv.news.slice(0, 5)
  const ThisweekNews = data.newsThisWeek.news.slice(0, 7)

  const homeNews = [
    ...HeadlineNews.map((post) => ({ ...post, sourceType: 'headline' })),
    ...PopularNews.map((post) => ({ ...post, sourceType: 'not_headline' })),
    ...SportsNews.map((post) => ({ ...post, sourceType: 'headline' })),
    ...RecoNews.map((post) => ({ ...post, sourceType: 'headline' })),
    ...RecoActv.map((post) => ({ ...post, sourceType: 'not_headline' })),
    ...ThisweekNews.map((post) => ({ ...post, sourceType: 'not_headline' })),
  ]

  await Promise.all([getlike(homeNews), getcomments(homeNews)])

  headlinePost.value = HeadlineNews.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  popularPosts.value = PopularNews.map((post) => ({
    ...post,
    sourceType: 'not_headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  sportsPosts.value = SportsNews.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  recoPosts.value = RecoNews.map((post) => ({
    ...post,
    sourceType: 'headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  recoPosts2.value = RecoActv.map((post) => ({
    ...post,
    sourceType: 'not_headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
  thisWeekPosts.value = ThisweekNews.map((post) => ({
    ...post,
    sourceType: 'not_headline',
    total_likes: homeNews.find((p) => p.title === post.title)?.total_likes || 0,
    total_comments: homeNews.find((p) => p.title === post.title)?.total_comments || 0,
  }))
}

async function getUserMadePosts(){
  const res = await fetch(`/api/get-user-articles`)
  const data = await res.json()
  if (data.posts && data.posts.length > 0) {
    const slicedNews = data.posts.slice(0,3)
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post, sourceType: 'userpost' }))
  }
  return []
}

function taskNoti({ message, success }) {
  taskMsg.value = message
  isSuccess.value = success
  const noti = document.querySelector('.noti')
  noti.classList.add('show')
  setTimeout(() => {
    noti.classList.remove('show')
  }, 3000)
}

onMounted(async () => {
  isUserLoggedIn.value = await getUserInfo()
  console.log(recoPosts2.value)
  const isloggedin = isUserLoggedIn.value
  await getUserData()
  console.log(isloggedin)
  await fetchNews()
  userMadePosts.value = await getUserMadePosts()
  console.log('headline:', headlinePost.value)
  console.log('sports: ', sportsPosts.value)
  console.log('popular: ', popularPosts.value)
  console.log('reco: ', recoPosts.value)
  console.log('recoActv: ', recoPosts2.value)
  console.log('usermade:', userMadePosts.value)
  if (isloggedin) {
    await fetchUserPref()
    await getUserbookmarksCount()
    const allTitles = [...headlinePost.value, ...sportsPosts.value, ...popularPosts.value].map(
      (p) => p.title,
    )
    await fetchBookmarks(allTitles)
    console.log('prefs', userBookmarkCount.value)
  }

  console.log('Fetched headl posts:', headlinePost.value)
  console.log('Nothing:', popularPosts.value)
  isLoading.value = false
})
</script>

<template>
  <Navbar :loggedIn="isUserLoggedIn" :profilephoto="userData.ProfilePhoto" @notify="taskNoti" />
  <div class="content mb-5">
    <div class="todays-headline">
      <div class="headline-title">
        <h3 class="Headline-top">Todays</h3>
        <h2 class="Headline-bottom">Headlines</h2>
      </div>
      <div v-if="isLoading" class="top d-flex flex-column align-items-start">
        <div class="post-big-container">
          <Skel class="headline" />
        </div>
        <div class="top reco" style="overflow-x: auto; width: 100%">
          <div class="d-flex flex-row align-items-start" style="min-width: max-content">
            <Skel_mid v-for="x in 5" :key="x" />
          </div>
        </div>
      </div>
      <div v-else class="top d-flex flex-column align-items-start" style="overflow-x: hidden">
        <div class="post-big-container">
          <Post_big
            v-if="headlinePost"
            class="headline"
            :post="headlinePost[0]"
            :bookmarked="bookmarkedTitles.includes(headlinePost[0].title)"
            :userdata="userData"
            @toggleBookmark="() => toggleBookmark(headlinePost[0], taskNoti)"
            @opensharemodal="openShareModal"
          />
        </div>
        <div class="top reco" style="overflow-x: auto; width: 100%">
          <div class="d-flex flex-row align-items-start" style="min-width: max-content">
            <Post_mid
              v-for="(post, index) in headlinePost.slice(1, 6)"
              :key="index"
              :post="post"
              :bookmarked="bookmarkedTitles.includes(post.title)"
              :userdata="userData"
              @toggleBookmark="toggleBookmark(post, taskNoti)"
              @opensharemodal="openShareModal"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="popular mt-5">
      <div class="popular-title d-flex">
        <div class="headline-title">
          <h3 class="Headline-top">Popular</h3>
          <h2 class="Headline-bottom">Headliners</h2>
        </div>
      </div>
      <div v-if="isLoading" class="top d-flex flex-row align-items-start">
        <div class="popular-mid mt-2">
          <Skel_mid v-for="x in 2" :key="x" />
        </div>
        <Skel />
      </div>
      <div v-else class="top d-flex flex-row align-items-start">
        <div class="popular-mid mt-2">
          <Post_mid
            v-for="(post, index) in popularPosts.slice(1, 3)"
            :key="index"
            :post="post"
            :bookmarked="bookmarkedTitles.includes(post.title)"
            :userdata="userData"
            @toggleBookmark="() => toggleBookmark(post, taskNoti)"
            @opensharemodal="openShareModal"
          />
        </div>
        <Post_big
          v-if="popularPosts[0]"
          :post="popularPosts[0]"
          :bookmarked="bookmarkedTitles.includes(popularPosts[0].title)"
          :userdata="userData"
          @toggleBookmark="() => toggleBookmark(popularPosts[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>
    <div class="thisweek mt-5">
      <div class="headline-title">
        <h3 class="Headline-top">What Happened</h3>
        <h2 class="Headline-bottom">This Week?</h2>
      </div>

      <div
        v-if="isLoading"
        class="top reco d-flex flex-row align-items-start"
        style="overflow-x: scroll"
      >
        <Skel_mid v-for="x in 7" :key="x" />
      </div>
      <div v-else class="top reco d-flex flex-row align-items-start" style="overflow-x: scroll">
        <Post_mid
          v-for="(post, index) in thisWeekPosts.slice(0, 7)"
          :key="index"
          :post="post"
          :bookmarked="bookmarkedTitles.includes(post.title)"
          :userdata="userData"
          @toggleBookmark="toggleBookmark(post, taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>
    <div class="sports-headline mt-5">
      <div class="headline-title">
        <h3 class="Headline-top">Sports</h3>
        <h2 class="Headline-bottom">Headliners</h2>
      </div>
      <div v-if="isLoading" class="top d-flex flex-row align-items-start">
        <Skel />
        <div class="sports mt-2">
          <div class="sports-container d-flex justify-content-start align-items-center">
            <Skel_mid v-for="x in 2" :key="x" />
          </div>
        </div>
      </div>
      <div v-else class="top d-flex flex-row align-items-start">
        <Post_big
          v-if="sportsPosts"
          :post="sportsPosts[0]"
          :bookmarked="bookmarkedTitles.includes(sportsPosts[0].title)"
          :userdata="userData"
          @toggleBookmark="() => toggleBookmark(sportsPosts[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
        <div class="sports mt-2">
          <div class="sports-container d-flex justify-content-start align-items-center">
            <Post_mid
              v-for="(post, index) in sportsPosts.slice(1, 3)"
              :key="index"
              :post="post"
              :bookmarked="bookmarkedTitles.includes(post.title)"
              :userdata="userData"
              @toggleBookmark="toggleBookmark(post, taskNoti)"
              @opensharemodal="openShareModal"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="userpost-headline mt-5">
      <div class="headline-title">
        <h3 class="Headline-top">WaduhNews</h3>
        <h2 class="Headline-bottom">Originals</h2>
      </div>
      <div v-if="isLoading" class="top d-flex flex-row align-items-start">
        <Skel />
        <div class="sports mt-2">
          <div class="sports-container d-flex justify-content-start align-items-center">
            <Skel_mid v-for="x in 2" :key="x" />
          </div>
        </div>
      </div>
      <div v-else class="top d-flex flex-row align-items-start">
        <Post_big
          v-if="userMadePosts"
          :post="userMadePosts[0]"
          :bookmarked="bookmarkedTitles.includes(userMadePosts[0].title)"
          :userdata="userData"
          @toggleBookmark="() => toggleBookmark(userMadePosts[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
        <div class="sports mt-2">
          <div class="sports-container d-flex justify-content-start align-items-center">
            <Post_mid
              v-for="(post, index) in userMadePosts.slice(1, 3)"
              :key="index"
              :post="post"
              :bookmarked="bookmarkedTitles.includes(post.title)"
              :userdata="userData"
              @toggleBookmark="toggleBookmark(post, taskNoti)"
              @opensharemodal="openShareModal"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="prefnews popular mt-5" :class="preferredTopics.length > 0 ? 'show' : 'd-none'">
      <div class="headline-title">
        <h3 class="Headline-top">Based</h3>
        <h2 class="Headline-bottom">On your preferences</h2>
      </div>
      <div v-if="isLoading" class="top d-flex flex-row align-items-start">
        <div class="popular-mid mt-2">
          <Skel_mid v-for="x in 2" :key="x" />
        </div>
        <Skel />
      </div>
      <div v-else class="top d-flex flex-row align-items-start">
        <div class="popular-mid mt-2">
          <Post_mid
            v-for="(post, index) in recoPosts.slice(1, 3)"
            :key="index"
            :post="post"
            :bookmarked="bookmarkedTitles.includes(post.title)"
            :userdata="userData"
            @toggleBookmark="() => toggleBookmark(post, taskNoti)"
            @opensharemodal="openShareModal"
          />
        </div>
        <Post_big
          v-if="recoPosts[0]"
          :post="recoPosts[0]"
          :bookmarked="bookmarkedTitles.includes(recoPosts[0].title)"
          :userdata="userData"
          @toggleBookmark="() => toggleBookmark(recoPosts[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>
    <div class="recomended mt-5" :class="userBookmarkCount > 0 ? 'show' : 'd-none'">
      <div class="headline-title">
        <h3 class="Headline-top">Based</h3>
        <h2 class="Headline-bottom">on your activities</h2>
      </div>

      <div
        v-if="isLoading"
        class="top reco d-flex flex-row align-items-start"
        style="overflow-x: scroll"
      >
        <Skel_mid v-for="x in 5" :key="x" />
      </div>
      <div v-else class="top reco d-flex flex-row align-items-start" style="overflow-x: scroll">
        <Post_mid
          v-for="(post, index) in recoPosts2.slice(0, 5)"
          :key="index"
          :post="post"
          :bookmarked="bookmarkedTitles.includes(post.title)"
          :userdata="userData"
          @toggleBookmark="toggleBookmark(post, taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>
    <Noti :taskStatus="isSuccess" :taskMsg="taskMsg" />
    <Share_mod :postData="postData" />
  </div>

  <Footer></Footer>
</template>
