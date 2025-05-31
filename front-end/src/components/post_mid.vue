<script setup>
const emit = defineEmits(['toggleBookmark', 'opensharemodal'])
const props = defineProps({
  post: Object,
  bookmarked: Boolean,
})

function handleChange(event) {
  emit('toggleBookmark', props.post)
}

function handlemodal(event){
  emit('opensharemodal', props.post)
}

function newsLink(news) {
  if (props.bookmarked) {
    return `/news/baca-news/article/bookmarks/${news.category}/${encodeURIComponent(news.title)}`
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
      <div class="share d-flex flex-column justify-content-center align-items-center mb-2">
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
      <div class="bookmark d-flex flex-column justify-content-center align-items-center mb-2">
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
