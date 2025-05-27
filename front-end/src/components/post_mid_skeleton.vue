<template>
  <div class="post-mid d-flex flex-row justify-content-evenly mb-3 mt-2">
    <div class="post-content">
      <a class="container-img"
        ><img class="pulse" :src="'/image-assets/default.jpeg'" /> alt="" /></a
      >

      <a class="post-text d-flex justify-content-start align-items-start flex-column px-3 pt-3">
        <div :class="`news-cat skel pulse d-flex justify-content-center align-items-center mb-2`">
          <p class="px-1"></p>
        </div>
        <span class="title-mid">
        <div class="textplaceholdertitle pulse"></div>
        <div class="textplaceholdertitle pulse"></div>
        <div class="textplaceholdertitle pulse"></div>
        </span
      ></a>
    </div>
    <div class="post-analytics-mid">
      <div class="likes d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined skel"> circle </span>
        <div class="textplaceholder pulse"></div>
      </div>
      <div class="post-comm d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined skel"> circle </span>
        <div class="textplaceholder pulse"></div>
      </div>
      <div class="share d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined skel"> circle </span>
        <div class="textplaceholder pulse"></div>
      </div>
      <div class="bookmark d-flex flex-column justify-content-center align-items-center mb-2">
        <span class="material-symbols-outlined skel">circle</span>
        <div class="textplaceholder pulse"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined.skel{
    color: var(--skel);
}
.news-cat.skel {
  background-color: rgb(54, 54, 54);
  height: 2vh;
  width: 6vw;
}
.textplaceholder {
  background-color: var(--skel);
  height: 1.3vh;
  width: 3vw;
  border-radius: 20px;
}
.textplaceholdertitle {
  background-color: rgb(54, 54, 54);
  height: 1.3vh;
  width: 23vw;
  margin-bottom: 0.2rem;
  border-radius: 20px;
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