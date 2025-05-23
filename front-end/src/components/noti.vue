<script setup>
const props = defineProps({
  taskStatus: Boolean,
  taskMsg: String,
})

</script>

<template>
    <div class="noti shadow d-flex justify-content-start align-items-start flex-row gap-2 p-4">
    <div v-if="taskStatus == true" class="noti-left d-flex justify-content-center align-items-center">
      <span class="material-symbols-outlined" style="color: rgb(5, 136, 0) !important;"> check_circle </span>
    </div>
    <div v-else class="noti-left d-flex justify-content-center align-items-center">
      <span class="material-symbols-outlined" style="color: rgb(142, 0, 0) !important;"> cancel </span>
    </div>
    <div class="noti-right d-flex justify-content-start align-items-center">{{ taskMsg }}</div>
  </div>
</template>