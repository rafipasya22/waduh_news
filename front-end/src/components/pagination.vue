<template>
  <ul class="pageination">
    <li v-for="page in totalPages" :key="page" class="page-item">
      <button
        class="page-link number"
        :class="{ active: page === currentPage }"
        @click="changePage(page)"
      >
        {{ page }}
      </button>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  totalPages: Number,
  currentPage: Number,
})

const emit = defineEmits(['page-changed'])

function changePage(page) {
  emit('page-changed', page)
}
</script>
