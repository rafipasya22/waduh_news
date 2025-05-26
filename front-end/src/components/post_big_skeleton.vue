<template>
  <div class="post-big mt-2">
    <a class="container-img"><img class="pulse" :src="'/image-assets/default.jpeg'" /></a>
    <div :class="`news-cat skel pulse d-flex justify-content-center align-items-center mx-2 mt-2`">
      <p class="px-1"></p>
    </div>
    <div
      class="container-post-big d-flex flex-column justify-content-start align-items-start mx-2 mt-2 mb-3"
    >
      <div class="text-area-post-biog pulse">
        <a class="post-text-big skel pe-2 ps-3 justify-content-start"></a>
      </div>
      <div class="text-area-post-biog pulse">
        <a class="post-text-big skel pe-2 ps-3 justify-content-start"></a>
      </div>
      <div class="text-area-post-biog pulse">
        <a class="post-text-big skel pe-2 ps-3 justify-content-start"></a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-cat.skel {
  background-color: gainsboro;
  height: 2vh;
  width: 6vw;
}
.text-area-post-biog {
  background-color: gainsboro;
  width: 95%;
  height: 2vh;
  border-radius: 20px;
  margin-top: 0.5rem;
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
