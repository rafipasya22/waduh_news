<template>
  <div class="news-container d-flex justify-content-start align-items-start flex-column mt-4">
    <div class="placeholdertitle pulse"><p></p></div>
    <div class="placeholdertitle pulse dua"><p></p></div>
    <div :class="`news-cat pulse skel d-flex justify-content-center align-items-center my-2`">
      <p class="px-1"></p>
    </div>
  </div>
  <hr />
</template>

<style scoped>
.placeholdertitle {
  background-color: gainsboro;
  width: 15vw;
  border-radius: 20px;
}

.placeholdertitle.dua {
  margin-top: 0.2rem;
  width: 13vw;
}

.news-cat.skel {
  background-color: gainsboro;
  height: 2vh;
  width: 6vw;
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
