<template>
    <div class="title-container mt-2">
      <div class="news-title skel d-flex justify-content-start align-items-start flex-column">
        <h2 class="pulse" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
          <p></p>
        </h2>
        <h2 class="dua pulse" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
          <p></p>
        </h2>
        <h2 class="tiga pulse" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
          <p></p>
        </h2>
      </div>
      <div class="title-bottom d-flex justify-content-between align-items-center flex-row mt-2">
        <div class="news-details skel d-flex justify-content-start align-items-start flex-column">
          <h5 class="pulse" style="margin-bottom: 0 !important; color: var(--dark)">
            <p></p>
          </h5>
          <small class="pulse" style="color: var(--dark)">
            <p></p>
          </small>
        </div>
      </div>
    </div>
</template>

<style scoped>
.news-details.skel h5 {
  background-color: var(--skel);
  width: 15vw;
  border-radius: 20px;
}

.news-details.skel small {
  background-color: var(--skel);
  margin-top: 0.13rem;
  width: 8vw;
  border-radius: 20px;
}

.news-title.skel h2 {
  background-color: var(--skel);
  width: 70vw;
  border-radius: 20px;
}

.news-title.skel .dua {
  margin-top: 0.15rem;
  background-color: var(--skel);
  width: 60vw;
  border-radius: 20px;
}

.news-title.skel .tiga {
  margin-top: 0.15rem;
  background-color: var(--skel);
  width: 40vw;
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
