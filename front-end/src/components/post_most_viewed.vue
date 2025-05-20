<template>
  <div class="news-container d-flex justify-content-start align-items-center flex-row mt-4">
    <div class="number">
      <h2>{{ post_number + 1 }}</h2>
    </div>
    <div class="news-content ms-4">
      <div class="title">
        <a href=""><h5>{{ post.title }}</h5></a>
      </div>
      <div :class="`news-cat ${capitalize(post.category)} d-flex justify-content-center align-items-center my-2`">
        <p class="px-1">{{ capitalize(post.category) }}</p>
      </div>
    </div>
  </div>
  <hr>
</template>

<script setup>
defineProps({
  post: Object,
  post_number: Number
})

function capitalize(input) {
  if (!input) {
    return '';
  }
  return input.charAt(0).toUpperCase()+input.slice(1);
}
</script>
