<template>
  <div
    class="post-long d-flex justify-content-start align-items-start flex-row p-1 mb-3"
  >
    <div class="post-image">
      <a class="container-img">
        <img class="pulse" :src="'/image-assets/default.jpeg'"/>
      </a>
    </div>
    <div class="post-content d-flex justify-content-between align-items-start flex-column">
      <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
        <a class="post-text-long">
          <div class="placeholdertext title pulse"></div>
          <div class="placeholdertext title pulse"></div>
          <div class="placeholdertext title pulse"></div>
        </a>
        <small class="news-long-upload-date"></small>
        <small class="news-long-reporter">
          <div class="placeholdertext pulse"></div>
        </small>
        <div :class="['categories-long', 'news-cat', 'mt-2']">
          <div class="cat-text skel pulse px-1">
            <p class="px-1"></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-long{
    width: 100%;
}

.cat-text.skel{
    background-color: var(--skel);
    border-radius: 20px;
    width: 8vw;
    height: 1.5vh;
}

.placeholdertext{
    background-color: var(--skel);
    border-radius: 20px;
    width: 10vw;
    height: 1.5vh;
}

.placeholdertext.title{
    margin-bottom: 1rem;
    width: 32vw;
    height: 2.2vh;
}

.post-image{
    width: 40%;
}

.pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
