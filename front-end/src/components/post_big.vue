<script setup>
const emit = defineEmits(['toggleBookmark'])
const props = defineProps({
  post: Object,
  bookmarked: Boolean,
})

function handleChange(event) {
  emit('toggleBookmark', props.post)
}

function newsLink(news){
  if(news.sourceType === 'headline'){
    return `/news/baca-news/headline/${news.category}/${news.title}`
  }else{
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
  <div class="post-big mt-2">
    <router-link :to="newsLink(post)" class="container-img"
      ><img :src="post.imageUrl || '/image-assets/default.jpeg'"
    /></router-link>
    <div
      :class="`news-cat ${capitalize(post.category)} d-flex justify-content-center align-items-center mx-2 mt-2`"
    >
      <p class="px-1">{{ capitalize(post.category) }}</p>
    </div>
    <div class="container-post-big d-flex flex-row justify-content-evenly align-items-center">
      <div  class="text-area-post-biog">
        <router-link :to="newsLink(post)" class="post-text-big pe-2 ps-3 justify-content-start">{{ post.title }}</router-link>
      </div>
      <div class="buttonandanalytics">
        <div class="post-analytics-big d-flex flex-row justify-content-evenly align-items-center">
          <div class="post-comm d-flex flex-row justify-content-center align-items-center mb-2">
            <span class="material-symbols-outlined"> forum </span>
            <small>{{ post.total_comments }}</small>
          </div>
          <div class="share d-flex flex-row justify-content-center align-items-center mb-2">
            <span class="material-symbols-outlined"> share </span>
            <small>1.3K</small>
          </div>
          <div class="likes d-flex flex-row justify-content-center align-items-center mb-2">
            <span class="material-symbols-outlined"> favorite </span>
            <small>{{ post.total_likes }}</small>
          </div>
        </div>
        <div class="bookmark-btn-big d-flex justify-content-center align-items-center pb-3">
          <a
            @click.prevent="handleChange"
            :class="`bookmarkbtn ${ bookmarked ? 'bookmarked' : '' } btn d-flex justify-content-center`"
            role="button"
            data-bs-toggle="button"
            ><span class="material-symbols-outlined me-2">{{
              bookmarked ? 'bookmark_added' : 'bookmark'
            }}</span
            >{{ bookmarked ? 'Post bookmarked!' : 'Bookmark this post' }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<!--
<div class="todays-headline">
    <div class="headline-title">
      <h3 class="Headline-top">Todays</h3>
      <h2 class="Headline-bottom">Headline</h2>
    </div>
    <div class="top d-flex flex-row align-items-start">
      <div class="sports mt-2">
        <div class="title-sports d-flex flex-row justify-content-between align-items-start">
          <h3>Sports News</h3>
          <a class="seeall" href="/news/category/sports">See all</a>
        </div>
        <div class="sports-container d-flex justify-content-start align-items-center">
          <div class="post-mid d-flex flex-row justify-content-evenly mb-3 mt-2">
            <div class="post-content">
              <a href="" class="container-img"
                ><img src="../static/Assets/img/default.jpeg" alt=""
              /></a>

              <a
                href=""
                class="post-text d-flex justify-content-start align-items-start flex-column px-3 pt-3"
              >
                <div class="news-cat d-flex justify-content-center align-items-center mb-2">
                  <p class="px-1"></p>
                </div>
                <span class="title-mid"></span
              ></a>
            </div>
            <div class="post-analytics-mid">
              <div class="views d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> visibility </span>
                <small>1.3K</small>
              </div>
              <div class="share d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> share </span>
                <small>1.3K</small>
              </div>
              <div class="likes d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> favorite </span>
                <small>Loading</small>
              </div>
              <div
                class="bookmark d-flex flex-column justify-content-center align-items-center mb-2"
              >
                <label class="bookmark-icon">
                  <input type="checkbox" />
                  <span class="material-symbols-outlined">bookmark</span>
                </label>
                <small>Bookmark</small>
              </div>
            </div>
          </div>
          <div class="post-mid d-flex flex-row justify-content-evenly mb-3 mt-2">
            <div class="post-content">
              <a href="" class="container-img"
                ><img src="../static/Assets/img/default.jpeg" alt=""
              /></a>

              <a
                href="#"
                class="post-text d-flex justify-content-start align-items-start flex-column px-3 pt-3 px-3 pt-3"
              >
                <div class="news-cat d-flex justify-content-center align-items-center mb-2">
                  <p class="px-1"></p>
                </div>
                <span class="title-mid"></span>
              </a>
            </div>
            <div class="post-analytics-mid">
              <div class="views d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> visibility </span>
                <small>1.3K</small>
              </div>
              <div class="share d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> share </span>
                <small>1.3K</small>
              </div>
              <div class="likes d-flex flex-column justify-content-center align-items-center mb-2">
                <span class="material-symbols-outlined"> favorite </span>
                <small>Loading</small>
              </div>
              <div
                class="bookmark d-flex flex-column justify-content-center align-items-center mb-2"
              >
                <label class="bookmark-icon">
                  <input type="checkbox" />
                  <span class="material-symbols-outlined">bookmark</span>
                </label>
                <small>Bookmark</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


-->
