<template>
  <div class="newspage-content skel mt-2">
    <h2 class="pulse" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse dua" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse tiga" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse empat" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse lime" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse enam" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse tujuh" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
    <h2 class="pulse delapan" style="color: var(--dark); font-size: clamp(20px, 2vw, 50px)">
      <p></p>
    </h2>
  </div>
</template>

<style scoped>
.newspage-content.skel h2{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 65vw;
  border-radius: 20px;
}

.newspage-content.skel .dua{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 60vw;
  border-radius: 20px;
}

.newspage-content.skel .tiga{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 70vw;
  border-radius: 20px;
}

.newspage-content.skel .empat{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 75vw;
  border-radius: 20px;
}

.newspage-content.skel .lime{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 75vw;
  border-radius: 20px;
}

.newspage-content.skel .enam{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 60vw;
  border-radius: 20px;
}

.newspage-content.skel .tujuh{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 55vw;
  border-radius: 20px;
}

.newspage-content.skel .delapan{
  background-color: var(--skel);
  color: var(--skel);
  height: 1.2rem;
  width: 50vw;
  border-radius: 20px;
}


.newspage-content.skel{
  padding-top: 1px;
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
