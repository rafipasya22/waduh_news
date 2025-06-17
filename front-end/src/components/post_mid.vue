<script setup>
import { ref } from 'vue'

const emit = defineEmits(['toggleBookmark', 'opensharemodal', 'deletepost', 'openeditmodal'])
const props = defineProps({
  post: Object,
  bookmarked: Boolean,
  userdata: Object,
})

let authorname = ref(`${props.userdata.First_name} ${props.userdata.Last_name}`)

function handleChange(event) {
  emit('toggleBookmark', props.post)
}

function handlemodal(event) {
  emit('opensharemodal', props.post)
}

function editmodal(event) {
  emit('openeditmodal', props.post)
}

function deletepost(event) {
  emit('deletepost', props.post)
}

function newsLink(news) {
  if (props.bookmarked) {
    return `/news/baca-news/article/bookmarks/${news.category}/${encodeURIComponent(news.title)}`
  } else if (news.sourceType === 'userpost') {
    return `/news/baca-news/article/originals/${news.id}/${news.category}/${encodeURIComponent(news.title)}`
  } else if (news.sourceType === 'headline') {
    return `/news/baca-news/headline/${news.category}/${news.title}`
  } else {
    return `/news/baca-news/${news.category}/${news.title}`
  }
}

function capitalize(input) {
  if (!input) {
    return ''
  }
  return input.charAt(0).toUpperCase() + input.slice(1)
}
</script>

<template>
  <div class="post-mid d-flex flex-row justify-content-evenly mb-3 mt-2">
    <div class="post-content">
      <router-link :to="newsLink(post)" class="container-img"
        ><img :src="post.imageUrl || '/image-assets/default.jpeg'" /> alt="" /></router-link
      >

      <router-link
        :to="newsLink(post)"
        class="post-text d-flex justify-content-start align-items-start flex-column px-3 pt-3"
      >
        <div
          :class="`news-cat ${capitalize(post.category)} d-flex justify-content-center align-items-center mb-2`"
        >
          <p class="px-1">{{ capitalize(post.category) }}</p>
        </div>
        <span class="title-mid">{{ post.title }}</span></router-link
      >
    </div>
    <div
      class="post-analytics-mid d-flex flex-column justify-content-start align-items-center gap-2"
    >
      <div class="likes d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined"> favorite </span>
        <small>{{ post.total_likes }}</small>
      </div>
      <div class="post-comm d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined"> forum </span>
        <small>{{ post.total_comments }}</small>
      </div>

      <div
        v-if="post.author === authorname"
        class="share d-flex flex-column justify-content-center align-items-center mb-2"
      >
        <div class="dropdown">
          <a
            class="shr d-flex flex-column justify-content-center align-items-center"
            role="button"
            style="text-decoration: none; color: var(--dark)"
            data-bs-toggle="modal"
            @click="editmodal"
            data-bs-target="#editArticle"
            data-bs-auto-close="outside"
            ><span class="material-symbols-outlined"> edit </span>
            <small>Edit</small>
          </a>
        </div>
      </div>
      <div v-else class="share d-flex flex-column justify-content-center align-items-center mb-2">
        <div class="dropdown">
          <a
            class="shr d-flex flex-column justify-content-center align-items-center"
            role="button"
            style="text-decoration: none; color: var(--dark)"
            data-bs-toggle="modal"
            @click="handlemodal"
            data-bs-target="#shareNewsModal"
            data-bs-auto-close="outside"
            ><span class="material-symbols-outlined"> share </span>
            <small>Share</small>
          </a>
        </div>
      </div>
      <div
        v-if="post.author === authorname"
        class="bookmark d-flex flex-column justify-content-center align-items-center mb-2"
      >
        <a
          class="shr d-flex flex-column justify-content-center align-items-center"
          role="button"
          style="text-decoration: none; color: var(--dark)"
          @click="deletepost"
          ><span class="material-symbols-outlined"> delete </span>
          <small>Delete</small>
        </a>
      </div>
      <div
        v-else
        class="bookmark d-flex flex-column justify-content-center align-items-center mb-2"
      >
        <label class="bookmark-icon">
          <input type="checkbox" :checked="bookmarked" @change="handleChange" />
          <span class="material-symbols-outlined">{{
            !bookmarked ? 'bookmark' : 'bookmark_added'
          }}</span>
        </label>
        <small>{{ !bookmarked ? 'Bookmark' : 'Saved' }}</small>
      </div>
    </div>
  </div>
</template>
