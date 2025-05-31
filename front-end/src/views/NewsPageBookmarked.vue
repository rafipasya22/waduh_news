<script setup>
import Post_mid from '@/components/post_mid.vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'
import Comment_container from '@/components/comment_container.vue'
import Noti from '@/components/noti.vue'
import Skel_title from '@/components/newspage_skeleton/title_container_skeleton.vue'
import Skel_content from '@/components/newspage_skeleton/news_content_skeleton.vue'
import Skel_mid from '@/components/post_mid_skeleton.vue'
import Share_mod from '@/components/sharemodal.vue'
import { likepost } from '@/composables/like_btn.vue'
import '@/assets/style.css'
import { bookmarkpost } from '@/composables/bookmark.vue'
import { userdata } from '@/composables/get_userdata.vue'
import { analytics } from '@/composables/post_analytics.vue'
import { useRoute } from 'vue-router'
import { watch, ref, onMounted, computed, onBeforeUnmount } from 'vue'

const { getcomments, getlike, getUserInfo } = analytics()
const { userData, getUserData } = userdata()
const { bookmarkedTitles, fetchBookmarks, toggleBookmark } = bookmarkpost()
const {
  likedtitle,
  dislikedtitle,
  fetchLikes,
  fetchDislikes,
  isPostLiked,
  isPostDisliked,
  addLike,
  add_Dislike,
  removeLike,
  removeDislike,
} = likepost()

const route = useRoute()

const query = route.params.query
const title = route.params.title

const nxtNews = ref([])
const isUserLoggedIn = ref(false)
const newsList = ref([])
const comment = ref('')
const isSuccess = ref(false)
let isLoading = ref(true)
const taskMsg = ref(null)
const postComments = ref([])
const activeSort = ref('newest')
const width = ref(window.innerWidth)

const isBookmarked = computed(() => bookmarkedTitles.value.includes(title))
const postData = ref(null)

function openShareModal(post) {
  postData.value = post
  console.log('sko: ', postData.value)
}

async function fetchNxtNews() {
  const res = await fetch(`/api/ambil_nxtnews/${encodeURIComponent(query)}`)
  const data = await res.json()
  if (data.news && data.news.length > 0) {
    const randomIndex = Math.floor(Math.random() * data.news.length)
    const slicedNews = [data.news[randomIndex]]
    await getlike(slicedNews)
    await getcomments(slicedNews)
    return slicedNews.map((post) => ({ ...post, sourceType: 'headline' }))
  }
  return []
}

async function fetchComments(title) {
  try {
    const res = await fetch('/api/get_comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title }),
    })
    const data = await res.json()
    postComments.value = data.comments || []
  } catch (error) {
    console.error('Error fetching likes:', error)
    postComments.value = []
  }
}

function updateCharCount() {
  const textarea = document.getElementById('comment')
  const remaining = 1000 - textarea.value.length
  document.getElementById('charRemaining').textContent = remaining
}

function resetCharCount() {
  const textarea = document.getElementById('comment')
  const remaining = 1000
  document.getElementById('charRemaining').textContent = remaining
}

async function fetchCommentsNewest(title) {
  try {
    const res = await fetch('/api/get_comments/sorted-newest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title }),
    })
    const data = await res.json()
    postComments.value = data.comments || []
  } catch (error) {
    console.error('Error fetching likes:', error)
    postComments.value = []
  }
}

async function fetchCommentsMostLiked(title) {
  try {
    const res = await fetch('/api/get_comments/sorted-most-liked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_title: title }),
    })
    const data = await res.json()
    postComments.value = data.comments || []
  } catch (error) {
    console.error('Error fetching likes:', error)
    postComments.value = []
  }
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

async function handleRemovedComment(comment) {
  try {
    postComments.value = postComments.value.filter((c) => c.comment == comment.comment)
    await(fetchComments(title))
    taskNoti({ message: 'Comment deleted!', success: true })
  } catch (error) {
    taskNoti({ message: error, success: false })
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

async function getNews() {
  try {
    const res = await fetch(`/api/baca-news/article/bookmarks/${encodeURIComponent(title)}`)
    const data = await res.json()
    if (data.error) {
      console.error(data.error)
      return
    }
    newsList.value = data.news ? [data.news] : []
  } catch (error) {
    console.error('Gagal fetch berita:', error)
  }
}

const handleLikeClick = async (post) => {
  try {
    if (isPostLiked(post.post_title)) {
      removeLike(post.post_title)
      console.log('Post Unliked!')
      taskNoti({ message: 'Post Unliked', success: true })
    } else {
      addLike(post)

      if (isPostDisliked(post.post_title)) {
        await removeDislike(post.post_title)
        console.log('Dislike Removed!')
      }
      taskNoti({ message: 'Post liked', success: true })
    }
  } catch (err) {
    console.error(err)
    taskNoti({ message: 'Error processing your request', success: false })
  }
}

const handleDisLikeClick = async (post) => {
  try {
    if (isPostDisliked(post.post_title)) {
      removeDislike(post.post_title)
      console.log('Dislike removed!')
      taskNoti({ message: 'Dislike removed!', success: true })
    } else {
      add_Dislike(post)

      if (isPostLiked(post.post_title)) {
        await removeLike(post.post_title)
        console.log('Like Removed!')
      }
      taskNoti({ message: 'Post disliked!', success: true })
    }
  } catch (err) {
    console.error(err)
    taskNoti({ message: 'Error processing your request', success: false })
  }
}

const send_comment = async (post) => {
  try {
    const res = await fetch('/api/baca-news/add-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_title: post.title,
        post_category: post.category,
        post_source: post.source_name,
        post_comments: comment.value,
      }),
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    await fetchComments(post.title)
    comment.value = ''
    resetCharCount()
    taskNoti({ message: 'Comment sent!', success: true })
  } catch (err) {
    taskNoti({ message: 'Failed to send comment', success: false })
  }
}

const sortcomments_newest = async (title) => {
  postComments.value = []
  activeSort.value = 'newest'
  fetchCommentsNewest(title)
}

const sortcomments_oldest = async (title) => {
  postComments.value = []
  activeSort.value = 'oldest'
  fetchComments(title)
}

const sortcomments_mostliked = async (title) => {
  postComments.value = []
  activeSort.value = 'mostliked'
  fetchCommentsMostLiked(title)
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

function updateSize() {
  width.value = window.innerWidth
  console.log(width.value)
}

function copyLink(event) {
  const btn = event.currentTarget
  const input_container = btn.closest('.logos')
  const input = input_container.querySelector('#copyLinkInput').value
  navigator.clipboard.writeText(input)

  const msg_container = input_container.closest('.share-container')
  const msg = msg_container.querySelector('.text-success')
  if (!msg) {
    console.log('gaada')
  } else {
    msg.classList.remove('d-none')
    setTimeout(() => {
      msg.classList.add('d-none')
    }, 3000)
  }
}

watch(
  () => [route.params.query, route.params.title],
  async () => {
    await getNews()
  },
  { immediate: true },
)

onMounted(async () => {
  window.addEventListener('resize', updateSize)
  console.log("comment data:", postComments)
  nxtNews.value = await fetchNxtNews()
  isUserLoggedIn.value = await getUserInfo()
  await getUserData()
  await getNews()
  console.log(newsList.value[0])
  await fetchLikes(newsList.value[0].title)
  await fetchDislikes(newsList.value[0].title)
  await fetchCommentsNewest(newsList.value[0].title)
  console.log(isPostLiked(newsList.value[0].title))
  const allTitles = [...newsList.value, ...nxtNews.value].map((p) => p.title)
  fetchBookmarks(allTitles)
  isLoading.value = false
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize)
})
</script>

<template>
  <Navbar :loggedIn="isUserLoggedIn" :profilephoto="userData.ProfilePhoto" />
  <div v-if="isLoading" class="content mb-5">
    <div class="top d-flex flex-row align-items-start">
      <div class="post-big np mt-2">
        <a href="#" class="news-image"><img :src="'/image-assets/default.jpeg'" alt="" /></a>
      </div>
      <div class="sports nxt-stories np mt-2">
        <div class="title-sports d-flex flex-row justify-content-between align-items-start">
          <h3 style="font-weight: 700">Next<span style="font-weight: 400"> Stories</span></h3>
        </div>
        <Skel_mid />
      </div>
    </div>

    <Skel_title />
    <Skel_content />
    <div class="comments-container mt-4 px-4 py-3">
      <h4>Comments</h4>
      <form id="commentForm" @submit.prevent="send_comment(newsList[0])">
        <div class="comment-area">
          <textarea
            id="comment"
            name="comment"
            maxlength="1000"
            v-model="comment"
            placeholder="Write a comment....."
            @input="updateCharCount"
            required
          ></textarea>

          <div class="comment-footer mt-4">
            <div class="char-count"><b id="charRemaining">1000</b> Character Remaining</div>
            <button type="submit" class="send-btn">
              Send Comment <i class="fa-solid fa-paper-plane ms-2"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
    <div class="news-comments">
      <div
        class="news-comments-top d-flex justify-content-start align-items-start flex-column mt-3"
      >
        <div class="sorty-comments d-flex justify-content-start align-items-start flex-row mt-4">
          <button
            @click="sortcomments_newest(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'newest' ? 'active' : ''"
          >
            Newest
          </button>
          <button
            @click="sortcomments_oldest(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'oldest' ? 'active' : ''"
          >
            Oldest
          </button>
          <button
            @click="sortcomments_mostliked(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'mostliked' ? 'active' : ''"
          >
            Most Liked
          </button>
        </div>
      </div>
      <div
        class="news-comment-content d-flex justify-content-start align-items-start flex-column mt-4"
        v-if="postComments.length > 0"
      >
        <Comment_container
          v-for="comment in postComments"
          :key="comment.id"
          :comment="comment"
          :user-email="userData.Email"
          :post-title="newsList[0].title"
        />
      </div>
      <div
        class="news-comment-content d-flex justify-content-center align-items-center flex-column mt-4"
        v-else-if="postComments.length == 0"
      >
        <span class="material-symbols-outlined" style="font-size: 10rem; color: var(--grey)">
          forum
        </span>
        <small style="color: var(--grey)">No comments yet on this post</small>
        <small style="color: var(--grey)">Be the first to comment!</small>
      </div>
    </div>
    <Noti :taskStatus="isSuccess" :taskMsg="taskMsg" />
  </div>
  <div v-else class="content mb-5">
    <div class="top d-flex flex-row align-items-start">
      <div class="post-big np mt-2">
        <a href="#" class="news-image"
          ><img :src="newsList[0]?.imageUrl || '/image-assets/default.jpeg'" alt=""
        /></a>
      </div>
      <div class="sports nxt-stories np mt-2">
        <div class="title-sports d-flex flex-row justify-content-between align-items-start">
          <h3 style="font-weight: 700">Next<span style="font-weight: 400"> Stories</span></h3>
        </div>
        <Post_mid
          v-if="nxtNews"
          :post="nxtNews[0]"
          :bookmarked="bookmarkedTitles.includes(nxtNews[0].title)"
          @toggleBookmark="() => toggleBookmark(nxtNews[0], taskNoti)"
          @opensharemodal="openShareModal"
        />
      </div>
    </div>

    <div class="title-container mt-2">
      <div class="news-title d-flex justify-content-start align-items-center flex-row">
        <h2 style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
          {{ newsList[0].title }}
        </h2>
      </div>
      <div class="title-bottom d-flex justify-content-between align-items-center flex-row mt-2">
        <div class="news-details d-flex justify-content-start align-items-start flex-column">
          <h5 style="margin-bottom: 0 !important; color: var(--dark)">
            Uploaded {{ formatDate(newsList[0].publishedAt) }}
          </h5>
          <small style="color: var(--dark)">
            <i>{{ getNewsSource(newsList[0]) }}</i>
          </small>
        </div>
        <div
          v-if="width > 705"
          class="news-interactions d-flex justify-content-start align-items-start flex-row"
        >
          <div class="likebutton d-flex justify-content-center align-items-center pb-3 me-2">
            <a
              @click.prevent="
                handleLikeClick({
                  post_title: newsList[0].title,
                  post_category: newsList[0].category,
                  post_source: newsList[0].source_name,
                })
              "
              class="likebtn btn d-flex justify-content-center align-items-center"
              :class="{ pressed: isPostLiked(newsList[0].title) }"
              role="button"
              data-bs-toggle="button"
              ><span class="material-symbols-outlined me-2"> thumb_up </span>
              {{ isPostLiked(newsList[0].title) ? 'Liked' : 'Like' }}</a
            >
          </div>
          <div class="dislikebutton d-flex justify-content-center align-items-center pb-3 me-2">
            <a
              @click.prevent="
                handleDisLikeClick({
                  post_title: newsList[0].title,
                  post_category: newsList[0].category,
                  post_source: newsList[0].source_name,
                })
              "
              :class="{ pressed: isPostDisliked(newsList[0].title) }"
              class="dislikebtn btn d-flex justify-content-center align-items-center"
              role="button"
              data-bs-toggle="button"
              ><span class="material-symbols-outlined me-2"> thumb_down </span>
              {{ isPostDisliked(newsList[0].title) ? 'Disliked' : 'Dislike' }}</a
            >
          </div>
          <div class="bookmark-btn-big d-flex justify-content-center align-items-center pb-3 me-2">
            <a
              @click="toggleBookmark(newsList[0], taskNoti)"
              :class="`bookmarkbtn ${isBookmarked ? 'bookmarked' : ''} btn d-flex justify-content-center`"
              role="button"
              data-bs-toggle="button"
            >
              <span class="material-symbols-outlined me-2">
                {{ isBookmarked ? 'bookmark_added' : 'bookmark' }}
              </span>
              {{ isBookmarked ? 'Post bookmarked!' : 'Bookmark this post' }}
            </a>
          </div>
          <div class="sharebutton d-flex justify-content-center align-items-center pb-3">
            <div class="dropdown">
              <a
                class="sharebtn btn d-flex justify-content-center align-items-center dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                ><span class="material-symbols-outlined"> share </span></a
              >
              <div class="dropdown-menu p-4">
                <h2 style="font-size: 1.2rem; color: var(--dark)">Share the news!</h2>
                <div class="d-flex justify-content-between align-items-start flex-row mt-3">
                  <div class="d-flex justify-content-between align-items-start flex-column">
                    <div class="facebook me-3 mb-3" style="width: 50%">
                      <a
                        class="sharebtn btn d-flex justify-content-start align-items-center"
                        role="button"
                        data-bs-toggle="dropdown"
                        ><i class="fa-brands fa-facebook-f me-2"> </i>Facebook
                      </a>
                    </div>
                    <div class="whatsapp me-3" style="width: 50%">
                      <a
                        class="sharebtn btn d-flex justify-content-start align-items-center"
                        role="button"
                        data-bs-toggle="dropdown"
                        ><i class="fa-brands fa-whatsapp me-2"></i>WhatsApp
                      </a>
                    </div>
                  </div>
                  <div class="twitter" style="width: 50%">
                    <a
                      class="sharebtn btn d-flex justify-content-start align-items-center"
                      role="button"
                      data-bs-toggle="dropdown"
                      ><i class="fa-brands fa-x-twitter me-2"></i>X
                    </a>
                  </div>
                </div>
                <div class="copy-link-container mt-2">
                  <label for="copyLinkInput" style="font-size: 0.9rem; color: var(--dark)">
                    Or copy the link:
                  </label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      id="copyLinkInput"
                      value="{{ source_url }}"
                      readonly
                    />
                    <button class="btn btn-outline-secondary" type="button" onclick="copyLink()">
                      Copy
                    </button>
                  </div>
                  <small id="copySuccess" class="text-success mt-2 d-none">Link copied!</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="news-interactions-lite d-flex justify-content-start align-items-start flex-row"
        >
          <div class="likebutton d-flex justify-content-center align-items-center pb-3 me-2">
            <a
              @click.prevent="
                handleLikeClick({
                  post_title: newsList[0].title,
                  post_category: newsList[0].category,
                  post_source: newsList[0].source_name,
                })
              "
              class="likebtn btn d-flex justify-content-center align-items-center"
              :class="{ pressed: isPostLiked(newsList[0].title) }"
              role="button"
              data-bs-toggle="button"
              ><span class="material-symbols-outlined"> thumb_up </span></a
            >
          </div>
          <div class="dislikebutton d-flex justify-content-center align-items-center pb-3 me-2">
            <a
              @click.prevent="
                handleDisLikeClick({
                  post_title: newsList[0].title,
                  post_category: newsList[0].category,
                  post_source: newsList[0].source_name,
                })
              "
              :class="{ pressed: isPostDisliked(newsList[0].title) }"
              class="dislikebtn btn d-flex justify-content-center align-items-center"
              role="button"
              data-bs-toggle="button"
              ><span class="material-symbols-outlined"> thumb_down </span></a
            >
          </div>

          <div class="sharebutton d-flex justify-content-center align-items-center pb-3">
            <div class="dropdown">
              <a
                class="sharebtn btn d-flex justify-content-center align-items-center dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                ><span class="material-symbols-outlined"> share </span></a
              >
              <div class="dropdown-menu p-4">
                <h2 style="font-size: 1.2rem; color: var(--dark)">Share the news!</h2>
                <div class="d-flex justify-content-between align-items-start flex-row mt-3">
                  <div class="d-flex justify-content-between align-items-start flex-column">
                    <div class="facebook me-3 mb-3" style="width: 50%">
                      <a
                        class="sharebtn btn d-flex justify-content-start align-items-center"
                        role="button"
                        data-bs-toggle="dropdown"
                        ><i class="fa-brands fa-facebook-f me-2"> </i>Facebook
                      </a>
                    </div>
                    <div class="whatsapp me-3" style="width: 50%">
                      <a
                        class="sharebtn btn d-flex justify-content-start align-items-center"
                        role="button"
                        data-bs-toggle="dropdown"
                        ><i class="fa-brands fa-whatsapp me-2"></i>WhatsApp
                      </a>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-start flex-column">
                    <div class="twitter" style="width: 50%">
                      <a
                        class="sharebtn btn d-flex justify-content-start align-items-center mb-3"
                        role="button"
                        data-bs-toggle="dropdown"
                        ><i class="fa-brands fa-x-twitter me-2"></i>X
                      </a>
                    </div>
                    <div
                      class="bookmark-btn-big d-flex justify-content-start align-items-start me-2"
                    >
                      <a
                        @click="toggleBookmark(newsList[0], taskNoti)"
                        :class="`bookmarkbtn ${isBookmarked ? 'bookmarked' : ''} btn d-flex justify-content-start`"
                        role="button"
                        data-bs-toggle="button"
                      >
                        <span class="material-symbols-outlined me-2">
                          {{ isBookmarked ? 'bookmark_added' : 'bookmark' }}
                        </span>
                        {{ isBookmarked ? 'Saved!' : 'Bookmark this post' }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="copy-link-container mt-2">
                  <label for="copyLinkInput" style="font-size: 0.9rem; color: var(--dark)">
                    Or copy the link:
                  </label>
                  <div class="input-group">
                    <input
                      type="text"
                      class="form-control"
                      id="copyLinkInput"
                      value="{{ source_url }}"
                      readonly
                    />
                    <button class="btn btn-outline-secondary" type="button" onclick="copyLink()">
                      Copy
                    </button>
                  </div>
                  <small id="copySuccess" class="text-success mt-2 d-none">Link copied!</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="newspage-content mt-2">
      <p>{{ newsList[0].content }}</p>

      <small style="color: var(--dark)">Source: {{ newsList[0].source_url }}</small>
      <br />
    </div>
    <div class="share-container d-flex justify-content-start align-items-center flex-row mt-3">
      <div class="socials d-flex flex-column align-items-center justify-content-evenly me-2">
        <div class="text">Share:</div>
      </div>
      <div class="logos d-flex align-items-center">
        <a href="http://facebook.com"><i class="fa-brands fa-facebook"></i></a>
        <a href=""><i class="fa-brands fa-whatsapp"></i></a>
        <a href="http://x.com"><i class="fa-brands fa-x-twitter"></i></a>
        <input
          type="text"
          class="form-control"
          id="copyLinkInput"
          :value="newsList[0].source_url"
          readonly
          hidden
        />
        <button
          class="link-copy-btn"
          type="button"
          style="
            background-color: transparent;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          "
          @click="copyLink"
        >
          <i class="fa-solid fa-link"></i>
        </button>
      </div>
      <small id="copySuccess2" class="text-success ms-2 mt-2 d-none">Link copied!</small>
    </div>
    <div class="comments-container mt-4 px-4 py-3">
      <h4>Comments</h4>
      <form id="commentForm" @submit.prevent="send_comment(newsList[0])">
        <div class="comment-area">
          <textarea
            id="comment"
            name="comment"
            maxlength="1000"
            v-model="comment"
            placeholder="Write a comment....."
            @input="updateCharCount"
            required
          ></textarea>

          <div class="comment-footer mt-4">
            <div class="char-count"><b id="charRemaining">1000</b> Character Remaining</div>
            <button type="submit" class="send-btn">
              Send Comment <i class="fa-solid fa-paper-plane ms-2"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
    <div class="news-comments">
      <div
        class="news-comments-top d-flex justify-content-start align-items-start flex-column mt-3"
      >
        <div class="sorty-comments d-flex justify-content-start align-items-start flex-row mt-4">
          <button
            @click="sortcomments_newest(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'newest' ? 'active' : ''"
          >
            Newest
          </button>
          <button
            @click="sortcomments_oldest(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'oldest' ? 'active' : ''"
          >
            Oldest
          </button>
          <button
            @click="sortcomments_mostliked(newsList[0].title)"
            class="sort-comments"
            :class="activeSort === 'mostliked' ? 'active' : ''"
          >
            Most Liked
          </button>
        </div>
      </div>
      <div
        class="news-comment-content d-flex justify-content-start align-items-start flex-column mt-4"
        v-if="postComments.length > 0"
      >
        <Comment_container
          v-for="comment in postComments"
          :key="comment.id"
          :comment="comment"
          :user-email="userData.Email"
          :post-title="newsList[0].title"
          @comment-removed="handleRemovedComment"
        />
      </div>
      <div
        class="news-comment-content d-flex justify-content-center align-items-center flex-column mt-4"
        v-else-if="postComments.length == 0"
      >
        <span class="material-symbols-outlined" style="font-size: 10rem; color: var(--grey)">
          forum
        </span>
        <small style="color: var(--grey)">No comments yet on this post</small>
        <small style="color: var(--grey)">Be the first to comment!</small>
      </div>
    </div>
    <Noti :taskStatus="isSuccess" :taskMsg="taskMsg" />
  </div>

  <Footer />
  <Share_mod :postData="postData"/>
</template>
