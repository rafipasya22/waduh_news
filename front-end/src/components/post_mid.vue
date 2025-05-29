<script setup>
const emit = defineEmits(['toggleBookmark'])
const props = defineProps({
  post: Object,
  bookmarked: Boolean,
})

function handleChange(event) {
  emit('toggleBookmark', props.post)
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

function copyLink(event) {
  const btn = event.currentTarget
  const input_container = btn.closest('.input-group')
  const input = input_container.querySelector('#copyLinkInput').value
  navigator.clipboard.writeText(input)

  const msg_container = input_container.closest('.copy-link-container')
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
            class="shr d-flex flex-column justify-content-center align-items-center dropdown-toggle"
            role="button"
            style="text-decoration: none; color: var(--dark)"
            data-bs-toggle="dropdown"
            data-bs-auto-close="outside"
            ><span class="material-symbols-outlined"> share </span>
            <small>Share</small>
          </a>
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
                  :value="post.url"
                  readonly
                />
                <button class="btn btn-outline-secondary" type="button" @click="copyLink">
                  Copy
                </button>
              </div>
              <small id="copySuccess" class="text-success mt-2 d-none">Link copied!</small>
            </div>
          </div>
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
